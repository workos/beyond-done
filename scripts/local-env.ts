import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { loadEnv } from "vite";

export async function localEnv(): Promise<NodeJS.ProcessEnv> {
  let devVars = {};
  try {
    devVars = parseEnv(await readFile(".dev.vars", "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return { ...loadEnv("development", process.cwd(), ""), ...devVars, ...process.env };
}
