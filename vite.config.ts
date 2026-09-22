import { readFile } from "node:fs/promises";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { askOpenRouter, ChatError } from "./src/openrouter.js";
import type { WorkshopGlossary } from "./src/schema.js";

function workshopData(): Plugin {
  return {
    name: "workshop-companion-data",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split("?")[0] !== "/api/chat") return next();
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.end(JSON.stringify({ error: "Method not allowed." }));
          return;
        }
        try {
          let raw = "";
          for await (const chunk of request) {
            raw += chunk;
            if (raw.length > 50_000) throw new ChatError(413, "Request too large.");
          }
          const body = JSON.parse(raw) as { messages?: unknown };
          const dataPath = process.env.WORKSHOP_COMPANION_DATA;
          if (!dataPath) throw new ChatError(500, "Workshop data is not configured.");
          const workshop = JSON.parse(await readFile(dataPath, "utf8")) as WorkshopGlossary;
          const message = await askOpenRouter({
            workshop,
            messages: body.messages,
            apiKey: process.env.OPENROUTER_API_KEY,
            model: process.env.OPENROUTER_MODEL,
          });
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ message }));
        } catch (error) {
          response.statusCode = error instanceof ChatError ? error.status : error instanceof SyntaxError ? 400 : 500;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Chat failed." }));
        }
      });
      server.middlewares.use("/glossary.json", async (_request, response) => {
        const path = process.env.WORKSHOP_COMPANION_DATA;
        if (!path) {
          response.statusCode = 404;
          response.end("Set WORKSHOP_COMPANION_DATA or run pnpm dev <glossary.json>.");
          return;
        }
        try {
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(await readFile(path, "utf8"));
        } catch (error) {
          response.statusCode = 500;
          response.end(error instanceof Error ? error.message : "Could not read glossary data.");
        }
      });
    },
  };
}

export default defineConfig({
  root: import.meta.dirname,
  base: "./",
  plugins: [react(), workshopData()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
