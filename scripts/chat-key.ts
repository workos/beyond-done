import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { localEnv } from "./local-env.js";

export interface ChatKeyReceipt {
  version: 1;
  name: string;
  hash: string;
  limitUsd: number;
  expiresAt: string;
  createdAt: string;
  revokedAt?: string;
}

interface CreatedKey {
  key: string;
  hash: string;
  createdAt: string;
}

type Fetcher = typeof fetch;

function usage(): never {
  console.error(`Usage:
  pnpm run --silent chat-key provision --name <workshop-key-name> --limit <usd> --expires-at <date> --receipt <workshop/generated/chat-key.json>
  pnpm chat-key revoke --receipt <workshop/generated/chat-key.json>`);
  process.exit(2);
}

function flags(args: string[]): Map<string, string> {
  const result = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--")) usage();
    result.set(key, value);
  }
  return result;
}

function required(values: Map<string, string>, name: string): string {
  return values.get(name) ?? usage();
}

async function apiError(response: Response): Promise<Error> {
  return new Error(`OpenRouter key management failed (${response.status}): ${(await response.text()).slice(0, 1_000)}`);
}

export async function createChatKey(input: {
  managementKey: string;
  name: string;
  limitUsd: number;
  expiresAt: string;
}, fetcher: Fetcher = fetch): Promise<CreatedKey> {
  const response = await fetcher("https://openrouter.ai/api/v1/keys", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.managementKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      limit: input.limitUsd,
      limit_reset: null,
      expires_at: input.expiresAt,
      include_byok_in_limit: true,
    }),
  });
  if (!response.ok) throw await apiError(response);

  const payload = await response.json() as { key?: unknown; data?: { hash?: unknown; created_at?: unknown } };
  if (typeof payload.key !== "string" || typeof payload.data?.hash !== "string") {
    throw new Error("OpenRouter created a key but returned an invalid response.");
  }
  return {
    key: payload.key,
    hash: payload.data.hash,
    createdAt: typeof payload.data.created_at === "string" ? payload.data.created_at : new Date().toISOString(),
  };
}

export async function revokeChatKey(managementKey: string, hash: string, fetcher: Fetcher = fetch): Promise<void> {
  const response = await fetcher(`https://openrouter.ai/api/v1/keys/${encodeURIComponent(hash)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${managementKey}` },
  });
  if (!response.ok && response.status !== 404) throw await apiError(response);
}

async function assertReceiptAbsent(path: string): Promise<void> {
  try {
    await access(path, constants.F_OK);
    throw new Error(`Receipt already exists: ${path}. Use a new receipt path for another key.`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export async function writeReceipt(path: string, receipt: ChatKeyReceipt): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(temp, path);
}

async function main(argv = process.argv.slice(2)): Promise<void> {
  const command = argv[0];
  const values = flags(argv.slice(1));
  const env = await localEnv();
  const managementKey = env.OPENROUTER_MANAGEMENT_API_KEY || env.OPENROUTER_MANAGEMENT_KEY;
  if (!managementKey) throw new Error("OPENROUTER_MANAGEMENT_API_KEY is required.");

  if (command === "provision") {
    const name = required(values, "--name");
    const limitUsd = Number(required(values, "--limit"));
    const expiry = new Date(required(values, "--expires-at"));
    const receiptPath = resolve(required(values, "--receipt"));
    if (!Number.isFinite(limitUsd) || limitUsd <= 0) throw new Error("--limit must be a positive USD amount.");
    if (!Number.isFinite(expiry.getTime()) || expiry <= new Date()) throw new Error("--expires-at must be a future date.");
    await mkdir(dirname(receiptPath), { recursive: true });
    await assertReceiptAbsent(receiptPath);

    const expiresAt = expiry.toISOString();
    const created = await createChatKey({ managementKey, name, limitUsd, expiresAt });
    await writeReceipt(receiptPath, {
      version: 1,
      name,
      hash: created.hash,
      limitUsd,
      expiresAt,
      createdAt: created.createdAt,
    });
    console.error(`Created limited key "${name}". Nonsecret receipt: ${receiptPath}`);
    process.stdout.write(`${created.key}\n`);
    return;
  }

  if (command === "revoke") {
    const receiptPath = resolve(required(values, "--receipt"));
    const receipt = JSON.parse(await readFile(receiptPath, "utf8")) as ChatKeyReceipt;
    if (receipt.version !== 1 || typeof receipt.hash !== "string") throw new Error(`Invalid receipt: ${receiptPath}`);
    if (receipt.revokedAt) throw new Error(`Key was already revoked at ${receipt.revokedAt}.`);
    await revokeChatKey(managementKey, receipt.hash);
    receipt.revokedAt = new Date().toISOString();
    await writeReceipt(receiptPath, receipt);
    console.error(`Revoked "${receipt.name}".`);
    return;
  }

  usage();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
