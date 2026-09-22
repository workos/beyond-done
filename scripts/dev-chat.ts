import type { Connect } from "vite";
import { askOpenRouter, ChatError } from "../src/openrouter.js";
import type { WorkshopGlossary } from "../src/schema.js";

export function chatMiddleware(
  loadGlossary: () => Promise<WorkshopGlossary>,
  env: { OPENROUTER_API_KEY?: string; OPENROUTER_MODEL?: string },
  enabled = true,
): Connect.NextHandleFunction {
  return async (request, response, next) => {
    const path = request.url?.split("?")[0];
    if (path !== "/api/chat" && path !== "/api/chat/status") return next();
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    if (path === "/api/chat/status") {
      response.end(JSON.stringify({ enabled: enabled && Boolean(env.OPENROUTER_API_KEY?.trim()) }));
      return;
    }
    try {
      if (!enabled) throw new ChatError(404, "Chat is disabled for this class.");
      if (request.method !== "POST") throw new ChatError(405, "Method not allowed.");
      let raw = "";
      for await (const chunk of request) {
        raw += chunk;
        if (raw.length > 50_000) throw new ChatError(413, "Request too large.");
      }
      const body = JSON.parse(raw) as { messages?: unknown };
      const message = await askOpenRouter({
        workshop: await loadGlossary(),
        messages: body.messages,
        apiKey: env.OPENROUTER_API_KEY,
        model: env.OPENROUTER_MODEL,
      });
      response.end(JSON.stringify({ message }));
    } catch (error) {
      response.statusCode = error instanceof ChatError ? error.status : error instanceof SyntaxError ? 400 : 500;
      response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Chat failed." }));
    }
  };
}
