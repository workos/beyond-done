import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChatDrawer } from "./ChatDrawer.js";
import { InlineDemo } from "./InlineDemo.js";
import type { GlossaryTerm, WorkshopGlossary } from "./schema.js";

interface CrossLinkIndex {
  regex: RegExp | null;
  terms: Map<string, GlossaryTerm>;
}

function buildCrossLinkIndex(workshop: WorkshopGlossary): CrossLinkIndex {
  const terms = new Map<string, GlossaryTerm>();
  const aliases: string[] = [];
  for (const term of workshop.sections.flatMap((section) => section.terms)) {
    for (const alias of [term.term, ...term.aliases]) {
      if (alias.length < 3) continue;
      terms.set(alias.toLowerCase(), term);
      aliases.push(alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    }
  }
  aliases.sort((a, b) => b.length - a.length);
  return { regex: aliases.length ? new RegExp(`\\b(${aliases.join("|")})\\b`, "gi") : null, terms };
}

function CrossLinkedText({ text, selfId, index }: { text: string; selfId: string; index: CrossLinkIndex }) {
  const nodes = useMemo(() => {
    if (!index.regex) return [text] as Array<string | { id: string; text: string }>;
    const output: Array<string | { id: string; text: string }> = [];
    const linked = new Set<string>();
    let last = 0;
    let match: RegExpExecArray | null;
    index.regex.lastIndex = 0;
    while ((match = index.regex.exec(text)) && linked.size < 3) {
      const term = index.terms.get(match[1].toLowerCase());
      if (!term || term.id === selfId || linked.has(term.id)) continue;
      output.push(text.slice(last, match.index), { id: term.id, text: match[1] });
      linked.add(term.id);
      last = match.index + match[0].length;
    }
    output.push(text.slice(last));
    return output;
  }, [index, selfId, text]);

  return nodes.map((node, index) =>
    typeof node === "string" ? <Fragment key={index}>{node}</Fragment> : <a className="cross-link" href={`#${node.id}`} key={`${node.id}-${index}`}>{node.text}</a>,
  );
}

function useStoredSet(key: string) {
  const [items, setItems] = useState<Set<string>>(new Set());
  useEffect(() => {
    try { setItems(new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])); } catch { setItems(new Set()); }
  }, [key]);

  const toggle = (id: string) => setItems((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    try { localStorage.setItem(key, JSON.stringify([...next])); } catch { /* continue without persistence */ }
    return next;
  });
  return { items, toggle };
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      setProgress(root.scrollHeight === root.clientHeight ? 0 : Math.min(100, root.scrollTop / (root.scrollHeight - root.clientHeight) * 100));
    };
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, []);
  return progress;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const update = () => {
      let current = ids[0] ?? "";
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 150) current = id;
      }
      setActive(current);
    };
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, [ids]);
  return active;
}

async function share(title: string, url: string): Promise<boolean> {
  if (navigator.share) {
    try { await navigator.share({ title, url }); return true; } catch { /* clipboard fallback */ }
  }
  try { await navigator.clipboard.writeText(url); return true; } catch { return false; }
}

function slideHref(workshop: WorkshopGlossary, slide: number): string {
  return `${workshop.slidesUrl.replace(/\/$/, "")}/${slide}/`;
}

function Quiz({ workshop }: { workshop: WorkshopGlossary }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const question = workshop.quiz[index];
  if (!question) return null;

  const choose = (choice: number) => {
    if (answer !== null) return;
    setAnswer(choice);
    if (choice === question.answerIndex) setScore((value) => value + 1);
  };
  const next = () => {
    setAnswer(null);
    setIndex((value) => (value + 1) % workshop.quiz.length);
  };

  return (
    <section className="quiz" id="quiz">
      <div className="section-kicker">Check your understanding</div>
      <div className="quiz-meta">Question {index + 1} of {workshop.quiz.length} · Score {score}</div>
      <h2>{question.question}</h2>
      <div className="quiz-choices">
        {question.choices.map((choice, choiceIndex) => {
          const state = answer === null ? "" : choiceIndex === question.answerIndex ? "correct" : choiceIndex === answer ? "wrong" : "muted";
          return <button className={state} disabled={answer !== null} key={choice} onClick={() => choose(choiceIndex)}>{choice}</button>;
        })}
      </div>
      {answer !== null && <div className="quiz-answer"><p>{answer === question.answerIndex ? "Correct." : "Not quite."} {question.explanation}</p><button onClick={next}>Next question →</button></div>}
    </section>
  );
}

