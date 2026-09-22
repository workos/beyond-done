import type { WorkshopGlossary } from "./schema.js";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class ChatError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export function validateMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 20) {
    throw new ChatError(400, "Send between 1 and 20 messages.");
  }
  return input.map((message) => {
    if (!message || typeof message !== "object") throw new ChatError(400, "Invalid message.");
    const { role, content } = message as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || content.length === 0 || content.length > 2_000) {
      throw new ChatError(400, "Invalid message.");
    }
    return { role, content };
  });
}

export function buildSystemPrompt(workshop: WorkshopGlossary): string {
  const glossary = workshop.sections.map((section) =>
    `## ${section.name}\n${section.terms.map((term) => `- ${term.term}: ${term.definition} Why it matters: ${term.whyItMatters}`).join("\n")}`,
  ).join("\n\n");

  return `You are the workshop assistant for "${workshop.title}".
Answer from the glossary below. Use plain, direct language suitable for an attendee reading on a phone.
Keep most answers between two and five sentences. Name relevant glossary terms.
Do not invent workshop facts, links, prices, or tool behavior.
If the answer is not supported by the glossary, reply exactly: That is not covered in this workshop.

${glossary}`;
}

export async function askOpenRouter(input: {
  workshop: WorkshopGlossary;
  messages: unknown;
  apiKey?: string;
  model?: string;
}): Promise<string> {
  if (!input.apiKey) throw new ChatError(503, "The workshop assistant is not configured.");
  const messages = validateMessages(input.messages);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/nicknisi/workshop-companion",
      "X-Title": "Workshop Companion",
    },
    body: JSON.stringify({
      model: input.model ?? "anthropic/claude-haiku-4.5",
      temperature: 0.2,
      max_tokens: 500,
      messages: [
        { role: "system", content: buildSystemPrompt(input.workshop) },
        ...messages.slice(-12),
      ],
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new ChatError(502, `OpenRouter request failed (${response.status}): ${detail}`);
  }
  const payload = await response.json() as {
    choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content : content?.map((part) => part.text ?? "").join("");
  if (!text) throw new ChatError(502, "OpenRouter returned an empty answer.");
  return text;
}
