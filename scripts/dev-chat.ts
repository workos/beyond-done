import type { Connect } from "vite";
import { classConfig } from "../src/class-config.js";
import { loadClassGlossary } from "../src/class-glossary.js";
import { askOpenRouter, buildSystemPrompt, ChatError } from "../src/openrouter.js";
import { collectSource } from "./source.js";

// The glossary plus every lesson's Markdown. Slides stay out: their presenter notes are not public.
export async function classSystemPrompt(): Promise<string> {
  const [workshop, lessons] = await Promise.all([loadClassGlossary(), collectSource("src/content/lessons", false)]);
  return buildSystemPrompt(workshop, lessons.content);
}

export function chatMiddleware(
  loadSystemPrompt: () => Promise<string>,
  env: { OPENROUTER_API_KEY?: string; OPENROUTER_MODEL?: string },
  enabled = true,
): Connect.NextHandleFunction {
  return async (request, response, next) => {
    const url = request.url?.split("?")[0] ?? "";
    // The site calls the API under its base path, as in production.
    const path = url.startsWith(`${classConfig.basePath}/`) ? url.slice(classConfig.basePath.length) : url;
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
        systemPrompt: await loadSystemPrompt(),
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
