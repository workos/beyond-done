# OpenRouter OAuth PKCE and API-key management research

Sources used: OpenRouter primary documentation only.

- OAuth PKCE: <https://openrouter.ai/docs/use-cases/oauth-pkce>
- Management API keys: <https://openrouter.ai/docs/guides/overview/auth/management-api-keys>
- API key info endpoint: <https://openrouter.ai/docs/api-reference/authentication/get-current-api-key-information>
- Create API key endpoint: <https://openrouter.ai/docs/api-reference/api-keys/create-api-key>
- OpenRouter rankings/app attribution: <https://openrouter.ai/docs/use-cases/app-rankings>
- API authentication headers: <https://openrouter.ai/docs/api-reference/overview>

## Findings

### OAuth PKCE authorization request

OpenRouter documents an OAuth 2.0 PKCE flow for letting a user authorize an app to create an OpenRouter API key without sharing an existing key with the app.

Authorization endpoint:

```text
GET https://openrouter.ai/auth
```

Documented query parameters:

```text
callback_url=<url-encoded redirect URL>
code_challenge=<base64url SHA-256 challenge>
code_challenge_method=S256
```

The docs show the authorization URL being built as:

```ts
const authUrl = new URL("https://openrouter.ai/auth");
authUrl.searchParams.set("callback_url", callbackUrl);
authUrl.searchParams.set("code_challenge", codeChallenge);
authUrl.searchParams.set("code_challenge_method", "S256");
```

OpenRouter redirects back to the supplied `callback_url` with a `code` query parameter after approval:

```text
<callback_url>?code=<authorization_code>
```

The official flow uses `callback_url`, not the OAuth-standard parameter name `redirect_uri`.

### PKCE requirements

OpenRouter requires the S256 PKCE method in the documented flow. The app generates:

- a high-entropy `code_verifier`
- a `code_challenge` computed as `base64url(sha256(code_verifier))`
- `code_challenge_method=S256`

The docs describe the verifier as a random string in the normal PKCE size range, 43 to 128 characters. The verifier must be kept until the callback and then sent to the exchange endpoint. It is not sent in the authorization URL.

### Code exchange

Exchange endpoint:

```text
POST https://openrouter.ai/api/v1/auth/keys
Content-Type: application/json
```

Documented request body:

```json
{
  "code": "<authorization_code>",
  "code_verifier": "<original_code_verifier>",
  "code_challenge_method": "S256"
}
```

Documented response body:

```json
{
  "key": "sk-or-v1-..."
}
```

No client secret or server-side app secret is shown or required in the documented PKCE exchange. Proof is the PKCE verifier.

### Redirect URL restrictions

OpenRouter's documented flow takes the redirect target dynamically in `callback_url`. The docs do not describe a client registration step, registered redirect URI allow-list, client ID, or client secret. Production apps should still use an HTTPS callback URL. Local development can use a localhost callback because the documented examples are app-controlled callback URLs and PKCE does not require a server secret.

### API-key limits and permissions

The OAuth flow returns an OpenRouter API key. OpenRouter also documents key-management/provisioning endpoints.

Current-key information endpoint:

```text
GET https://openrouter.ai/api/v1/auth/key
Authorization: Bearer <openrouter-api-key>
```

The documented response includes key metadata such as label, usage, limit, whether it is free tier, and rate-limit information. The important fields for this project are:

```json
{
  "data": {
    "label": "...",
    "usage": 0,
    "limit": null,
    "is_free_tier": false,
    "rate_limit": {
      "requests": 10,
      "interval": "10s"
    }
  }
}
```

Create-key endpoint:

```text
POST https://openrouter.ai/api/v1/keys
Authorization: Bearer <management-api-key>
Content-Type: application/json
```

OpenRouter's management-key documentation says regular API keys are rejected by this endpoint. A Management API key must be created manually at <https://openrouter.ai/settings/management-keys>. Management keys are administrative only and cannot call completion endpoints.

The documented create request supports naming/labelling a key and setting a spend limit:

```json
{
  "name": "My App Key",
  "label": "optional label",
  "limit": 10
}
```

The documented create response returns the newly-created key once and metadata such as the key hash and configured limit:

```json
{
  "key": "sk-or-v1-...",
  "data": {
    "hash": "...",
    "name": "My App Key",
    "label": "optional label",
    "limit": 10
  }
}
```

The create-key request supports a USD spend limit, an expiration timestamp, and `limit_reset` values of daily, weekly, monthly, or `null`. A one-off workshop can use `limit_reset: null` for a lifetime cap and expire the key shortly after the event. The cited create-key docs do not document per-model or per-endpoint scopes, so the Worker must enforce the chat model and request shape.

### App attribution and rankings

OpenRouter attributes requests to apps using optional HTTP headers sent with model API calls, not with the PKCE authorization URL.

Documented headers:

```text
HTTP-Referer: <your site URL>
X-Title: <your app name>
```

OpenRouter's app-ranking docs describe these as the mechanism for attribution and rankings. Attendee chat sends `HTTP-Referer: https://github.com/nicknisi/workshop-companion` and `X-Title: Workshop Companion` from `src/openrouter.ts`.

For deployed workshop-specific sites, `HTTP-Referer` should ideally be changed to the public workshop companion URL if the desired ranking attribution is the workshop site instead of the GitHub repository.

### Security and storage guidance

Source-backed guidance from the OpenRouter flow:

- The API key is a bearer secret. Use it only in `Authorization: Bearer <key>` requests to OpenRouter.
- The PKCE `code_verifier` is temporary secret material. Store it only until the callback completes, then delete it.
- The returned API key is shown only by the exchange/create response. Store it securely immediately if it must be reused.
- Do not put an OpenRouter key in browser-delivered JavaScript for shared deployed apps. Keep deployed chat keys on a server, Worker, or equivalent backend.
- Use the key-info endpoint to inspect usage and configured limit when needed.

## Mapping to `workshop-companion`

### Generator CLI auth

`scripts/generate.ts` starts an ephemeral, tool-free Pi RPC process and uses Pi's configured model authentication. The generator no longer needs an `OPENROUTER_API_KEY`; PKCE is outside this tool's generation flow.

### Per-workshop attendee chat

`src/worker.ts` handles `POST /api/chat`; `src/openrouter.ts` sends the request from the Worker using a server-side `OPENROUTER_API_KEY` secret.

Recommended flow:

1. Keep one manually-created `OPENROUTER_MANAGEMENT_KEY` only on the operator's machine.
2. Before deployment, call `POST /api/v1/keys` with the management key to create one normal key for that workshop.
3. Require a low USD `limit`, `limit_reset: null`, and an `expires_at` value shortly after the workshop.
4. Send the returned plaintext key directly into the workshop Worker's secret store. Never write it into glossary JSON or browser assets.
5. Save only the returned key hash and nonsecret limit metadata with the workshop so the key can be revoked through `DELETE /api/v1/keys/{hash}`.
6. Keep the Worker model-fixed, input-bounded, output-bounded, and rate-limited.

PKCE creates a user-controlled normal key, not the Management API key required to mint workshop keys. It is therefore not the provisioning mechanism for this design.