function TermEntry({ term, workshop, learned, toggleLearned, crossLinks }: {
  term: GlossaryTerm;
  workshop: WorkshopGlossary;
  learned: boolean;
  toggleLearned: (id: string) => void;
  crossLinks: CrossLinkIndex;
}) {
  const [copied, setCopied] = useState(false);
  const resources = workshop.resources.filter((resource) => resource.termIds.includes(term.id));
  const related = term.relatedTermIds
    .map((id) => workshop.sections.flatMap((section) => section.terms).find((candidate) => candidate.id === id))
    .filter((candidate): candidate is GlossaryTerm => Boolean(candidate));

  const shareTerm = async () => {
    const url = new URL(window.location.href);
    url.hash = term.id;
    if (await share(term.term, url.toString())) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1_500);
    }
  };

  return (
    <article className={`term-entry ${learned ? "learned" : ""}`} id={term.id}>
      <div className="term-title-row">
        <h3>{term.term}<a className="anchor" href={`#${term.id}`} aria-label={`Link to ${term.term}`}>#</a></h3>
        <div className="term-actions">
          <button onClick={shareTerm}>{copied ? "Copied" : "Share"}</button>
          <button aria-pressed={learned} onClick={() => toggleLearned(term.id)}>{learned ? "Learned ✓" : "Mark learned"}</button>
        </div>
      </div>
      <p className="definition"><CrossLinkedText text={term.definition} selfId={term.id} index={crossLinks} /></p>
      <p className="why"><strong>Why it matters</strong>{term.whyItMatters}</p>
      {term.hear && <p className="hear"><span>You’ll hear</span>{term.hear}</p>}
      <InlineDemo kind={term.demo} />
      {(related.length > 0 || resources.length > 0 || (workshop.slidesUrl && term.slide)) && (
        <div className="term-links">
          {related.map((item) => <a href={`#${item.id}`} key={item.id}>{item.term}</a>)}
          {resources.map((resource) => resource.url ? <a href={resource.url} key={resource.id} rel="noreferrer" target="_blank">{resource.title} ↗</a> : <span key={resource.id}>{resource.title}</span>)}
          {workshop.slidesUrl && term.slide && <a href={slideHref(workshop, term.slide)}>Slide {term.slide} →</a>}
        </div>
      )}
      {workshop.slidesUrl && term.sourcePath && <div className="source-path">Source: {term.sourcePath}{term.slide ? ` · slide ${term.slide}` : ""}</div>}
    </article>
  );
}

function accentContrast(hex: string): "#111111" | "#ffffff" {
  const [red, green, blue] = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  return (red * 299 + green * 587 + blue * 114) / 1_000 > 150 ? "#111111" : "#ffffff";
}

