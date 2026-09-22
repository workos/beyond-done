import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import classDev from "./scripts/class-dev.ts";
import config from "./class.config.json" with { type: "json" };

export default defineConfig({
  site: `https://${config.hostname}`,
  output: "static",
  // Slidev's virtual modules and /api/chat use extensionless URLs without a slash.
  trailingSlash: "ignore",
  integrations: [react(), mdx(), {
    name: "class-dev",
    hooks: {
      "astro:config:setup": ({ command, updateConfig }) => {
        if (command === "dev") updateConfig({ vite: { plugins: [classDev()] } });
      },
    },
  }],
  vite: {
    // Keep the standalone companion's Vite configuration out of the class site.
    configFile: false,
  },
});
