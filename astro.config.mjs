import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import config from "./class.config.json" with { type: "json" };

export default defineConfig({
  site: `https://${config.hostname}`,
  output: "static",
  trailingSlash: "always",
  integrations: [react(), mdx()],
  vite: {
    // Keep the standalone companion's Vite configuration out of the class site.
    configFile: false,
  },
});
