# Transfer worksheet — build a verification loop for YOUR project

> Beyond "Done": Building Verification Loops for AI Agents. Print this, or copy
> it into your notes. Fill it in for a system you actually ship.

The loop:  **observe → fix → prove**

---

**Project / feature:** ______________________________________________

---

### Start here in class: one feature map (two minutes)

Inspired by [Lauren Tan's pstack verification workflow](https://x.com/poteto/status/2094457600259842065). Give an agent a repeatable way to launch the app, exercise one real user path, and show proof.

| Feature + user path | Launch command / URL | Check command + receipt location | Stop / ask for help |
| --- | --- | --- | --- |
| | | | |

Which command can you rerun after a repair? _____________________________

**My first next action:** ______________________________________________

**Owner / when:** _____________________________________________________

Finish the more detailed plan below after class. Lesson 07 has the first-30-minutes plan and copyable prompts for an app verifier and Chrome DevTools.

### 1. The "done" that lies
What shallow "green" do people trust that doesn't mean what they think?

```
_______________________________________________________________________
```

### 2. Independent evidence
What would you observe *from the outside* to check it for real?

```
_______________________________________________________________________
```

### 3. Meaning checks (yes/no questions a model or a human could answer)

- criterion A: _______________________________________________________
- criterion B: _______________________________________________________

> A judge's answer is a **probability of yes** (a Noul) — not confidence, not
> proof.

### 4. Hard checks for your `prove` (assertions, including side effects)

```
- _____________________________________________________________________
- _____________________________________________________________________
```

### 5. "Can't tell" path
What happens when evidence is missing or stale, or the judge is down?
(Hint: it's never a pass, and never a reason to change the app.)

```
_______________________________________________________________________
```

### 6. Repair budget
How many fixes before a human is pulled in? ____  (we used **2**)

### 7. Eval cases + holdout
The misses you'll keep as regression cases, and the cases you'll hold out to
sanity-check changes (and NOT tune against):

```
_______________________________________________________________________
```

---

### 8. The receipt I will preserve

- Task / run / attempt IDs: ___________________________________________
- Exact artifact revision + verifier version: _________________________
- Inputs, actions and observed outputs: _______________________________
- Decision, reasons and independent outcome label: ____________________
- Trace / screenshot / report location: _______________________________
- Model/tool/environment versions + time/cost: _________________________

Keep failures and escalations too. Use fresh evidence after each change. A hash identifies bytes; it does not prove the check was correct.

### 9. The first comparison

**One failure to turn into a labeled case:** ____________________________

**One thing I will change (tool / prompt / policy):** ____________________

**Frozen cases + grader:** ____________________________________________

**Measure (bad accepts, interruptions, time, cost):** ____________________

**Untouched cases to check before promotion:** _________________________

**Experiment budget / promotion owner / rollback:** ____________________

Later, curated and permitted runs can support fine-tuning. Review labels, redact sensitive data, and separate related task families across training and evaluation. Saving logs alone does not train or improve a system.

### Don’t overstate what you built

- [ ] A Noul is the probability of yes — not confidence, not proof.
- [ ] A receipt belongs to one revision; "can't tell" is never a pass.
- [ ] Browser-local prototype — no real enrollment, email, or payment.
- [ ] A revision hash ≠ isolation from an agent with a shell.
- [ ] One app and five bugs ≠ production reliability.
- [ ] A PASS after a fix needs fresh evidence; the earlier FAIL stays in the history.

**Cost check:** A bad acceptance costs ______. An unnecessary interruption costs ______.

**One adversarial example:** __________________________________________

**Who receives escalation, and what evidence do they need?** _____________
