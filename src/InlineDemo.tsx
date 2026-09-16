import type { DemoKind } from "./schema.js";

export function InlineDemo({ kind }: { kind: DemoKind }) {
  if (kind === "none") return null;

  if (kind === "agent-loop") {
    return (
      <div className="demo demo-loop" aria-label="Agent loop: think, act, check, repeat">
        <span>think</span><i>→</i><span>act</span><i>→</i><span>check</span><i className="repeat">↻</i>
      </div>
    );
  }
  if (kind === "context-window") {
    return (
      <div className="demo demo-context" aria-label="A finite context window">
        <div>{Array.from({ length: 12 }, (_, index) => <i className={index > 8 ? "faded" : ""} key={index} />)}</div>
        <span>working context is finite</span>
      </div>
    );
  }
  if (kind === "tool-use") {
    return (
      <div className="demo demo-flow" aria-label="A model calls a tool and receives a result">
        <span>model</span><i>request</i><span>tool</span><i>result</i><span>model</span>
      </div>
    );
  }
  if (kind === "verification-gate") {
    return (
      <div className="demo demo-gate" aria-label="Work must pass a verification gate">
        <span>work</span><i>→</i><strong>check</strong><i>→</i><span>done</span>
      </div>
    );
  }
  return (
    <div className="demo demo-fan" aria-label="One coordinator fans work out to three workers">
      <strong>coordinator</strong><i /><div><span>worker</span><span>worker</span><span>worker</span></div>
    </div>
  );
}
