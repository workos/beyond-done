# Transfer worksheet — build a verification loop for YOUR project

> Beyond "Done": Building Verification Loops for AI Agents. Print this, or copy
> it into your notes. Fill it in for a system you actually ship.

The loop:  **observe → ask → decide → bounded repair**

---

**Project / feature:** ______________________________________________

---

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

### 3. Two honest questions (yes/no, answerable from the evidence)

- criterion A: _______________________________________________________
- criterion B: _______________________________________________________

> A judge's answer is a **probability of yes** (a Noul) — not confidence, not
> proof.

### 4. Hard checks (must be true regardless of any probability)

```
- _____________________________________________________________________
- _____________________________________________________________________
```

### 5. Fail-closed path
What happens when you *can't* judge (missing evidence, judge/model down)?
(Hint: escalate — not accept, not "blame the product.")

```
_______________________________________________________________________
```

### 6. Repair budget
How many automatic repairs before a human is pulled in? ____  (we used **1**)

### 7. Thresholds + holdout
Acceptance bar: ______   Cases you'll hold out to sanity-check it (and NOT tune
against):

```
_______________________________________________________________________
```

---

### Don't overstate what you built

- [ ] A Noul is the probability of yes — not confidence, not proof.
- [ ] Synthetic scores are fixtures — not live measurements or model accuracy.
- [ ] Browser-local prototype — no real enrollment, email, or payment.
- [ ] Process separation ≠ security sandbox; injection guidance ≠ guarantee.
- [ ] A small hand-authored suite ≠ production reliability.
- [ ] Accept-after-repair (fresh evidence) is not a false accept.

**Cost check:** A bad acceptance costs ______. An unnecessary interruption costs ______.

**One adversarial example:** __________________________________________

**Who receives escalation, and what evidence do they need?** _____________
