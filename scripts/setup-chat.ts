import { readFile, rename } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { classConfig, type ClassConfig } from "../src/class-config.js";
import { createChatKey, revokeChatKey, writeReceipt, type ChatKeyReceipt } from "./chat-key.js";
import { command } from "./command.js";
import { localEnv } from "./local-env.js";
import { prompt } from "./prompt.js";

const receiptPath = "generated/openrouter-chat-key.json";
const wrangler = ["exec", "wrangler"];
const configArgs = ["--config", ".class-build/wrangler.json"];

export async function setupChat(config: ClassConfig, env: NodeJS.ProcessEnv): Promise<boolean> {
  if (!config.features.chat) {
    console.log("Chat is disabled in class.config.json.");
    return false;
  }
  // Explicit generated config avoids accidentally targeting the legacy companion Worker.
  const deployed = JSON.parse(await readFile(".class-build/wrangler.json", "utf8"));
  if (deployed.name !== config.slug) throw new Error("Build and deploy this class before setting up chat.");
  const secrets = JSON.parse(await command([...wrangler, "secret", "list", ...configArgs], { env, capture: true })) as Array<{ name: string }>;
  let receipt: ChatKeyReceipt | undefined;
  try {
    receipt = JSON.parse(await readFile(receiptPath, "utf8"));
    if (receipt?.version !== 1 || !receipt.hash || receipt.name !== `${config.slug}-chat`) {
      throw new Error(`Receipt does not belong to this class: ${receiptPath}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const installed = secrets.some(secret => secret.name === "OPENROUTER_API_KEY");
  if (installed && !receipt?.revokedAt) {
    if (receipt && new Date(receipt.expiresAt) <= new Date()) {
      throw new Error("The chat key has expired. Revoke it with pnpm chat-key revoke --receipt generated/openrouter-chat-key.json, then run pnpm chat:setup.");
    }
    console.log("Chat key already installed; keeping it.");
    return true;
  }
  const managementKey = env.OPENROUTER_MANAGEMENT_API_KEY || env.OPENROUTER_MANAGEMENT_KEY;
  if (!managementKey && !env.OPENROUTER_API_KEY) {
    console.log("Chat stays hidden. Set OPENROUTER_MANAGEMENT_API_KEY in your environment or .env, then run pnpm chat:setup.");
    return false;
  }
  // A receipt with no installed secret is an interrupted setup. Revoke before replacing.
  if (receipt && !receipt.revokedAt) {
    if (!managementKey) throw new Error("OPENROUTER_MANAGEMENT_API_KEY is needed to clean up the interrupted setup.");
    await revokeChatKey(managementKey, receipt.hash);
    receipt.revokedAt = new Date().toISOString();
    await writeReceipt(receiptPath, receipt);
  }

  let key = env.OPENROUTER_API_KEY;
  let created: ChatKeyReceipt | undefined;
  if (!key) {
    const limitUsd = Number(env.CHAT_BUDGET_USD || await prompt("Lifetime chat budget in USD", "15"));
    const expiresAt = new Date(env.CHAT_EXPIRES_AT || await prompt("Chat key expires at (ISO date)", new Date(Date.now() + 7 * 86400_000).toISOString()));
    if (!Number.isFinite(limitUsd) || limitUsd <= 0) throw new Error("Chat budget must be positive.");
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date()) throw new Error("Chat expiry must be a future date.");
    const result = await createChatKey({ managementKey: managementKey!, name: `${config.slug}-chat`, limitUsd, expiresAt: expiresAt.toISOString() });
    key = result.key;
    created = { version: 1, name: `${config.slug}-chat`, hash: result.hash, createdAt: result.createdAt, limitUsd, expiresAt: expiresAt.toISOString() };
  }
  try {
    if (created) await writeReceipt(receiptPath, created);
    await command([...wrangler, "secret", "bulk", ...configArgs], {
      env,
      input: JSON.stringify({ OPENROUTER_API_KEY: key, OPENROUTER_MODEL: env.OPENROUTER_MODEL || "anthropic/claude-haiku-4.5" }),
    });
  } catch (error) {
    if (created) {
      console.error("Setup failed; revoking the newly created key.");
      await revokeChatKey(managementKey!, created.hash);
      created.revokedAt = new Date().toISOString();
      await writeReceipt(receiptPath, created);
    }
    throw error;
  }
  const verified = JSON.parse(await command([...wrangler, "secret", "list", ...configArgs], { env, capture: true })) as Array<{ name: string }>;
  if (!["OPENROUTER_API_KEY", "OPENROUTER_MODEL"].every(name => verified.some(secret => secret.name === name))) {
    throw new Error("Chat secrets could not be verified. Rerun pnpm chat:setup to recover.");
  }
  if (!created && receipt) await rename(receiptPath, `${receiptPath}.replaced-${Date.now()}`);
  console.log("Chat key installed and verified. No rebuild needed.");
  return true;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  setupChat(classConfig, await localEnv()).then(configured => {
    if (!configured) process.exitCode = 1;
  }).catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}
