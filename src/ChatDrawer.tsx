import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { WorkshopGlossary } from "./schema.js";
import type { ChatMessage } from "./openrouter.js";

export function ChatDrawer({ workshop }: { workshop: WorkshopGlossary }) {
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const terms = workshop.sections.flatMap((section) => section.terms);
  const suggestions = useMemo(() => {
    const first = terms[0]?.term ?? "the first concept";
    const second = terms[1]?.term ?? "the next concept";
    return [`Explain ${first} simply.`, `How do ${first} and ${second} differ?`, `What should I remember from this workshop?`];
  }, [terms]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/chat/status", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) return;
        const status = await response.json() as { enabled?: boolean } | null;
        setAvailable(status?.enabled === true);
      })
      .catch(() => { /* Unavailable chat stays hidden. */ });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, pending]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, []);

  const send = async (text: string) => {
    const content = text.trim().slice(0, 500);
    if (!content || pending) return;
    const next = [...messages, { role: "user", content } satisfies ChatMessage];
    setMessages(next);
    setInput("");
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const body = await response.json() as { message?: string; error?: string };
      if (!response.ok || !body.message) throw new Error(body.error ?? `Chat failed (${response.status}).`);
      setMessages((current) => [...current, { role: "assistant", content: body.message! }]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The question did not go through.");
    } finally {
      setPending(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  if (!available) return null;

  return (
    <>
      <button className={`chat-fab ${open ? "hidden" : ""}`} onClick={() => setOpen(true)} aria-label="Ask the workshop glossary">Ask anything</button>
      {open && <aside className="chat-drawer" role="dialog" aria-modal="true" aria-label="Ask the workshop glossary">
        <header><div><strong>Ask the glossary</strong><span>Answers use this workshop’s terms</span></div><button onClick={() => setOpen(false)} aria-label="Close chat">×</button></header>
        <div className="chat-body" ref={bodyRef}>
          {messages.length === 0 && <div className="chat-empty"><p>Ask about a term or how two ideas fit together.</p>{suggestions.map((suggestion) => <button key={suggestion} onClick={() => void send(suggestion)}>{suggestion}</button>)}</div>}
          {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.content}</div>)}
          {pending && <div className="chat-message assistant pending">Thinking…</div>}
          {error && <div className="chat-error">{error}</div>}
        </div>
        <form className="chat-input" onSubmit={submit}><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} placeholder="Ask a question…" aria-label="Question" /><button disabled={pending || !input.trim()} type="submit">Send</button></form>
      </aside>}
    </>
  );
}
