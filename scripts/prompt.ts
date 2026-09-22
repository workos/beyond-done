import { createInterface } from "node:readline/promises";

export async function prompt(question: string, fallback: string): Promise<string> {
  if (!process.stdin.isTTY) throw new Error(`${question}: configure this before running non-interactively.`);
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await terminal.question(`${question} [${fallback}]: `)).trim() || fallback;
  } finally { terminal.close(); }
}
