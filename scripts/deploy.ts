import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { classConfigSchema } from "../src/class-config.js";
import { command } from "./command.js";
import { localEnv } from "./local-env.js";
import { prompt } from "./prompt.js";
import { setupChat } from "./setup-chat.js";

export async function deploy(): Promise<void> {
  const env = await localEnv();
  const original = JSON.parse(await readFile("class.config.json", "utf8"));
  const input = structuredClone(original);
  if (input.slug === "my-class") input.slug = await prompt("Class slug", "my-class");
  if (input.hostname === "my-class.typevoid.com") input.hostname = await prompt("Class hostname", `${input.slug}.typevoid.com`);
  const config = classConfigSchema.parse(input);
  if (config.slug === "my-class" || config.hostname === "my-class.typevoid.com") {
    throw new Error("Choose a class slug and hostname before deploying.");
  }
  if (JSON.stringify(input) !== JSON.stringify(original)) {
    await writeFile("class.config.json", `${JSON.stringify(input, null, 2)}\n`);
  }

  // Wrangler handles login when credentials are missing. Build failures never deploy.
  await command(["build"], { env });
  await command(["exec", "wrangler", "deploy", "--config", ".class-build/wrangler.json"], { env });
  if (config.features.chat) await setupChat(config, env);
  console.log(`Deployed https://${config.hostname}/`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  deploy().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}
