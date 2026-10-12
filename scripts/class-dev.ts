import { generateSlidesQr } from "./slides-qr.js";
import { createServer, resolveOptions, parser } from "@slidev/cli";
import type { Plugin } from "vite";
import { localEnv } from "./local-env.js";
import { classConfig } from "../src/class-config.js";
import { chatMiddleware, classSystemPrompt } from "./dev-chat.js";

export default function classDev(): Plugin {
  return {
    name: "class-dev",
    enforce: "pre",
    configureServer: async (server) => {
      const env = await localEnv();
      server.middlewares.use(chatMiddleware(classSystemPrompt, env, classConfig.features.chat));

      if (!classConfig.slides.publish) return;
      await generateSlidesQr();
      const base = `${classConfig.basePath}/slides/`;
      const options = await resolveOptions({ entry: "slides/slides.md", base, routerMode: "hash" }, "dev");
      const slides = await createServer(options, {
        base,
        server: {
          middlewareMode: true,
          ws: { server: server.httpServer!, path: "__slidev_hmr" },
        },
      }, {
        async loadData(source) {
          const loaded = await parser.load(options, options.entry, source, "dev");
          const themeMeta = options.data.themeMeta;
          return { ...loaded, themeMeta, config: { ...parser.resolveConfig(loaded.headmatter, themeMeta, options.entry), routerMode: "hash" } };
        },
      });
      // Slidev's client calls its notes and server-state endpoints at the root, whatever the base.
      // Astro strips its base from request.url; Slidev's own base includes it, so route on the original URL.
      server.middlewares.use((request, response, next) => {
        const url = request.originalUrl ?? request.url;
        const path = url?.split("?")[0];
        if (path === base.slice(0, -1)) {
          response.writeHead(302, { Location: base });
          response.end();
        } else if (path?.startsWith(base) || path?.startsWith("/__slidev/") || path?.startsWith("/@server-reactive/") || path?.startsWith("/@server-ref/")) {
          request.url = url;
          slides.middlewares(request, response, next);
        } else next();
      });
      server.httpServer?.once("close", () => { void slides.close(); });
    },
  };
}
