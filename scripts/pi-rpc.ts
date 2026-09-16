import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { StringDecoder } from "node:string_decoder";

interface RpcResponse {
  id?: string;
  type: "response";
  command: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

interface PendingResponse {
  resolve: (response: RpcResponse) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

interface EventWaiter {
  targetCount: number;
  resolve: () => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

export interface PiRpcOptions {
  systemPrompt: string;
  model?: string;
  cwd?: string;
  command?: string;
  timeoutMs?: number;
}

export interface PiRpcSession {
  prompt(message: string): Promise<string>;
}

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1_000;

export function buildPiRpcArgs(options: Pick<PiRpcOptions, "systemPrompt" | "model">): string[] {
  const args = [
    "--mode", "rpc",
    "--no-session",
    "--no-tools",
    "--no-extensions",
    "--no-skills",
    "--no-prompt-templates",
    "--no-context-files",
    "--no-approve",
    "--system-prompt", options.systemPrompt,
  ];
  if (options.model) args.push("--model", options.model);
  return args;
}

class RpcSession implements PiRpcSession {
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly timeoutMs: number;
  private readonly pending = new Map<string, PendingResponse>();
  private readonly eventCounts = new Map<string, number>();
  private readonly eventWaiters = new Map<string, EventWaiter[]>();
  private readonly decoder = new StringDecoder("utf8");
  private stdoutBuffer = "";
  private stderr = "";
  private nextId = 1;
  private failure?: Error;

  constructor(options: PiRpcOptions) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.child = spawn(options.command ?? process.env.PI_COMMAND ?? "pi", buildPiRpcArgs(options), {
      cwd: options.cwd,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.child.stdout.on("data", (chunk: Buffer) => this.consumeStdout(this.decoder.write(chunk)));
    this.child.stdout.on("end", () => this.consumeStdout(this.decoder.end(), true));
    this.child.stderr.on("data", (chunk: Buffer) => {
      this.stderr = `${this.stderr}${chunk.toString()}`.slice(-20_000);
    });
    this.child.on("error", (error) => this.fail(new Error(`Could not start Pi RPC: ${error.message}`)));
    this.child.on("exit", (code, signal) => {
      if (!this.failure && (code !== 0 || this.pending.size || this.hasEventWaiters())) {
        const detail = this.stderr.trim();
        this.fail(new Error(`Pi RPC exited before completing generation (${signal ?? code ?? "unknown"})${detail ? `: ${detail}` : ""}`));
      }
    });
  }

  async prompt(message: string): Promise<string> {
    const settledCount = this.eventCounts.get("agent_settled") ?? 0;
    const accepted = await this.command({ type: "prompt", message });
    if (!accepted.success) throw new Error(`Pi rejected the generation prompt: ${accepted.error ?? "unknown error"}`);

    await this.waitForEvent("agent_settled", settledCount + 1);
    const last = await this.command({ type: "get_last_assistant_text" });
    if (!last.success) throw new Error(`Could not read Pi's response: ${last.error ?? "unknown error"}`);
    const text = (last.data as { text?: unknown } | undefined)?.text;
    if (typeof text !== "string" || !text.trim()) {
      const detail = this.stderr.trim();
      throw new Error(`Pi returned no glossary content${detail ? `: ${detail}` : ""}.`);
    }
    return text;
  }

  dispose(): void {
    this.child.stdin.end();
    if (this.child.exitCode === null && this.child.signalCode === null) this.child.kill("SIGTERM");
  }

  private async command(command: Record<string, unknown>): Promise<RpcResponse> {
    if (this.failure) throw this.failure;
    const id = `workshop-glossary-${this.nextId++}`;
    const response = new Promise<RpcResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Pi RPC command timed out after ${this.timeoutMs}ms.`));
      }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
    });
    this.child.stdin.write(`${JSON.stringify({ id, ...command })}\n`, (error) => {
      if (!error) return;
      const pending = this.pending.get(id);
      if (!pending) return;
      clearTimeout(pending.timer);
      this.pending.delete(id);
      pending.reject(new Error(`Could not write to Pi RPC: ${error.message}`));
    });
    return response;
  }

  private waitForEvent(type: string, targetCount: number): Promise<void> {
    if ((this.eventCounts.get(type) ?? 0) >= targetCount) return Promise.resolve();
    if (this.failure) return Promise.reject(this.failure);

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        const waiters = this.eventWaiters.get(type) ?? [];
        this.eventWaiters.set(type, waiters.filter((waiter) => waiter.targetCount !== targetCount));
        reject(new Error(`Pi RPC generation timed out after ${this.timeoutMs}ms.`));
      }, this.timeoutMs);
      const waiter = { targetCount, resolve, reject, timer };
      this.eventWaiters.set(type, [...(this.eventWaiters.get(type) ?? []), waiter]);
    });
  }

  private consumeStdout(chunk: string, ended = false): void {
    this.stdoutBuffer += chunk;
    let newline = this.stdoutBuffer.indexOf("\n");
    while (newline !== -1) {
      let line = this.stdoutBuffer.slice(0, newline);
      this.stdoutBuffer = this.stdoutBuffer.slice(newline + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line) this.handleLine(line);
      newline = this.stdoutBuffer.indexOf("\n");
    }
    if (ended && this.stdoutBuffer) {
      const line = this.stdoutBuffer.endsWith("\r") ? this.stdoutBuffer.slice(0, -1) : this.stdoutBuffer;
      this.stdoutBuffer = "";
      if (line) this.handleLine(line);
    }
  }

  private handleLine(line: string): void {
    let message: Record<string, unknown>;
    try {
      message = JSON.parse(line) as Record<string, unknown>;
    } catch {
      this.fail(new Error(`Pi RPC returned invalid JSONL: ${line.slice(0, 500)}`));
      return;
    }

    if (message.type === "response" && typeof message.id === "string") {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      clearTimeout(pending.timer);
      this.pending.delete(message.id);
      pending.resolve(message as unknown as RpcResponse);
      return;
    }

    if (typeof message.type !== "string") return;
    const count = (this.eventCounts.get(message.type) ?? 0) + 1;
    this.eventCounts.set(message.type, count);
    const waiters = this.eventWaiters.get(message.type) ?? [];
    const remaining: EventWaiter[] = [];
    for (const waiter of waiters) {
      if (count >= waiter.targetCount) {
        clearTimeout(waiter.timer);
        waiter.resolve();
      } else {
        remaining.push(waiter);
      }
    }
    this.eventWaiters.set(message.type, remaining);
  }

  private hasEventWaiters(): boolean {
    return [...this.eventWaiters.values()].some((waiters) => waiters.length > 0);
  }

  private fail(error: Error): void {
    if (this.failure) return;
    this.failure = error;
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
    for (const waiters of this.eventWaiters.values()) {
      for (const waiter of waiters) {
        clearTimeout(waiter.timer);
        waiter.reject(error);
      }
    }
    this.eventWaiters.clear();
  }
}

export async function withPiRpc<T>(options: PiRpcOptions, run: (session: PiRpcSession) => Promise<T>): Promise<T> {
  const session = new RpcSession(options);
  try {
    return await run(session);
  } finally {
    session.dispose();
  }
}
