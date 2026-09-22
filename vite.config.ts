import { readFile } from "node:fs/promises";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { ChatError } from "./src/openrouter.js";
import { chatMiddleware } from "./scripts/dev-chat.js";
import type { WorkshopGlossary } from "./src/schema.js";

function workshopData(): Plugin {
  return {
    name: "workshop-companion-data",
    configureServer(server) {
      server.middlewares.use(chatMiddleware(async () => {
        const dataPath = process.env.WORKSHOP_COMPANION_DATA;
        if (!dataPath) throw new ChatError(500, "Workshop data is not configured.");
        return JSON.parse(await readFile(dataPath, "utf8")) as WorkshopGlossary;
      }, process.env));
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
