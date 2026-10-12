import { askOpenRouter, buildSystemPrompt, ChatError } from "./openrouter.js";
import type { WorkshopGlossary } from "./schema.js";

export interface Env {
  ASSETS: Fetcher;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  CHAT_ENABLED?: string;
}

const hits = new Map<string, { count: number; startedAt: number }>();
const LIMIT = 300;
const WINDOW_MS = 60 * 60 * 1_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || now - current.startedAt > WINDOW_MS) {
    hits.set(ip, { count: 1, startedAt: now });
    return false;
  }
  current.count += 1;
  return current.count > LIMIT;
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return json({ error: "Too many questions. Try again in a few minutes." }, 429);

  const body = await request.json() as { messages?: unknown };
  const glossaryResponse = await env.ASSETS.fetch(new Request(new URL("/glossary.json", request.url)));
  if (!glossaryResponse.ok) return json({ error: "Glossary data was not found." }, 500);
  const workshop = await glossaryResponse.json() as WorkshopGlossary;
  const message = await askOpenRouter({
    systemPrompt: buildSystemPrompt(workshop),
    messages: body.messages,
    apiKey: env.OPENROUTER_API_KEY,
    model: env.OPENROUTER_MODEL,
  });
  return json({ message });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat/status") {
      return json({ enabled: env.CHAT_ENABLED !== "false" && Boolean(env.OPENROUTER_API_KEY?.trim()) });
    }
    if (url.pathname === "/api/chat") {
      if (env.CHAT_ENABLED === "false") return json({ error: "Chat is disabled for this class." }, 404);
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      try {
        return await handleChat(request, env);
      } catch (error) {
        if (error instanceof ChatError) return json({ error: error.message }, error.status);
        if (error instanceof SyntaxError) return json({ error: "Invalid JSON body." }, 400);
        console.error(error);
        return json({ error: "The workshop assistant failed." }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
