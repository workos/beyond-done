// snack: a remote control for the Midnight Snack Lab waitlist, built for agents.
// One small CLI that launches, drives, inspects, and proves the app over the
// Chrome DevTools Protocol. JSON out; every error says what to do next.
import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFile } from "node:process";
import { parseArgs } from "node:util";
import { chromium, expect, type Browser, type Page } from "@playwright/test";
import { GAME_BUGS, startApp, type AppSource, type Bug } from "./server.js";
import { currentRevision, EMAIL, readRevision, readStorage, runProof, type Prove, type Receipt } from "./proof.js";
import { judge } from "./judge.js";

// SNACK_DIR isolates a second instance (tests, a parallel checkout) from the default one.
const DIR = process.env.SNACK_DIR ?? fileURLToPath(new URL("../.lab-runs/snack/", import.meta.url));
const SESSION = join(DIR, "session.json");
const EVENTS = join(DIR, "events.jsonl");
const RECEIPT = join(DIR, "receipt.json");
const PROFILE = join(DIR, "profile");
const LOCK = join(DIR, "up.lock");

const COMMANDS = {
  up: ["Health", "up [--bug NAME|random] [--solution] [--headless]", "Start the app and a Chrome you can drive. Leave it running in its own terminal."],
  down: ["Health", "down", "Stop what up started."],
  doctor: ["Health", "doctor", "Is this instance worth driving? Tools, session, loaded build, last proof."],
  join: ["Drive", "join <email>", "Type an email into the form and submit it, like a user."],
  reload: ["Drive", "reload", "Reload the page, like a user."],
  reset: ["Drive", "reset [--dry-run]", "Clear the app's storage and reload: a fresh visitor."],
  snapshot: ["Look", "snapshot", "What a user sees: status, email, confirmation, accessibility tree."],
  storage: ["Look", "storage", "The app's localStorage, read through the DevTools protocol."],
  console: ["Look", "console [--errors]", "Console messages and uncaught errors since up."],
  network: ["Look", "network", "Responses and failed requests since up."],
  screenshot: ["Look", "screenshot [path]", "Save a full-page screenshot."],
  eval: ["Look", "eval <expression>", "Read page state after the user path ran. Not for calling app internals."],
  prove: ["Prove", "prove [--solution]", "Fresh visitor, your proof, a receipt. Exit 0 PASS, 1 FAIL, 2 can't tell."],
  judge: ["Prove", "judge", "Ask Jev whether the confirmation copy is honest. Needs TYPESAFE_API_KEY."],
} as const;
type Command = keyof typeof COMMANDS;

class SnackError extends Error {
  constructor(message: string, readonly next: string, readonly code = 2) { super(message); }
}
const out = (value: unknown) => console.log(JSON.stringify(value, null, 2));

type Session = { pid: number; appUrl: string; cdpUrl: string; app: AppSource | "game"; headless: boolean; startedAt: string };
const alive = (pid: number) => { try { process.kill(pid, 0); return true; } catch { return false; } };

async function readSession(): Promise<Session> {
  let session: Session;
  try { session = JSON.parse(await readFile(SESSION, "utf8")); } catch {
    throw new SnackError("No app is running.", "Start one in its own terminal and leave it running: pnpm snack up");
  }
  // A live pid alone could be a reused one: the session is ours only if its app server still answers.
  const answers = alive(session.pid) && await fetch(new URL("/favicon.ico", session.appUrl)).then(() => true, () => false);
  if (!answers) {
    await rm(SESSION, { force: true });
    throw new SnackError("The app from the last `up` is no longer running.", "Start it again: pnpm snack up");
  }
  return session;
}

// Attach to the browser that `up` launched, do one thing, and detach.
async function withPage<T>(fn: (page: Page, browser: Browser, session: Session) => Promise<T>): Promise<T> {
  const session = await readSession();
  const browser = await chromium.connectOverCDP(session.cdpUrl).catch(() => {
    throw new SnackError(`Can't reach Chrome at ${session.cdpUrl}.`, "Stop up (Ctrl+C or pnpm snack down), then start it again.");
  });
  try {
    const context = browser.contexts()[0];
    let page = context.pages().find(p => p.url().startsWith(session.appUrl)) ?? context.pages()[0];
    if (!page) page = await context.newPage();
    if (!page.url().startsWith(session.appUrl)) await page.goto(session.appUrl);
    page.setDefaultTimeout(3000);
    return await fn(page, browser, session);
  } finally {
    await browser.close(); // Over CDP this disconnects; up keeps the browser alive.
  }
}

async function textOf(locator: ReturnType<Page["locator"]>) {
  return (await locator.count()) ? (await locator.first().innerText()).trim() : null;
}
async function snapshot(page: Page) {
  return {
    url: page.url(),
    revision: await readRevision(page),
    status: await textOf(page.getByTestId("status")),
    email: await textOf(page.getByTestId("email")),
    confirmation: await textOf(page.getByRole("status")),
    aria: await page.locator("main").ariaSnapshot({ timeout: 1000 }).catch(() => null),
  };
}

