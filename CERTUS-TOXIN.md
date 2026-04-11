We'll create a new CERTUS‑TOXIN Engine README, adapting the original CERTUS documentation to the HAB toxin detection domain. The engine itself requires minimal changes—the scoring dimensions are conceptually identical, only renamed. I'll provide the full README and then note the minor code adjustments needed.

---

CERTUS‑TOXIN Engine v1.0

Certainty Engineering for Seafood Safety

CERTUS‑TOXIN is the core epistemic scoring engine that powers VERITAS‑SHELLFISH. It computes a Toxin Confidence Index (TCI) for every point‑of‑use test, along with an Uncertainty Mass (UM) that tells harvesters and regulators how much to trust the result itself.

Author: Sheldon K. Salmon & ALBEDO · AionSystem · April 2026
Built for NOAA‑NOS‑NCCOS‑2026‑32955 — HAB Innovation Challenge: Toxin Detection in Seafood

---

The Dispatch Desk — What CERTUS‑TOXIN Actually Is

You don't need the formula to understand this. Start here.

---

Picture a tribal shellfish monitoring coordinator in Southeast Alaska. Harvesters are sending in test results from remote beaches—butter clams, blue mussels, razor clams. Each test is a photo of a lateral flow assay strip, a GPS pin, and a harvest timestamp. Some strips are crystal clear. Some are faint. Some were photographed in bad light. Some were harvested 36 hours ago and the toxin profile may have degraded.

The coordinator has one job: before a beach is closed or opened, before a harvester is told it's safe, before a community's food supply is disrupted—figure out which test results to trust.

That coordinator is CERTUS‑TOXIN.

---

Every test result that arrives gets a number. A number built from four separate lines of evidence—the strip image quality, agreement with nearby tests, the harvest timestamp, and whether the species/toxin combination makes sense. CERTUS‑TOXIN weighs all four, combines them, and writes a single score: a number between 0.0 and 1.0.

But that's not all. CERTUS‑TOXIN also calculates an Uncertainty Mass (UM)—a measure of how much uncertainty is baked into that score. A high-confidence score with low uncertainty is actionable. A high-confidence score with high uncertainty? That's a warning sign.

UM Status Meaning
< 0.35 VALID Score is reliable — act on it
0.35–0.60 DEGRADED Score useful but uncertain — verify locally
0.60 SUSPENDED Do not rely — must confirm with additional testing

Then it stamps the result with a color.

🟢 Green — TCI ≥ 0.70 AND UM < 0.35. CERTUS‑TOXIN is confident. The harvest zone is likely safe (or unsafe, depending on the result). Regulators can act.

🟡 Amber — TCI between 0.40 and 0.69 OR UM 0.35–0.60. Something is uncertain—maybe the test line was faint, maybe only one test was submitted from that zone, maybe the sample is 30 hours old. Monitor. Don't ignore. Don't close the fishery on this alone.

🔴 Red — TCI < 0.40 OR UM > 0.60. CERTUS‑TOXIN is raising its hand. A human (or lab confirmation) needs to look at this before any harvest decision is made. Not because the harvester is wrong—they probably aren't—but because the evidence isn't strong enough yet.

---

There is one additional rule. If two tests from the same harvest zone contradict each other—one says "Positive," one says "Negative"—CERTUS‑TOXIN flags the zone as a conflict. The whole zone goes red immediately, regardless of individual scores. Contradicting tests don't average out. They signal that something is genuinely unknown, and unknown is not a safe basis for action.

A human resolves the conflict (e.g., sends a sample to a lab for HPLC confirmation). Then the zone is re‑evaluated.

---

This is the entire purpose of the engine. Not to replace the harvester. Not to replace the regulator. To sit between them and do the one thing both of them need: translate raw field signals into a number that honestly represents how much those signals should be trusted, and tell you how sure it is about that number.

---

Formula

```
TCI = (0.35 × SCS_eff) + (0.30 × COR) + (0.20 × TFR) + (0.15 × MCS)
```

Component Description Range
SCS_eff Strip Confidence Score — AI analysis of LFA test/control lines via OpenRouter, gated at model confidence ≥0.60, scaled by graduated model trust 0.0 – 1.0
COR Corroboration Score — agreement with independent tests within 50m (same species/toxin), adjusted for evidence independence 0.0 – 1.0
TFR Temporal Freshness — linear decay over 48 hours from harvest time; older samples carry higher uncertainty 0.0 – 1.0
MCS Matrix Consistency Score — cross‑check of species vs. expected toxin profile 0.0 – 1.0

Epistemic Ceiling: No TCI score can exceed 0.95. Field conditions always carry residual uncertainty. This constraint is architectural and not configurable.

---

Graduated Strip Model Trust

