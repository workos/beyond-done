import { spawn } from "node:child_process";

export function command(args: string[], options: { env?: NodeJS.ProcessEnv; input?: string; capture?: boolean } = {}): Promise<string> {
  return new Promise((done, reject) => {
    const child = spawn("pnpm", args, {
      env: options.env ?? process.env,
      stdio: [options.input === undefined ? "inherit" : "pipe", options.capture ? "pipe" : "inherit", "inherit"],
    });
    let output = "";
    child.stdout?.on("data", chunk => { output += chunk; });
    // A failed command may close stdin before consuming the secret. Report its exit below.
    child.stdin?.on("error", () => {});
    child.stdin?.end(options.input);
    child.on("error", reject);
    child.on("exit", (code, signal) => code === 0 ? done(output) : reject(new Error(`pnpm ${args.join(" ")} failed (${signal ?? code}).`)));
  });
}
