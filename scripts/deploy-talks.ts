// Deploys the built class to the Alto app "talks" at https://<hostname><basePath>/.
// The talks repo holds only this site: every deploy replaces its contents with deploy/talks/ plus dist/.
// --dry-run stages into .talks-build/app and runs Alto's build there instead of cloning, pushing and deploying.
import { spawn } from "node:child_process";
import { cp, mkdir, mkdtemp, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, relative, resolve } from "node:path";
import { classConfig } from "../src/class-config.js";

const dryRun = process.argv.includes("--dry-run");
const remote = process.env.TALKS_REMOTE || "https://git.workos.cloud/talks.git";
const talk = classConfig.basePath.slice(1);
const siteUrl = `https://${classConfig.hostname}${classConfig.basePath}/`;
const MiB = 1024 ** 2;
const limits = { files: 2_000, fileBytes: 10 * MiB, totalBytes: 25 * MiB };
const fallbackIdentity = { "user.name": "Beyond Done deploy", "user.email": "beyond-done-deploy@talks.workos.cloud" };

function run(command: string, args: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv; capture?: boolean } = {}): Promise<string> {
  return new Promise((done, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd, env: options.env ?? process.env,
      stdio: [options.capture ? "ignore" : "inherit", options.capture ? "pipe" : "inherit", "inherit"],
    });
    let output = "";
    child.stdout?.on("data", chunk => { output += chunk; });
    child.on("error", reject);
    // Name only the subcommand: arguments may include a remote URL with credentials.
    child.on("exit", (code, signal) => code === 0 ? done(output.trim()) : reject(new Error(`${command} ${args[0]} failed (${signal ?? code}).`)));
  });
}

const git = (args: string[], cwd?: string) => run("git", args, { cwd, capture: true });

async function repository(): Promise<string> {
  if (dryRun) {
    const app = resolve(".talks-build/app");
    await rm(app, { recursive: true, force: true });
    await mkdir(app, { recursive: true });
    await git(["init", "-q", "-b", "main"], app);
    return app;
  }
  const app = process.env.TALKS_STAGING_DIR ? resolve(process.env.TALKS_STAGING_DIR) : await mkdtemp(join(tmpdir(), "talks-"));
  console.log(`Cloning the talks repo into ${app}`);
  try {
    await run("git", ["clone", "-q", remote, app]);
  } catch {
    throw new Error(`Could not clone ${remote.replace(/\/\/[^/@]*@/, "//")}. Run \`alto login\` and \`alto auth setup-git --host https://git.workos.cloud\`, then retry.`);
  }
  // Alto deploys main. An empty clone has no branch yet; point it at main before the first commit.
  if (!(await git(["rev-parse", "-q", "--verify", "HEAD"], app).catch(() => ""))) await git(["symbolic-ref", "HEAD", "refs/heads/main"], app);
  else if (await git(["symbolic-ref", "--short", "HEAD"], app) !== "main") throw new Error(`The talks repo at ${app} is not on main.`);
  return app;
}

async function stage(app: string, revision: string) {
  for (const entry of await readdir(app)) if (entry !== ".git") await rm(join(app, entry), { recursive: true, force: true });
  await cp("deploy/talks", app, { recursive: true });
  await cp("dist", join(app, "public", talk), { recursive: true });
  await writeFile(join(app, "public", talk, "revision.txt"), `${revision}\n`);

  const files = (await readdir(join(app, "public"), { recursive: true, withFileTypes: true })).filter(entry => entry.isFile());
  let totalBytes = 0;
  for (const file of files) {
    const path = join(file.parentPath, file.name);
    const { size } = await stat(path);
    if (size > limits.fileBytes) throw new Error(`${relative(app, path)} is ${(size / MiB).toFixed(1)} MiB; Alto allows 10 MiB per file.`);
    totalBytes += size;
  }
  if (files.length > limits.files) throw new Error(`public/ has ${files.length} files; Alto allows ${limits.files}.`);
  if (totalBytes > limits.totalBytes) throw new Error(`public/ is ${(totalBytes / MiB).toFixed(1)} MiB; Alto allows 25 MiB.`);
  return { files: files.length, totalBytes };
}