CERTUS‑TOXIN does not assume any AI model is trustworthy without a declaration. Instead, it uses a graduated model trust score [0.0–1.0] derived from calibration evidence (validated LFA strip images with known toxin concentrations).

Trust Score Calibration Status SCS UM Penalty Measurement Class
0.0 UNCALIBRATED (no ground truth) 0.20 INFERENTIAL
0.01–0.59 PARTIAL (1–249 validated strips) 0.08–0.20 EVALUATIVE_PARTIAL
0.60–0.85 PARTIAL (250–499 validated strips) 0.03–0.08 EVALUATIVE_PARTIAL
1.0 VERIFIED (formally calibrated) 0.00 EVALUATIVE_CERTIFIED

Current deployment: openrouter/gpt-4o-mini+claude-3.5-sonnet registered as UNCALIBRATED. Full UM penalty applies. Every scored test declares this explicitly. As calibration data accumulates from partner labs (HPLC‑MS reference values), the trust score will be updated via updateModelCalibration().

---

Thresholds & Actions

TCI Range Tier UM Threshold Pin Color Action
≥ 0.70 High Confidence < 0.35 🟢 Green Trusted — regulatory decision support
0.40 – 0.69 Watch < 0.60 🟡 Amber Monitor; verify with additional testing
< 0.40 Review Required any 🔴 Red Lab confirmation required
any any 0.60 🔴 Red Do not act — field verification required

---

Sub-Component Details

1. Strip Confidence Score (SCS_eff)

VERITAS‑SHELLFISH uses OpenRouter to access AI models for LFA strip analysis:

Priority Model Purpose
Primary GPT-4o-mini (OpenAI via OpenRouter) Fast, cost‑efficient test line analysis
Fallback Claude 3.5 Sonnet (Anthropic via OpenRouter) Higher‑accuracy fallback if primary fails

How it works:

1. User captures photo of LFA strip — Canvas API strips EXIF metadata
2. Image sent to OpenRouter with structured prompt: "Analyze this lateral flow assay strip. Identify test line and control line. Estimate intensity ratio and provide confidence."
3. AI returns: test line intensity, control line presence, confidence score
4. CERTUS‑TOXIN derives a model trust score from registered calibration data
5. If AI confidence < 0.60 → SCS_eff applies trust‑scaled gate: max(0.10, 0.30 × (1 − trust_score))
6. If AI confidence ≥ 0.60 → SCS_eff used directly; UM penalty = max(0, 0.20 × (1 − trust_score))
7. If API unavailable → falls back to mock analysis (neutral scores) or offline mode

2. Corroboration Score (COR) — With Evidence Independence

Scenario Score Uncertainty Contribution
No nearby tests (same species/toxin) Not evaluable (excluded) +0.35 UM
One nearby test, agrees 0.55 +0.05 UM
One nearby test, disagrees 0.40 +0.05 UM
Multiple independent tests, strong agreement 0.70 0 UM
Multiple tests, contradiction < 0.40 +0.08 UM
Correlated tests detected (same harvester, same batch) Down‑weighted Treated as fewer independent sources

Evidence Independence Detection. CERTUS‑TOXIN detects when multiple tests are likely from the same source—same submitter, same time window, same GPS cluster. Three tests from the same harvester submitted within minutes are not three independent confirmations.

3. Temporal Freshness (TFR)

Freshness is measured from harvest time, not test time.

```
TFR = max(0, 1 - hours_since_harvest / 48)
```

Hours Since Harvest TFR Status Uncertainty
0 1.0 FRESH 0
12 0.75 FRESH 0
24 0.50 AGING +0.05
36 0.25 STALE +0.10
48+ 0.0 EXPIRED +0.15

4. Matrix Consistency Score (MCS)

Combination MCS Uncertainty Reason
Any + any 1.0 0 Consistent
PST + Butter Clam 1.0 0 Known PST accumulator
PST + Pacific Oyster 0.85 +0.05 Oysters are low PST accumulators; positive result is unusual
ASP + Blue Mussel 1.0 0 Known ASP accumulator
Missing species or toxin 0.80 0 Default

---

Knowledge Base Calibration

CERTUS‑TOXIN includes a Knowledge Base module (accessible in the Regulator Dashboard) where authorized partners upload validated calibration data:

Format Purpose
CSV / Excel Batch upload of LFA intensity vs. HPLC‑MS reference values
PDF reports Laboratory validation reports (SEATOR, FDA, etc.)
Instrument exports Raw HPLC‑MS data

The engine extracts calibration parameters—LOD (µg/100g), threshold AU values, matrix effects—and updates the active calibration model. Every uploaded file is STP‑sealed, and the extraction is logged.

Calibration Status Panel (visible in dashboard):