async function joinWaitlist(page: Page, email: string) {
  const field = page.getByLabel("Email", { exact: true });
  if (!(await field.count())) throw new SnackError("There is no Email field on the page.", "See what is there: pnpm snack snapshot");
  const status = page.getByTestId("status");
  const before = await textOf(status);
  await field.fill(email);
  await page.getByRole("button", { name: "Join waitlist", exact: true }).click();
  // Wait for the page to react, not for a fixed time. No change is also an answer.
  if (before !== null) await expect(status).not.toHaveText(before, { timeout: 1500 }).catch(() => {});
}

async function readEvents(types: string[]) {
  const text = existsSync(EVENTS) ? await readFile(EVENTS, "utf8") : "";
  return text.split("\n").filter(Boolean).map(line => JSON.parse(line)).filter(event => types.includes(event.type));
}

// Held from before up touches the profile and event log until it exits, so two ups can't share them.
async function claimUp() {
  await mkdir(DIR, { recursive: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    try { return await writeFile(LOCK, String(process.pid), { flag: "wx" }); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    const owner = Number(await readFile(LOCK, "utf8").catch(() => ""));
    if (owner && alive(owner)) break;
    await rm(LOCK, { force: true }); // Left by an up that was killed.
  }
  throw new SnackError("Another up is already starting or running here.", "Use it, or stop it first: pnpm snack down");
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer().once("error", reject).listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => typeof address === "object" && address ? resolve(address.port) : reject(new Error("No free port")));
    });
  });
}

