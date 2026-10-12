// The Worker for the Alto "talks" app. Static assets answer first; this handles what they don't:
// the public chat API under the class base path, and /chat-log, which sits on the signed-in root surface.
// scripts/deploy-talks.ts copies this file and openrouter.ts into the talks repo next to deploy/talks/src/worker.ts.
import { getAltoPublicSecrets, getAltoUser } from "@workos/alto";
import { askOpenRouter, ChatError, validateMessages } from "./openrouter.js";

export interface TalksEnv {
  DB?: D1Database;
}

export interface ChatSettings {
  basePath: string;
  enabled: boolean;
  systemPrompt: string;
}

interface LoggedQuestion {
  turn: number;
  question: string;
  answer: string | null;
  error: string | null;
}

const COLUMNS = ["id", "created_at", "turn", "question", "answer", "error"] as const;

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

// Public routes get a capability that can read only this app's declared secrets.
async function apiKey(request: Request, env: TalksEnv): Promise<string | undefined> {
  try {
    return (await (await getAltoPublicSecrets(request, env)).get("OPENROUTER_API_KEY")).trim() || undefined;
  } catch (error) {
    console.error("OPENROUTER_API_KEY is unavailable:", error instanceof Error ? error.message : error);
    return undefined;
  }
}

async function logQuestion(env: TalksEnv, row: LoggedQuestion): Promise<void> {
  try {
    if (!env.DB) throw new Error("DB is not bound.");
    await env.DB.prepare("INSERT INTO chat_questions (turn, question, answer, error) VALUES (?, ?, ?, ?)")
      .bind(row.turn, row.question, row.answer, row.error).run();
  } catch (error) {
    // Keep the question in Worker logs (alto logs talks --since 7d) rather than lose it.
    console.error("Chat question not stored:", JSON.stringify(row), error instanceof Error ? error.message : error);
  }
}

async function chat(request: Request, env: TalksEnv, ctx: ExecutionContext, settings: ChatSettings): Promise<Response> {
  const body = await request.json() as { messages?: unknown };
  const messages = validateMessages(body.messages);
  const last = messages.at(-1);
  const row: LoggedQuestion = {
    turn: messages.filter(message => message.role === "user").length,
    question: last?.role === "user" ? last.content : "",
    answer: null,
    error: null,
  };
  try {
    row.answer = await askOpenRouter({ systemPrompt: settings.systemPrompt, messages, apiKey: await apiKey(request, env) });
    return json({ message: row.answer });
  } catch (error) {
    row.error = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    if (row.question) ctx.waitUntil(logQuestion(env, row));
  }
}

// Spreadsheet apps run cells that start with these characters as formulas; attendee text must stay text.
function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${(/^[=+\-@\t\r]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
}

export function toCsv(rows: Array<Record<string, unknown>>): string {
  return [COLUMNS, ...rows.map(row => COLUMNS.map(column => row[column]))]
    .map(cells => cells.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

async function chatLog(request: Request, env: TalksEnv): Promise<Response> {
  try {
    await getAltoUser(request, env);
  } catch {
    return json({ error: "Sign in to read the chat log." }, 401);
  }
  if (!env.DB) return json({ error: "DB is not bound." }, 500);
  const { results } = await env.DB.prepare(`SELECT ${COLUMNS.join(", ")} FROM chat_questions ORDER BY id`).all<Record<string, unknown>>();
  if (new URL(request.url).searchParams.get("format") !== "csv") return json(results);
  return new Response(toCsv(results), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="chat-questions.csv"',
      "Cache-Control": "no-store",
    },
  });
}

export function talksWorker(settings: ChatSettings): ExportedHandler<TalksEnv> {
  const api = `${settings.basePath}/api/chat`;
  return {
    async fetch(request, env, ctx) {
      const { pathname } = new URL(request.url);
      if (pathname === "/chat-log") return chatLog(request, env);
      if (pathname === `${api}/status`) {
        return json({ enabled: settings.enabled && Boolean(await apiKey(request, env)) });
      }
      if (pathname === api) {
        if (!settings.enabled) return json({ error: "Chat is disabled for this class." }, 404);
        if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
        try {
          return await chat(request, env, ctx, settings);
        } catch (error) {
          if (error instanceof ChatError) return json({ error: error.message }, error.status);
          if (error instanceof SyntaxError) return json({ error: "Invalid JSON body." }, 400);
          console.error(error);
          return json({ error: "The workshop assistant failed." }, 500);
        }
      }
      return new Response("Not found", { status: 404 });
    },
  };
}
