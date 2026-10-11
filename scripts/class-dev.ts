import { generateSlidesQr } from "./slides-qr.js";
import { createServer, resolveOptions, parser } from "@slidev/cli";
import type { Plugin } from "vite";
import { localEnv } from "./local-env.js";
import { classConfig } from "../src/class-config.js";
import { loadClassGlossary } from "../src/class-glossary.js";
import { chatMiddleware } from "./dev-chat.js";

export default function classDev(): Plugin {
  return {
    name: "class-dev",
    enforce: "pre",
    configureServer: async (server) => {
      const env = await localEnv();
      server.middlewares.use(chatMiddleware(loadClassGlossary, env, classConfig.features.chat));

      if (!classConfig.slides.publish) return;
      await generateSlidesQr();
      const options = await resolveOptions({ entry: "slides/slides.md", base: "/slides/", routerMode: "hash" }, "dev");
      const slides = await createServer(options, {
        base: "/slides/",
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
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split("?")[0];
        if (path === "/slides") {
          response.writeHead(302, { Location: "/slides/" });
          response.end();
        } else if (path?.startsWith("/slides/") || path?.startsWith("/@server-reactive/") || path?.startsWith("/@server-ref/")) {
          slides.middlewares(request, response, next);
        } else next();
      });
      server.httpServer?.once("close", () => { void slides.close(); });
    },
  };
}
