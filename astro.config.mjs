import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import classDev from "./scripts/class-dev.ts";
import { classConfig, withBase } from "./src/class-config.ts";

// Lessons link class-root-relative ("/materials/…"). Serve those links under the base path.
const baseLinks = {
  name: "class-base-links",
  element: {
    filter: ["a", "img", "source", "video", "audio"],
    visit(node, ctx) {
      for (const key of ["href", "src"]) {
        const value = node.properties?.[key];
        if (typeof value === "string" && withBase(value) !== value) ctx.setProperty(node, key, withBase(value));
      }
    },
  },
};

export default defineConfig({
  site: `https://${classConfig.hostname}`,
  base: classConfig.basePath,
  output: "static",
  // Slidev's virtual modules and /api/chat use extensionless URLs without a slash.
  trailingSlash: "ignore",
  integrations: [react(), mdx(), {
    name: "class-site",
    hooks: {
      "astro:config:setup": ({ command, config, updateConfig }) => {
        // Astro's default Sätteri processor runs Markdown and, through @astrojs/mdx, MDX.
        if (config.markdown.processor.name !== "satteri") throw new Error("Lesson base links need Astro's default Markdown processor.");
        config.markdown.processor.options.hastPlugins.push(baseLinks);
        if (command === "dev") updateConfig({ vite: { plugins: [classDev()] } });
      },
    },
  }],
  vite: {
    // Keep the standalone companion's Vite configuration out of the class site.
    configFile: false,
  },
});
