---
title: "Optional appendix: System 1 and System 2"
class: decision-appendix-slide
clicks: 2
---

<DecisionAppendix topic="roles" />

<!--
OPTIONAL APPENDIX · Outside the 60-minute workshop. Five slides for a 3–8 minute detour; enter here from the slide overview after Q&A. Each can stand alone. No live service or key required.

Why: give the emerging decision-model category a place in the architecture the audience just built.

0: System 2 is our analogy for open-ended planning, investigation and repair. A coding agent may need a long chain of actions to solve a problem.
1: System 1 is our analogy for a frequent, bounded judgment over supplied evidence. “Does this wording promise a seat?” is a different workload from “Fix the signup flow.” Jev is designed for this kind of typed decision, rather than free-form generation.
2: The observer and policy still matter. Neither model role gets privileged knowledge of the real app. The app tools gather state; code applies explicit stopping rules.

Vamp: Where does your agent repeatedly spend time explaining something when the application only needs a yes/no, category or rubric score? Those are candidate places to evaluate a decision model. A simple exact check remains a better starting point when it expresses the requirement.

Source: https://typesafe.ai/blog/introducing-system-one-models-and-jev
The fast/slow language is an architectural analogy inspired by human cognition, not a literal model of these systems. Avoid calling all LLMs slow or all decision models correct. Latency depends on the workload and deployment.
-->

---
title: "Optional appendix: Where a semantic judge helps"
class: night decision-appendix-slide
clicks: 2
---

<DecisionAppendix topic="example" />

<!--
OPTIONAL APPENDIX · One concrete job for the judge.

0: A stored waitlist record can be correct while the message tells the user their seat is confirmed. Assert the stored state with code. Ask a semantic model about the meaning of the observed copy when legitimate wording can vary.
1: These are actual saved Jev probabilities for the two questions in our overpromise example: 0.01 for waitlist-only meaning, 0.02 for a conditional next step. They are probabilities of yes, not task-completion percentages. The complete rubric and exact input are in the saved capture.
2: The application's policy selected repair. Jev did not fix the app or decide that a new attempt was verified. After repair, gather fresh evidence and check again.

Vamp: “You're in” is context-dependent. The surrounding “seat is confirmed” makes this example clear. What ambiguous copy in your product deserves a rubric? If every correct message can be a fixed template, use that simpler option.

Evidence: public/materials/jev-recording.json, scenario=overpromise, captured 2026-10-08T22:37:29.071Z, model=jev-1.13.0. This is one recorded example on fictional workshop data, not a new call or a study of model accuracy. The capture holds the confirmations and questions; it is not a complete browser trace.
Primitive reference: https://docs.typesafe.ai/primitives/noul
-->

---
title: "Optional appendix: Jev, Clef and OpenAI Decisions"
class: decision-appendix-slide
clicks: 2
---

<DecisionAppendix topic="models" />

<!--
OPTIONAL APPENDIX · Vendor map, checked 12 October 2026.

0: Jev is TypeSafe's decision model. Explain the yes/no concept first: its name in this API is noul. Choice selects from specified categories; score evaluates an ordered rubric. The application supplies the state and the questions.
1: Cloudflare's Clef and Clef-flash add a deployment choice: Workers AI hosting and Apache 2.0 model weights. Cloudflare documents compatibility with the System One interface. That is interface compatibility, not a guarantee that model answers or thresholds transfer unchanged. The Cloudflare model docs also describe image inputs.
2: OpenAI's dedicated Decisions endpoint is in public beta, currently with gpt-6-luna. It takes text/images and typed questions. Predicate returns a probability; choice selects a category; score evaluates ordered levels. Its request uses input and a questions array; System One uses state and a question map. This is not an identical wire format.

Vamp: The transferable idea is a narrow model call inside ordinary software. Choose from your own quality, latency, cost, privacy and deployment requirements. The table is not a quality ranking. Vendor speed claims are not a head-to-head measurement of our app.

Sources:
- https://typesafe.ai/blog/introducing-system-one-models-and-jev
- https://docs.typesafe.ai/primitives/noul
- https://docs.typesafe.ai/primitives/choice
- https://docs.typesafe.ai/primitives/score
- https://blog.cloudflare.com/clef-decision-models/
- https://developers.cloudflare.com/workers-ai/models/clef/
- https://developers.openai.com/api/docs/guides/decisions

OpenAI distinction: Decisions is for its supported answer types. For custom JSON extraction or a generated explanation, its docs point to Structured Outputs; to request execution, function calling. Our policy must handle refusal, timeout or missing answers as unavailable judgment, not a passing check.
-->

---
title: "Optional appendix: The verifier architecture"
class: indigo decision-appendix-slide
clicks: 3
---

<DecisionAppendix topic="loop" />

<!--
OPTIONAL APPENDIX · Walk the architecture without tying it to one vendor.

0: Observe: the agent's claim is not input evidence. Drive the actual app and read back the relevant state. Bind it to the revision and run.
1: Check: exact requirements stay in code. A narrow semantic model receives the trusted rubric plus the observed, untrusted content. It can judge meaning or classify a failure; it cannot fill in missing observations. Separating worker and judge roles helps structure the system but does not guarantee independent errors.
2: Decide: policy handles hard failures, ambiguous answers, refusal and missing evidence. Never let a high semantic score override a failed hard requirement. Enforce timeouts, retry caps and permissions outside the model.
3: Keep: the receipt preserves the evidence, model/version, rubric, answer and final decision. Repair creates a new attempt; earlier passes do not carry across changed code. This is the Riker/CTX idea applied to a semantic check.

Vamp: A decision model may also route work to the right tool or trigger a more expensive investigation. Measure that routing step too; otherwise a fast wrong route can increase total time. Our recommendation is to make the verifier's evidence and policy inspectable even when one judgment is probabilistic.

This is our design synthesis, not a vendor's claim that its model is a complete verifier.
API reference for typed answers, refusal handling and application-specific thresholds: https://developers.openai.com/api/docs/guides/decisions
-->

---
title: "Optional appendix: Evaluating and improving the judge"
class: night decision-appendix-slide
clicks: 2
---

<DecisionAppendix topic="evaluate" />

<!--
OPTIONAL APPENDIX · End with an experiment, not a shopping list.

0: Pick one recurring judgment. Compare a simple assertion or fixed template with a model only where the requirement needs meaning rather than exact matching.
1: Build reviewed examples of good work, bad work, ambiguous cases and missing evidence. Choose thresholds based on the cost of each error. Evaluate the complete loop, including unnecessary retries and human interruptions, not just milliseconds per model call. Keep a separate set of cases out of prompt and threshold tuning.
2: Our recommendation: retain the bad accepts and false alarms as labeled cases. Version the rubric. Change one variable, evaluate against the baseline, and promote only when the result supports it. These records can also be curated into training data, with permission and separate evaluation data.

Cloudflare connection: its 1 October Clef announcement describes a hands-on FDE service for workload-specific fine-tuning and a planned self-serve flow across Gateway data capture, Workers AI rollouts, Containers, training and redeployment. Do not present that roadmap as an already-general self-serve product. A request log is raw material; it still needs labels and independent evaluation.

Sources:
- https://developers.openai.com/api/docs/guides/decisions (application labels and threshold tradeoffs)
- https://blog.cloudflare.com/clef-decision-models/ (assisted fine-tuning service and platform direction)

Close: “Use the cheapest reliable check for the job. Keep enough evidence to find out when it wasn't reliable.” Stop here, or return to the Q&A/Booth slide with the overview.
-->