async function commit(app: string, message: string) {
  await git(["add", "-A"], app);
  if (!(await git(["status", "--porcelain"], app))) {
    console.log("Nothing changed in the talks repo; skipping the commit.");
    return;
  }
  const options: string[] = dryRun ? ["-c", "commit.gpgsign=false"] : [];
  for (const [key, value] of Object.entries(fallbackIdentity)) {
    if (!(await git(["config", "--get", key], app).catch(() => ""))) options.push("-c", `${key}=${value}`);
  }
  await git([...options, "commit", "-q", "-m", message], app);
  console.log(`Committed "${message}" in the talks repo.`);
}

// Alto's build, with npm and Wrangler state kept inside .talks-build/.
async function altoBuild(app: string) {
  const scratch = resolve(".talks-build");
  const env = {
    ...process.env,
    HOME: join(scratch, "home"), TMPDIR: join(scratch, "tmp"), XDG_CONFIG_HOME: join(scratch, "home", ".config"),
    npm_config_cache: join(scratch, "npm-cache"), npm_config_update_notifier: "false",
    WRANGLER_LOG_PATH: join(scratch, "wrangler-logs"), WRANGLER_SEND_METRICS: "false", WRANGLER_SEND_ERROR_REPORTS: "false",
    // Use this Node's npm directly rather than a version-manager shim that reads HOME.
    PATH: `${dirname(process.execPath)}${delimiter}${process.env.PATH ?? ""}`,
  };
  await mkdir(env.TMPDIR, { recursive: true });
  await mkdir(env.XDG_CONFIG_HOME, { recursive: true });
  await run("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: app, env });
  await run("npm", ["run", "build"], { cwd: app, env });
  await run(join(app, "node_modules", ".bin", "wrangler"), ["deploy", "--dry-run", "--outfile", ".alto-bundle/worker.bundle"], { cwd: app, env });
  return join(app, ".alto-bundle", "worker.bundle");
}

async function waitForRevision(expected: string) {
  const url = `${siteUrl}revision.txt`;
  const deadline = Date.now() + 60_000;
  let last = "no response";
  for (;;) {
    try {
      // Anonymous (no cookies), uncached, and bounded.
      const response = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(10_000) });
      const body = (await response.text()).trim();
      if (response.status === 200 && body === expected) return;
      last = `HTTP ${response.status}${response.headers.get("location") ? ` → ${response.headers.get("location")}` : ""}: ${body.slice(0, 200) || "(empty body)"}`;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    if (Date.now() >= deadline) throw new Error(`${url} did not serve ${expected} within 60 seconds. Last response: ${last}`);
    await new Promise(done => setTimeout(done, 3_000));
  }
}

async function main() {
  const dirty = async () => Boolean(await git(["status", "--porcelain"]));
  const sha = await git(["rev-parse", "HEAD"]);
  if (await dirty()) {
    if (!dryRun) throw new Error("The working tree has uncommitted or untracked changes. Commit or stash them so the deploy ships a commit.");
    console.warn(`Warning: the working tree is dirty. Staging it as ${sha}-dirty.`);
  }
  await run("pnpm", ["build"]);
  if (!dryRun && await dirty()) throw new Error("pnpm build changed tracked files (for example a slide QR code). Commit them, then deploy again.");
  const revision = await dirty() ? `${sha}-dirty` : sha;

  const app = await repository();
  const { files, totalBytes } = await stage(app, revision);
  await commit(app, `Deploy ${classConfig.slug} ${revision.slice(0, 7)}${revision.endsWith("-dirty") ? "-dirty" : ""}`);

  if (dryRun) {
    const bundle = await altoBuild(app);
    await stat(bundle);
    console.log(`Dry run OK: ${files} files, ${(totalBytes / MiB).toFixed(2)} MiB in public/ (limits ${limits.files} files, 25 MiB). Bundle: ${relative(process.cwd(), bundle)}. Nothing was pushed or deployed.`);
    return;
  }
  await run("alto", ["deploy", "talks", "--push", "--timeout", "10m"], { cwd: app });
  console.log(`Waiting for ${siteUrl}revision.txt to serve ${revision}…`);
  await waitForRevision(revision);
  console.log(`Deployed ${revision.slice(0, 7)}: ${siteUrl}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
