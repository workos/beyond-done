import assert from "node:assert/strict";
import test from "node:test";
import { createChatKey, revokeChatKey } from "./chat-key.js";

test("creates a lifetime-limited expiring chat key", async () => {
  let request: { url: string; init?: RequestInit } | undefined;
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    request = { url: String(url), init };
    return Response.json({
      key: "sk-or-v1-secret",
      data: { hash: "key-hash", created_at: "2026-09-16T00:00:00Z" },
    });
  }) as typeof fetch;

  const created = await createChatKey({
    managementKey: "management-secret",
    name: "directing-your-first-agent-chat",
    limitUsd: 5,
    expiresAt: "2026-09-20T00:00:00.000Z",
  }, fetcher);

  assert.equal(created.key, "sk-or-v1-secret");
  assert.equal(request?.url, "https://openrouter.ai/api/v1/keys");
  assert.equal(new Headers(request?.init?.headers).get("Authorization"), "Bearer management-secret");
  assert.deepEqual(JSON.parse(String(request?.init?.body)), {
    name: "directing-your-first-agent-chat",
    limit: 5,
    limit_reset: null,
    expires_at: "2026-09-20T00:00:00.000Z",
    include_byok_in_limit: true,
  });
});

test("revokes by receipt hash", async () => {
  let requestedUrl = "";
  const fetcher = (async (url: string | URL | Request) => {
    requestedUrl = String(url);
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  await revokeChatKey("management-secret", "hash/with slash", fetcher);
  assert.equal(requestedUrl, "https://openrouter.ai/api/v1/keys/hash%2Fwith%20slash");
});
