![1000008677](https://github.com/user-attachments/assets/3c384bfa-10c7-40cf-8852-100912a9cc14)

# VERITAS‑SHELLFISH — HAB Toxin Detection Platform

<!-- STATUS · VERSION · COMPLIANCE -->
[![DOI](https://zenodo.org/badge/1207402357.svg)](https://doi.org/10.5281/zenodo.19520897)
[![Status](https://img.shields.io/badge/STATUS-Simulation_%7C_NOAA_LOI-1B3B6F?style=flat-square)](https://github.com/AionSystem/VERITAS-SHELLFISH)
[![Version](https://img.shields.io/badge/version-v1.0.0-orange)](#)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Commercial License](https://img.shields.io/badge/Commercial-License%20Available-orange)](COMMERCIAL-LICENSE.md)
[![ORCID — Sheldon K. Salmon](https://img.shields.io/badge/ORCID-0009--0005--8057--5115-a6ce39?style=flat&logo=orcid&logoColor=white)](https://orcid.org/0009-0005-8057-5115)

<!-- CORE ARCHITECTURE -->
[![CERTUS‑TOXIN Engine](https://img.shields.io/badge/CERTUS--TOXIN-v1.1-4ade80?style=flat-square)](https://github.com/AionSystem/VERITAS-SHELLFISH)
[![STP](https://img.shields.io/badge/STP-Integrated-2E7D32?style=flat-square&logo=git&logoColor=white)](https://github.com/AionSystem/SOVEREIGN-TRACE-PROTOCOL)
[![Seal](https://img.shields.io/badge/Seal-SHA--256%20Bound-4527A0?style=flat-square&logo=hashnode&logoColor=white)](https://github.com/AionSystem/VERITAS-SHELLFISH)

<!-- TECH STACK -->
[![OpenRouter](https://img.shields.io/badge/OpenRouter-GPT--4o--mini_%2B_Claude_3.5_Sonnet-4285F4?style=flat-square)](https://openrouter.ai)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-5A0FC8?style=flat-square)](#)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow)](#)
[![Feedback Welcome](https://img.shields.io/badge/Feedback-welcome-brightgreen)](https://github.com/AionSystem/VERITAS-SHELLFISH/issues/new/choose)

> **Certainty engineering for seafood safety.**
> NOAA‑NOS‑NCCOS‑2026‑32955 LOI Demonstration · April 2026

---

## Table of Contents

1. [LOI Video Showcase](#loi-video-showcase)
2. [Architect's Note on AI Use](#architects-note-on-ai-use)
3. [Quick Start](#quick-start)
4. [Repository Structure](#repository-structure)
5. [Overview](#overview)
6. [CERTUS‑TOXIN Engine](#certus-toxin-engine)
   - [Scoring Dimensions](#scoring-dimensions-toxin-confidence-index)
   - [Confidence Output](#confidence-output)
   - [Uncertainty Mass](#uncertainty-mass)
7. [AI Strip Analysis](#ai-strip-analysis--openrouter-integration)
8. [Knowledge Base & Calibration](#knowledge-base--calibration)
9. [Sovereign Trace Protocol Integration](#sovereign-trace-protocol-integration)
10. [Technical Stack](#technical-stack)
11. [Three Core Modules](#three-core-modules)
    - [Test Shellfish](#-test-shellfish--community-submission)
    - [Unsafe Harvest Alert](#%EF%B8%8F-unsafe-harvest-alert--emergency-signal)
    - [Regulator Dashboard](#-regulator-dashboard--access-code-gated)
12. [Anonymization & Data Sovereignty](#anonymization--data-sovereignty)
13. [Installation & Deployment](#installation--deployment)
14. [License](#license)
15. [Acknowledgments](#acknowledgments)

---

## LOI Video Showcase

**[Watch the silent walkthrough on YouTube](https://youtube.com/shorts/HZ-kB39AqNs)**

[![VERITAS‑SHELLFISH Demo](https://img.shields.io/badge/YouTube-Demo_Walkthrough-red?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/shorts/HZ-kB39AqNs)

---

## Architect's Note on AI Use

This platform was designed, architected, and directed by **Sheldon K. Salmon**. AI tools (large language models) were used as instruments — the same way a laboratory uses a spectrophotometer.

The intellectual core — the **CERTUS‑TOXIN Engine** adaptation for toxin detection, the **Confidence Scoring** dimensions, the **Knowledge Base** calibration workflow, the **STP** sealing integration, and the overall architectural vision — is wholly human‑originated.

The NOAA NOFO explicitly notes that submissions produced solely with generative AI are not of interest. VERITAS‑SHELLFISH is **not** a generative AI output; it is a human‑built system where AI serves as one of several tools under strict human oversight. Every line of code, every design decision, and every formula reflects human intent.

---

## Quick Start

Get the VERITAS‑SHELLFISH simulation running in under a minute.

```bash
git clone https://github.com/AionSystem/VERITAS-SHELLFISH.git
cd VERITAS-SHELLFISH
```

Open `public/index.html` directly in your browser.

For full offline capability (Service Worker, IndexedDB), serve the files through a local web server:

```bash
cd public
python3 -m http.server 8000
# Visit http://localhost:8000
```

> **Regulator access:** Use code `NOAA2026` to unlock the Regulator Dashboard, Knowledge Base, and Audit Trail Verifier.

---

## Repository Structure

> **Key files for evaluators:**
> `public/index.html` — full platform · `public/certus-toxin-engine-v1.1.js` — scoring logic · `public/ai-analysis-shellfish.js` — OpenRouter integration

```
VERITAS-SHELLFISH/
├── public/                               ← Static frontend assets
│   ├── index.html                        ← Main VERITAS‑SHELLFISH interface
│   ├── certus-toxin-engine-v1.1.js       ← CERTUS‑TOXIN Engine (epistemic scoring)
│   ├── ai-analysis-shellfish.js          ← OpenRouter AI integration (LFA strip analysis)
│   ├── manifest.json                     ← PWA manifest
│   ├── sw.js                             ← Service Worker (offline capability)
│   └── icons/                            ← App icons for PWA
│
├── api/                                  ← Vercel serverless functions
│   ├── analyze-strip.js                  ← AI strip analysis endpoint (OpenRouter)
│   ├── stp-seal-shellfish.js             ← STP seal service (GitHub ledger)
│   └── templates/                        ← STP template registry
│       ├── 17-shellfish-test.json        ← SHELLFISH-TEST template
│       ├── 18-shellfish-calibration.json ← SHELLFISH-CALIBRATION template
│       └── 19-shellfish-export.json      ← SHELLFISH-EXPORT template
│
├── docs/                                 ← Documentation
│   ├── CERTUS-TOXIN.md                   ← CERTUS‑TOXIN Engine documentation
│   └── NOAA-LOI-SUBMISSION.md            ← LOI text and compliance notes
│
├── LICENSE                               ← GPL-3.0
├── COMMERCIAL-LICENSE.md                 ← Commercial licensing terms
└── README.md                             ← This file
```

---

## Overview

Most point‑of‑use toxin tests stop at a binary result. They do not tell a harvester, a regulator, or a tribal monitoring program how much to trust that result under field conditions.

**VERITAS‑SHELLFISH** is an open‑source epistemic scoring and data integrity platform for point‑of‑use HAB toxin detection. It ingests data from any lateral flow assay or biosensor, computes a calibrated Confidence Score with quantified Uncertainty Mass, and cryptographically seals every result for an immutable audit trail.

### How It Works

```
1. CAPTURE   A community harvester photographs an LFA strip.
             The CERTUS‑TOXIN Engine scores the result instantly.

2. CALIBRATE Authorized labs upload calibration data (PDFs, CSVs)
             to the Knowledge Base, refining the confidence model over time.

3. REGULATE  Regulators access a confidence‑weighted dashboard showing
             harvest zone risk levels — every data point sealed and verifiable.
```

**Live Simulation:** [aionsystem.github.io/veritas-shellfish](https://aionsystem.github.io/veritas-shellfish)

**NOFO:** NOAA‑NOS‑NCCOS‑2026‑32955 · HAB Innovation Challenge: Toxin Detection in Seafood

---

## CERTUS‑TOXIN Engine

The **CERTUS‑TOXIN Engine (v1.1)** is the core epistemic scoring system, adapted for HAB toxin detection. It replaces binary pass/fail outputs with a multi-dimensional confidence score that propagates uncertainty explicitly.

### Scoring Dimensions (Toxin Confidence Index)

| Dimension | Weight | Description |
|---|---|---|
| Signal Confidence | 35% | AI analysis of test/control line intensity and image quality |
| Corroboration | 30% | Agreement with nearby tests (same species, toxin, timeframe) |
| Temporal Freshness | 20% | Decay based on time since harvest — not test time |
| Matrix Consistency | 15% | Species‑specific toxin profile alignment |

### Confidence Output

| Score Range | Validity Status | Recommended Action |
|---|---|---|
| ≥ 0.70 | **VALID** | High confidence — regulatory decision support |
| 0.40–0.69 | **DEGRADED** | Monitor — verify with additional testing |
| < 0.40 | **SUSPENDED** | Field verification required before any action |

### Uncertainty Mass

Every score carries an **Uncertainty Mass (UM)** — a measure of how uncertain the score itself is, independent of the score value.

| UM | Interpretation |
|---|---|
| < 0.35 | Score is reliable |
| 0.35–0.60 | Score is useful but uncertain |
| ≥ 0.60 | Do not rely on this score |

**Graduated Model Trust:** The engine declares a calibration status for the AI strip reader. As partner labs upload ground‑truth validation data, the uncertainty penalty decreases automatically — no code changes required.

---

## AI Strip Analysis — OpenRouter Integration

VERITAS‑SHELLFISH uses [OpenRouter](https://openrouter.ai) to route AI model calls for lateral flow assay interpretation.

### Model Configuration

| Priority | Model | Purpose |
|---|---|---|
| Primary | GPT‑4o‑mini (OpenAI) | Fast, cost‑efficient test line analysis |
| Fallback | Claude 3.5 Sonnet (Anthropic) | Higher‑accuracy fallback |

### Analysis Pipeline

```
1. User captures photo
   → Canvas API strips EXIF metadata client‑side

2. Image sent to OpenRouter API
   → Structured prompt: test line / control line / intensity ratio / confidence

3. AI returns structured result
   → test line intensity · control line presence · confidence value

4. CERTUS‑TOXIN Engine applies graduated trust scoring
   → AI intensity value feeds the Signal Confidence dimension

5. Offline fallback
   → If API unavailable: mock analysis activates (simulation mode)
```

---

## Knowledge Base & Calibration

The **Knowledge Base Module** (accessible via Regulator Dashboard) allows authorized partners to upload structured calibration data, refining the engine's confidence model over time without code changes.

### Supported Formats

- PDF laboratory reports
- CSV / Excel validation datasets
- Instrument exports (HPLC‑MS, ELISA plate readers)

### Calibration Workflow

```
1. Partner uploads file
   → SHA‑256 hash computed client‑side

2. File staged
   → IndexedDB (offline) / Supabase (online)

3. AI Calibration Engine extracts parameters
   → Toxin type · LOD · test line threshold · matrix effects

4. Active Calibration Panel updates
   → Parameters displayed immediately

5. Future test results use updated model automatically
   → No deployment required
```

> In the LOI simulation, this workflow is demonstrated with mock data. The full proposal includes integration with a partner lab (e.g., SEATOR network) for ground‑truth HPLC‑MS validation.

---

## Sovereign Trace Protocol Integration

VERITAS‑SHELLFISH integrates the **Sovereign Trace Protocol (STP)** — a cryptographic permanence infrastructure with 19 registered template types. Every test result, calibration upload, and dataset export receives a permanent SHA‑256 seal written to the GitHub ledger.

### Template Registry

| Template | Trigger | What Gets Sealed |
|---|---|---|
| Template 17 · SHELLFISH-TEST | Automatic on test submission | Every toxin test result |
| Template 18 · SHELLFISH-CALIBRATION | On Knowledge Base upload | Calibration datasets |
| Template 19 · SHELLFISH-EXPORT | Manual via Dashboard | Exported datasets |

### Verification Protocol

Anyone can verify a sealed result or export independently:

```
1. Recompute the SHA‑256 hash of the file or record.
2. Compare to the hash sealed in the STP ledger (GitHub Issues).
3. Match = data is unaltered.
   Mismatch = tampering or corruption has occurred.
```

No VERITAS‑SHELLFISH access is required to verify. The ledger is public and permanent.

---

## Technical Stack

| Layer | Technology | Rationale |
|---|---|---|
| App Shell | PWA (HTML + Service Worker) | Offline‑first, installable, works in remote harvest areas |
| Local Storage | IndexedDB | Survives offline sessions, syncs on reconnect |
| Maps | Leaflet.js + OpenStreetMap | Free, open source, harvest zone visualization |
| AI Analysis | OpenRouter (GPT‑4o‑mini + Claude 3.5 Sonnet) | Cost‑efficient with high‑accuracy fallback |
| Backend Sync | Supabase | Real‑time, row‑level security |
| STP Ledger | GitHub Issues + API | Immutable, verifiable, permanent |
| Deployment | Vercel (`api/`) + GitHub Pages (`public/`) | Frontend fully functional standalone |
| License | GPL‑3.0 with Commercial option | Open for research & communities; commercial path available |

---

## Three Core Modules

### 🧪 Test Shellfish — Community Submission

*For a subsistence harvester or field technician with limited connectivity.*

- Works fully offline (IndexedDB + Service Worker)
- Photo capture with automatic EXIF stripping
- Species, toxin type, and lot number selection
- Harvest time logging (feeds Temporal Freshness scoring)
- AI‑assisted strip analysis via OpenRouter
- Confidence Score and Validity Status displayed immediately
- Automatic STP seal (Template 17) — every test permanently recorded

---

### ⚠️ Unsafe Harvest Alert — Emergency Signal

*For a community member or monitor to flag a harvest zone in real time.*

- One‑tap alert button
- Automatic GPS location capture with manual fallback
- Works offline — queues alert for transmission on reconnect
- Alert appears immediately on the Regulator Dashboard
- Critical urgency flag propagated through all export formats

---

### 📊 Regulator Dashboard — Access‑Code Gated

*For NOAA program managers, tribal monitoring coordinators, and lab directors.*

**Access code:** `NOAA2026`

| Feature | Description |
|---|---|
| Confidence Map | Color‑coded harvest zone risk visualization |
| Live Dashboard | Score distribution across all submissions |
| Knowledge Base Uploader | Drag‑and‑drop calibration file intake |
| Active Calibration Panel | Current model parameters at a glance |
| Audit Trail Verifier | Input a seal hash to view full chain of custody |
| One‑Click Export | JSON, CSV, GeoJSON — all with integrity hash |
| STP Seal | One‑click dataset sealing (Template 19) |

---

## Anonymization & Data Sovereignty

| Principle | Implementation |
|---|---|
| No accounts | UUID generated client‑side — no emails, no IP logging at the application layer |
| Photo privacy | EXIF metadata stripped from all images before upload |
| Location fuzzing | "Area Mode (±100m)" option for subsistence harvest zones |
| Indigenous data sovereignty | UNDRIP Article 31 as a design principle — data remains under community control |

---

## Installation & Deployment

### 1. Clone the Repository

```bash
git clone https://github.com/AionSystem/VERITAS-SHELLFISH.git
cd VERITAS-SHELLFISH
```

### 2. Configure OpenRouter (AI Strip Analysis)

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Obtain an API key
3. On first use, the app will prompt for the key — stored locally in the browser

### 3. Deploy to GitHub Pages

```bash
# Ensure public/ contains the latest build
git add .
git commit -m "Deploy VERITAS‑SHELLFISH simulation"
git push origin main
```

Live at: `https://aionsystem.github.io/veritas-shellfish`

### 4. Deploy Vercel Backend (Optional)

Required only for server‑side STP sealing and API proxying.

```bash
cd api
vercel --prod
```

---

## License

VERITAS‑SHELLFISH is dual‑licensed to serve both public‑interest and commercial use cases.

| User Type | License |
|---|---|
| Tribal Monitoring Programs / Subsistence Communities | GPL‑3.0 (Free) |
| Academic / NOAA‑Funded Research | GPL‑3.0 (Free) |
| Government Agencies (Non‑Commercial Use) | GPL‑3.0 (Free) |
| Commercial Laboratories / Kit Manufacturers | Commercial License (Fee) |

- **[GNU General Public License v3.0](LICENSE)** — for research, non‑profit, tribal monitoring, and open‑source use
- **[Commercial License](COMMERCIAL-LICENSE.md)** — for proprietary integration, OEM applications, and commercial labs

Commercial licensing inquiries: [aionsystem@outlook.com](mailto:aionsystem@outlook.com)

---

## Acknowledgments

| Component | Role |
|---|---|
| [CERTUS‑TOXIN Engine](docs/CERTUS-TOXIN.md) | Epistemic scoring framework |
| [Sovereign Trace Protocol](https://github.com/AionSystem/SOVEREIGN-TRACE-PROTOCOL) | Cryptographic permanence infrastructure |
| [OpenRouter](https://openrouter.ai) | Unified AI API routing |
| [Leaflet.js](https://leafletjs.com) | Open‑source mapping library |
| [Supabase](https://supabase.com) | Backend sync and row‑level security |
| xBD Dataset | Inspiration for graduated model trust scoring |

---

> *"The code is open source. The architecture is not replicable."*

This is an application of the **AION Constitutional Stack** — applied to seafood safety, subsistence harvest protection, and verifiable toxin detection. The method travels. The judgment behind it doesn't.

---

<div align="center">

**CERTUS‑TOXIN Engine v1.1** · **STP Template Registry — 19 permanent seal types**

*Every test sealed. Every calibration logged. Every export verifiable.*

</div>
