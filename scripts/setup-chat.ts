import { readFile, rename } from "node:fs/promises";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { classConfig, type ClassConfig } from "../src/class-config.js";
import { createChatKey, revokeChatKey, writeReceipt, type ChatKeyReceipt } from "./chat-key.js";
import { localEnv } from "./local-env.js";
import { prompt } from "./prompt.js";

const receiptPath = "generated/openrouter-chat-key.json";
// The Alto app scripts/deploy-talks.ts publishes to. Its manifest declares OPENROUTER_API_KEY.
const app = "talks";

// Secrets go through stdin so they never appear in arguments or output.
function alto(args: string[], input?: string): Promise<void> {
  return new Promise((done, reject) => {
    const child = spawn("alto", args, { stdio: [input === undefined ? "ignore" : "pipe", "inherit", "inherit"] });
    child.stdin?.on("error", () => {});
    child.stdin?.end(input);
    child.on("error", reject);
    child.on("exit", (code, signal) => code === 0 ? done() : reject(new Error(`alto ${args.slice(0, 2).join(" ")} failed (${signal ?? code}).`)));
  });
}

// The deployed Worker reports enabled only when it can read the secret, so this checks the real installation.
async function liveChatEnabled(config: ClassConfig): Promise<boolean> {
  const response = await fetch(`https://${config.hostname}${config.basePath}/api/chat/status?t=${Date.now()}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) return false;
  return (await response.json() as { enabled?: boolean }).enabled === true;
}

export async function setupChat(config: ClassConfig, env: NodeJS.ProcessEnv): Promise<boolean> {
  if (!config.features.chat) {
    console.log("Chat is disabled in class.config.json.");
    return false;
  }
  let receipt: ChatKeyReceipt | undefined;
  try {
    receipt = JSON.parse(await readFile(receiptPath, "utf8"));
    if (receipt?.version !== 1 || !receipt.hash || receipt.name !== `${config.slug}-chat`) {
      throw new Error(`Receipt does not belong to this class: ${receiptPath}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (await liveChatEnabled(config)) {
    if (receipt && !receipt.revokedAt && new Date(receipt.expiresAt) <= new Date()) {
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
  // A live receipt while the deployed site cannot read a key is an interrupted setup. Revoke before replacing.
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
    await alto(["secrets", "set", app, "OPENROUTER_API_KEY", "--scope", "all"], key);
    // Secret reads are cached for about a minute.
    const deadline = Date.now() + 120_000;
    while (!(await liveChatEnabled(config))) {
      if (Date.now() >= deadline) throw new Error(`The deployed site still reports chat disabled. Deploy with pnpm run deploy:talks first, then rerun pnpm chat:setup.`);
      await new Promise(done => setTimeout(done, 5_000));
    }
  } catch (error) {
    if (created) {
      console.error("Setup failed; revoking the newly created key.");
      // A revoked key left in Alto would still make the site report chat as enabled.
      await alto(["secrets", "delete", app, "OPENROUTER_API_KEY", "--scope", "all"]).catch(() => console.error(`Delete OPENROUTER_API_KEY from ${app} with alto secrets delete.`));
      await revokeChatKey(managementKey!, created.hash);
      created.revokedAt = new Date().toISOString();
      await writeReceipt(receiptPath, created);
    }
    throw error;
  }
  if (!created && receipt) await rename(receiptPath, `${receiptPath}.replaced-${Date.now()}`);
  console.log(`Chat key installed on ${app} and verified at https://${config.hostname}${config.basePath}/api/chat/status.`);
  return true;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  setupChat(classConfig, await localEnv()).then(configured => {
    if (!configured) process.exitCode = 1;
  }).catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}