export function Glossary({ workshop }: { workshop: WorkshopGlossary }) {
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("workshop-companion-theme") === "dark"; } catch { return false; }
  });
  const progress = useReadingProgress();
  const sectionIds = useMemo(() => workshop.sections.map((section) => section.id), [workshop]);
  const activeSection = useActiveSection(sectionIds);
  const crossLinks = useMemo(() => buildCrossLinkIndex(workshop), [workshop]);
  const { items: learned, toggle: toggleLearned } = useStoredSet(`workshop-companion-learned:${workshop.slug}`);
  const allTerms = workshop.sections.flatMap((section) => section.terms);
  const normalizedQuery = query.trim().toLowerCase();
  const sections = normalizedQuery
    ? workshop.sections.map((section) => ({
        ...section,
        terms: section.terms.filter((term) => [term.term, term.definition, term.whyItMatters, ...term.aliases].some((value) => value.toLowerCase().includes(normalizedQuery))),
      })).filter((section) => section.terms.length)
    : workshop.sections;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = dark ? "dark" : "light";
    root.dataset.palette = workshop.theme.preset;
    root.style.setProperty("--accent", workshop.theme.accent);
    root.style.setProperty("--accent-dark", workshop.theme.accent);
    root.style.setProperty("--accent-contrast", accentContrast(workshop.theme.accent));
    try { localStorage.setItem("workshop-companion-theme", dark ? "dark" : "light"); } catch { /* continue without persistence */ }
  }, [dark, workshop.theme]);

  return (
    <div>
      <div className="reading-progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>
      <header className="hero">
        <div className="measure">
          <div className="topline"><span>{workshop.event || "Workshop companion"}</span><button onClick={() => setDark((value) => !value)}>{dark ? "Light" : "Dark"}</button></div>
          <h1>{workshop.title}</h1>
          <p className="subtitle">{workshop.subtitle}</p>
          <p className="promise">No dumb questions. Use this page during the workshop and keep it afterward.</p>
          <dl className="stats">
            <div><dt>Terms</dt><dd>{allTerms.length}</dd></div>
            <div><dt>Levels</dt><dd>{workshop.sections.length}</dd></div>
            <div><dt>Resources</dt><dd>{workshop.resources.length}</dd></div>
            <div><dt>Learned</dt><dd>{learned.size}/{allTerms.length}</dd></div>
          </dl>
        </div>
      </header>

      <nav className="jumpbar" aria-label="Glossary sections">
        <div className="measure jumpbar-inner">
          {workshop.sections.map((section, index) => <a className={activeSection === section.id ? "active" : ""} href={`#${section.id}`} key={section.id}><span>{index}</span>{section.name}</a>)}
          <a href="#quiz">Quiz</a>
          <label className="search"><span className="sr-only">Search glossary</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${allTerms.length} terms`} /></label>
        </div>
      </nav>

      <main className="measure main">
        {sections.length === 0 && <div className="empty">Nothing matches “{query}”. Try a shorter word.</div>}
        {sections.map((section, index) => (
          <section className="level" id={section.id} key={section.id}>
            <div className="level-head"><span>0{index}</span><div><div className={`difficulty ${section.difficulty}`}>{section.difficulty}</div><h2>{section.name}</h2></div><small>{section.terms.length} terms</small></div>
            <p className="level-intro">{section.intro}</p>
            {section.terms.map((term) => <TermEntry crossLinks={crossLinks} key={term.id} learned={learned.has(term.id)} term={term} toggleLearned={toggleLearned} workshop={workshop} />)}
          </section>
        ))}

        {workshop.resources.length > 0 && <section className="resources"><div className="section-kicker">Keep going</div><h2>Workshop resources</h2><div className="resource-grid">{workshop.resources.map((resource) => {
          const content: ReactNode = <><strong>{resource.title}</strong><span>{resource.description}</span>{workshop.slidesUrl && <small>{resource.sourcePath}</small>}</>;
          return resource.url ? <a href={resource.url} key={resource.id} rel="noreferrer" target="_blank">{content}</a> : <div key={resource.id}>{content}</div>;
        })}</div></section>}
        <Quiz workshop={workshop} />
        <footer><strong>{workshop.title}</strong><span>{workshop.credit}{workshop.credit ? " · " : ""}Updated {workshop.updated}</span></footer>
      </main>
      <ChatDrawer workshop={workshop} />
    </div>
  );
}

export default function App() {
  const [workshop, setWorkshop] = useState<WorkshopGlossary | null>(null);
  const [error, setError] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    fetch(new URL("glossary.json", document.baseURI))
      .then(async (response) => {
        if (!response.ok) throw new Error(`Glossary data was not found (${response.status}).`);
        return await response.json() as WorkshopGlossary;
      })
      .then(setWorkshop)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load the glossary."));
  }, []);

  if (error) return <main className="status"><h1>Glossary unavailable</h1><p>{error}</p></main>;
  if (!workshop) return <main className="status"><p>Loading glossary…</p></main>;
  return <Glossary workshop={workshop} />;
}