Toxin LOD (µg/100g) Threshold (AU) Matrix Effects
PST (Saxitoxin) 40 0.42 Butter Clam: 0.95, Blue Mussel: 1.05, Oyster: 0.98
ASP (Domoic Acid) 20 0.38 Blue Mussel: 1.02, Razor Clam: 0.96

---

Uncertainty Mass (UM) — How It Works

UM Components

Source Base Contribution Condition
No photo +0.25 SCS excluded
UNCALIBRATED model +0.20 trust_score = 0.0
PARTIAL calibration +0.03–0.20 trust_score 0.01–0.85
VERIFIED model +0.00 trust_score = 1.0
AI confidence gated Scaled by trust Model confidence < 60%
No corroboration +0.35 COR excluded
Weak corroboration +0.05 Only one nearby test
Contradiction +0.08 Multiple tests disagree
Aging sample +0.05–0.15 Based on hours since harvest
Matrix flagged +0.05–0.08 Suspicious species/toxin combination

UM Calculation

```
UM = 1 − ∏(1 − p_i)
```

UM Thresholds

UM Range Validity Status Meaning
< 0.35 VALID Score is reliable
0.35–0.60 DEGRADED Score useful but uncertain
0.60 SUSPENDED Do not rely on this score

---

Conflict Detection

When two tests within 50 meters (same species/toxin) disagree on result tier (e.g., "Negative" vs. "Positive"), they are flagged as a conflict.

· Conflict = automatic Review Required for that harvest zone
· Individual TCI scores still shown but flagged
· Human or lab confirmation required before regulatory action

---

Output Structure

```javascript
{
  tci: 0.71,                       // Toxin Confidence Index (max 0.95)
  tier: "high",                    // high / watch / review
  usable: true,                    // false if SUSPENDED + no human review

  // Dimensional scores
  tci_scs: 0.85,                   // Strip Confidence Score
  tci_cor: 0.60,                   // Corroboration
  tci_tfr: 0.75,                   // Temporal Freshness
  tci_mcs: 1.0,                    // Matrix Consistency

  // Uncertainty infrastructure
  tci_uncertainty_mass: 0.28,
  tci_validity_status: "VALID",
  tci_um_breakdown: [
    "✅ Strip image clear — model UNCALIBRATED, full penalty applied",
    "⚠️ No corroborating tests yet — encourage additional sampling"
  ],

  // Calibration context
  calibration: {
    toxin: "PST",
    lod_ug_100g: 40,
    threshold_au: 0.42,
    matrix_effect: 0.95,
    last_updated: "2026-04-11T09:22:00Z"
  },

  // Assumptions (plain language)
  tci_assumptions: "⚠️ First test in this harvest zone. No other tests to confirm result.",

  // Actionable guidance
  tci_field_view: {
    action: "SHARE THIS RESULT",
    confidence: "HIGH",
    what_to_do: "Send this to your monitoring coordinator. The result is verified.",
    share_code: "VTS-8A3F-9B2E"
  },

  // Constitutional status (inherited from CERTUS)
  constitutional_status: {
    law_4_compliant: true,
    prohibited_uses: ["community profiling", "discriminatory closure"],
    prohibited_uses_enforcement: "CALLER_RESPONSIBILITY"
  }
}
```

---

Initialization (VERITAS‑SHELLFISH)

```javascript
await CERTUS_TOXIN.initialize(supabaseUrl, supabaseKey, {
  stripModel: {
    id: 'openrouter/gpt-4o-mini+claude-3.5-sonnet',
    type: 'openrouter',
    calibration_status: 'UNCALIBRATED',
    calibration_samples: 0,
    calibration_dataset: 'Primary: openai/gpt-4o-mini, Fallback: anthropic/claude-3-5-sonnet',
    registered_by: 'certus-toxin-deployment'
  }
});

// As lab validation data accumulates (HPLC‑MS reference):
await CERTUS_TOXIN.updateModelCalibration(validatedSampleCount, 'PARTIAL');
```

---

Code Adaptation Notes

The original certus-engine-v2.5.3.js can be adapted with minimal changes:

1. Rename variables:
   · DCI → TCI
   · PES → SCS
   · CCI → MCS
   · dci_* → tci_*
2. Update TFR decay source: Instead of using report timestamp, use the user‑provided harvestTime field.
3. Update MCS logic: Replace damage/infrastructure consistency rules with species/toxin matrix rules (as defined above).
4. Add calibration panel integration: The engine should expose a method getCalibrationParams() that returns the current LOD, threshold, and matrix effects for the active toxin.

The core scoring formula, graduated trust model, UM calculation, and constitutional governance remain identical. The engine is domain‑agnostic by design.

---

CERTUS‑TOXIN Engine v1.0 — Certainty engineering for seafood safety.
Built for NOAA‑NOS‑NCCOS‑2026‑32955
Copyright © 2026 Sheldon K. Salmon & ALBEDO