async function up(options: { bug?: string; solution: boolean; headless: boolean }) {
  const existing = await readSession().catch(() => null);
  if (existing) throw new SnackError(`Already running at ${existing.appUrl} (pid ${existing.pid}).`, "Use it, or stop it first: pnpm snack down");
  let bug: Bug | undefined;
  const game = options.bug !== undefined;
  if (game) {
    const choice = options.bug === "random" ? GAME_BUGS[Math.floor(Math.random() * GAME_BUGS.length)] : options.bug;
    if (!GAME_BUGS.includes(choice as Bug)) throw new SnackError(`Unknown bug "${options.bug}".`, `Use --bug random, or one of: ${GAME_BUGS.join(", ")}`);
    bug = choice === "none" ? undefined : choice as Bug;
  }
  const appSource: AppSource = game || options.solution ? "solution" : "exercise";
  await claimUp();
  const opened: { close(): Promise<unknown> }[] = [];
  try {
    await rm(PROFILE, { recursive: true, force: true });
    await writeFile(EVENTS, "");
    const app = await startApp({ app: appSource, bug });
    opened.push(app);
    const port = await freePort();
    const headless = options.headless || Boolean(process.env.CI) || (process.platform === "linux" && !process.env.DISPLAY);
    const context = await chromium.launchPersistentContext(PROFILE, {
      headless, viewport: { width: 1000, height: 820 }, args: [`--remote-debugging-port=${port}`],
    });
    opened.unshift(context);
    const log = (event: Record<string, unknown>) =>
      appendFile(EVENTS, JSON.stringify({ t: new Date().toISOString(), ...event }) + "\n").catch(() => {});
    const watch = (page: Page) => {
      page.on("console", message => log({ type: "console", level: message.type(), text: message.text() }));
      page.on("pageerror", error => log({ type: "pageerror", level: "error", text: error.message }));
      page.on("load", () => log({ type: "load", url: page.url() }));
      page.on("response", response => log({ type: "response", method: response.request().method(), status: response.status(), url: response.url() }));
      page.on("requestfailed", request => log({ type: "requestfailed", method: request.method(), url: request.url(), text: request.failure()?.errorText }));
    };
    context.pages().forEach(watch);
    context.on("page", watch);
    const page = context.pages()[0] ?? await context.newPage();
    await page.goto(app.url);
    const session: Session = { pid: process.pid, appUrl: app.url, cdpUrl: `http://127.0.0.1:${port}`, app: game ? "game" : appSource, headless, startedAt: new Date().toISOString() };
    await writeFile(SESSION, JSON.stringify(session, null, 2));
    out({ ok: true, ...session, ...(game ? { bug: "hidden until you stop up" } : {}), next: "Leave this running. In another terminal: pnpm snack doctor" });

    let stopping = false;
    const stop = async () => {
      if (stopping) return;
      stopping = true;
      await rm(SESSION, { force: true });
      await context.close().catch(() => {});
      await app.close().catch(() => {});
      await rm(LOCK, { force: true });
      if (game) out({ reveal: bug ?? "none" });
      process.exit(0);
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    context.on("close", stop); // Someone closed the browser window.
  } catch (error) {
    // A failed start must not leave the app server holding the process open.
    for (const resource of opened) await resource.close().catch(() => {});
    await rm(LOCK, { force: true });
    throw error;
  }
  await new Promise(() => {});
}

async function down() {
  const session = await readSession();
  process.kill(session.pid, "SIGTERM");
  for (let i = 0; i < 50 && alive(session.pid); i++) await new Promise(resolve => setTimeout(resolve, 100));
  out({ ok: !alive(session.pid), stopped: session.pid, next: "Start again with: pnpm snack up" });
}

async function doctor() {
  const checks: { name: string; ok: boolean; detail: string; next?: string }[] = [];
  const node = Number(process.versions.node.split(".")[0]);
  checks.push({ name: "node", ok: node >= 24, detail: process.version, ...(node < 24 ? { next: "Install Node 24 (mise install)" } : {}) });
  const browserInstalled = existsSync(chromium.executablePath());
  checks.push({ name: "chromium", ok: browserInstalled, detail: browserInstalled ? "installed" : "missing", ...(!browserInstalled ? { next: "pnpm exec playwright install chromium" } : {}) });
  let proof: { status: string; next?: string } = { status: "unknown: no running app" };
  const session = await readSession().catch((error: SnackError) => {
    checks.push({ name: "session", ok: false, detail: error.message, next: error.next });
    return null;
  });
  if (session) {
    checks.push({ name: "session", ok: true, detail: `${session.app} app at ${session.appUrl}, pid ${session.pid}` });
    const loaded = await withPage(page => readRevision(page));
    const source = await currentRevision(session.appUrl);
    const fresh = loaded !== null && loaded === source;
    checks.push({ name: "build", ok: fresh,
      detail: fresh ? `page shows the current source (${source})` : `STALE: the page shows ${loaded}, the source is now ${source}`,
      ...(!fresh ? { next: "pnpm snack reload" } : {}) });
    const receipt: Receipt | null = existsSync(RECEIPT) ? JSON.parse(await readFile(RECEIPT, "utf8")) : null;
    proof = !receipt ? { status: "none yet", next: "pnpm snack prove" }
      : receipt.revision !== source ? { status: `STALE: the last receipt says ${receipt.verdict} for ${receipt.revision}, but the source is now ${source}. That proof is for code that no longer exists.`, next: "pnpm snack prove" }
      : { status: `${receipt.verdict} for the current source (${source}) at ${receipt.at}`, ...(receipt.verdict !== "PASS" ? { next: receipt.next[0] } : {}) };
  }
  const ok = checks.every(check => check.ok);
  out({ ok, checks, proof });
  if (!ok) process.exitCode = 1;
}

async function prove(solution: boolean) {
  const { prove } = await import(solution ? "./solution/prove.js" : "./exercises/prove.js") as { prove: Prove };
  const receipt = await withPage(async (_page, browser, session) => {
    const revision = await currentRevision(session.appUrl);
    // One screenshot per run, so each saved receipt keeps the image it was proved with.
    return runProof(browser, session.appUrl, prove, join(DIR, `proof-${revision}-${Date.now()}.png`));
  });
  const json = JSON.stringify(receipt, null, 2);
  await writeFile(RECEIPT, json); // latest, for doctor
  // Append, never overwrite: failures stay in the history next to the final green.
  await mkdir(join(DIR, "receipts"), { recursive: true });
  await writeFile(join(DIR, "receipts", `${receipt.at.replace(/[:.]/g, "-")}-${receipt.revision ?? "unknown"}.json`), json);
  out(receipt);
  process.exitCode = receipt.verdict === "PASS" ? 0 : receipt.verdict === "FAIL" ? 1 : 2;
}

async function judgeCopy() {
  if (!process.env.TYPESAFE_API_KEY) throw new SnackError("No TYPESAFE_API_KEY, so there is no judge.",
    "Judge it as a human instead: pnpm snack screenshot, then compare the confirmation to the contract in lab/verify/features/waitlist.md");
  const evidence = await withPage(async (_page, browser, session) => {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(3000);
      await page.goto(session.appUrl);
      const revision = await readRevision(page);
      await joinWaitlist(page, EMAIL);
      const confirmationBeforeReload = await textOf(page.getByRole("status")) ?? "";
      await page.reload();
      const confirmationAfterReload = await textOf(page.getByRole("status")) ?? "";
      const changed = await readRevision(page) !== revision;
      return { appUrl: session.appUrl, revision, changed, confirmationBeforeReload, confirmationAfterReload };
    } finally { await context.close(); }
  });
  const { appUrl, revision, changed, ...confirmations } = evidence;
  const appChanged = () => new SnackError(`The app changed while judging (started on ${revision}). Copy from two builds proves neither: that's "can't tell".`,
    "Run it again once the file stops changing: pnpm snack judge");
  if (changed) throw appChanged();
  let judgment;
  try { judgment = await judge(confirmations); } catch (error) {
    throw new SnackError(`The judge didn't answer (${error instanceof Error ? error.message : "unknown error"}). That's "can't tell", not a pass or a fail.`,
      "Check the key, quota and network, or judge it as a human: pnpm snack screenshot");
  }
  if (await currentRevision(appUrl) !== revision) throw appChanged();
  out({ revision, evidence: confirmations, ...judgment });
  process.exitCode = judgment.verdict === "PASS" ? 0 : judgment.verdict === "FAIL" ? 1 : 2;
}

function help(command?: string) {
  if (command && command in COMMANDS) {
    const [group, usage, summary] = COMMANDS[command as Command];
    return out({ command, group, usage: `pnpm snack ${usage}`, summary });
  }
  const groups: Record<string, string[]> = {};
  for (const [, [group, usage, summary]] of Object.entries(COMMANDS)) (groups[group] ??= []).push(`${usage.padEnd(52)} ${summary}`);
  console.log("snack: drive and prove the Midnight Snack Lab waitlist.\n\nUsage: pnpm snack <command>\n");
  for (const [group, lines] of Object.entries(groups)) console.log(`${group}\n${lines.map(line => "  " + line).join("\n")}\n`);
  console.log(`Start with: pnpm snack up   (own terminal)   then: pnpm snack doctor\nGame bugs for --bug: random, ${GAME_BUGS.join(", ")}\nGuide for agents: lab/verify/SKILL.md`);
}

async function main() {
  try { loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url))); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  let parsed;
  try {
    parsed = parseArgs({ allowPositionals: true, options: {
      bug: { type: "string" }, solution: { type: "boolean", default: false }, headless: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false }, errors: { type: "boolean", default: false }, help: { type: "boolean", short: "h", default: false },
    } });
  } catch (error) {
    throw new SnackError(error instanceof Error ? error.message : "Bad arguments", "See the options: pnpm snack help");
  }
  const { values, positionals: [command, ...args] } = parsed;
  if (!command || command === "help") return help(args[0]);
  if (!(command in COMMANDS)) throw new SnackError(`Unknown command "${command}".`, "See the commands: pnpm snack help");
  if (values.help) return help(command);
  switch (command as Command) {
    case "up": return up({ bug: values.bug, solution: values.solution, headless: values.headless });
    case "down": return down();
    case "doctor": return doctor();
    case "join": {
      const email = args[0];
      if (!email) throw new SnackError("join needs an email.", `pnpm snack join ${EMAIL}`);
      return out(await withPage(async page => { await joinWaitlist(page, email); return snapshot(page); }));
    }
    case "reload": return out(await withPage(async page => { await page.reload({ waitUntil: "load" }); return snapshot(page); }));
    case "reset": return out(await withPage(async page => {
      const storage = await readStorage(page);
      if (values["dry-run"]) return { dryRun: true, wouldClear: storage, next: "Run without --dry-run to clear it." };
      const cdp = await page.context().newCDPSession(page);
      const origin = new URL(page.url()).origin;
      for (const isLocalStorage of [true, false]) await cdp.send("DOMStorage.clear", { storageId: { securityOrigin: origin, isLocalStorage } });
      await cdp.detach();
      await page.reload({ waitUntil: "load" });
      return { cleared: storage, ...await snapshot(page) };
    }));
    case "snapshot": return out(await withPage(snapshot));
    case "storage": return out(await withPage(async page => ({ origin: new URL(page.url()).origin, localStorage: await readStorage(page) })));
    case "console": {
      await readSession();
      const entries = (await readEvents(["console", "pageerror", "load"])).filter(event => !values.errors || event.level === "error");
      return out({ entries: entries.slice(-30), note: "pageerror = an uncaught exception. load = the page (re)loaded." });
    }
    case "network": {
      await readSession();
      return out({ entries: (await readEvents(["response", "requestfailed", "load"])).slice(-40) });
    }
    case "screenshot": {
      const path = args[0] ?? join(DIR, `screenshot-${Date.now()}.png`);
      return out(await withPage(async page => { await page.screenshot({ path, fullPage: true }); return { path }; }));
    }
    case "eval": {
      if (!args[0]) throw new SnackError("eval needs an expression.", `pnpm snack eval "localStorage.length"`);
      return out(await withPage(async page => ({ result: await page.evaluate(args.join(" ")) })));
    }
    case "prove": return prove(values.solution);
    case "judge": return judgeCopy();
  }
}

main().catch(error => {
  const known = error instanceof SnackError;
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message.split("\n")[0] : String(error),
    next: known ? error.next : "Run pnpm snack doctor" }, null, 2));
  process.exitCode = known ? error.code : 2;
});
