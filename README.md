# VERITAS‑SHELLFISH — HAB Toxin Detection Platform

<!-- STATUS · VERSION · COMPLIANCE -->
[![Status](https://img.shields.io/badge/STATUS-Simulation_%7C_NOAA_LOI-1B3B6F?style=flat-square)](https://github.com/AionSystem/VERITAS-SHELLFISH)
[![Version](https://img.shields.io/badge/version-v1.0.0-orange)](#)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Commercial License](https://img.shields.io/badge/Commercial-License%20Available-orange)](COMMERCIAL-LICENSE.md)
[![ORCID — Sheldon K. Salmon](https://img.shields.io/badge/ORCID-0009--0005--8057--5115-a6ce39?style=flat&logo=orcid&logoColor=white)](https://orcid.org/0009-0005-8057-5115)

<!-- CORE ARCHITECTURE -->
[![CERTUS Engine](https://img.shields.io/badge/CERTUS-v2.5.3-4ade80?style=flat-square)](https://github.com/AionSystem/VERITAS)
[![STP](https://img.shields.io/badge/STP-Integrated-2E7D32?style=flat-square&logo=git&logoColor=white)](https://github.com/AionSystem/SOVEREIGN-TRACE-PROTOCOL)
[![Seal](https://img.shields.io/badge/Seal-SHA--256%20Bound-4527A0?style=flat-square&logo=hashnode&logoColor=white)](https://github.com/AionSystem/VERITAS-SHELLFISH)

<!-- TECH STACK -->
[![OpenRouter](https://img.shields.io/badge/OpenRouter-GPT--4o--mini_%2B_Claude_3.5_Sonnet-4285F4?style=flat-square)](https://openrouter.ai)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-5A0FC8?style=flat-square)](#)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow)](#)
[![Feedback Welcome](https://img.shields.io/badge/Feedback-welcome-brightgreen)](https://github.com/AionSystem/VERITAS-SHELLFISH/issues/new/choose)

> **Certainty engineering for seafood safety**
> NOAA‑NOS‑NCCOS‑2026‑32955 LOI Demonstration · April 2026

---

## Table of Contents

- [Architect's Note on AI Use](#architects-note-on-ai-use)
- [Quick Start](#quick-start)
- [Repository Structure](#repository-structure)
- [Overview](#overview)
- [The CERTUS Engine (Toxin Confidence)](#the-certus-engine-toxin-confidence)
- [AI Strip Analysis](#ai-strip-analysis--openrouter-integration)
- [Knowledge Base & Calibration](#knowledge-base--calibration)
- [Sovereign Trace Protocol Integration](#sovereign-trace-protocol-integration)
- [Technical Stack](#technical-stack)
- [Three Core Modules](#three-core-modules)
- [Anonymization & Data Sovereignty](#anonymization--data-sovereignty)
- [Installation & Deployment](#installation--deployment)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Architect's Note on AI Use

This platform was designed, architected, and directed by **Sheldon K. Salmon**.
AI tools (large language models) were used as instruments — the same way a laboratory uses a spectrophotometer.
The intellectual core — the **CERTUS Engine** adaptation for toxin detection, the **Confidence Scoring** dimensions, the **Knowledge Base** calibration workflow, the **STP** sealing integration, and the overall architectural vision — is wholly human‑originated.

The NOAA NOFO explicitly notes that submissions produced solely with generative AI are not of interest.
VERITAS‑SHELLFISH is **not** a generative AI output; it is a human‑built system where AI serves as one of several tools under strict human oversight.
Every line of code, every design decision, and every formula reflects human intent.

---

## Quick Start

Get the VERITAS‑SHELLFISH simulation running in under a minute.

```bash
git clone https://github.com/AionSystem/VERITAS-SHELLFISH.git
cd VERITAS-SHELLFISH
```

Then simply open public/index.html in your browser.

For full offline capability (Service Worker, IndexedDB) serve the files through a local web server:

```bash
cd public
python3 -m http.server 8000
# Then visit http://localhost:8000
```

Note: The simulation includes a fully functional Regulator Dashboard.
Use access code NOAA2026 to unlock the responder view, knowledge base, and audit trail verifier.

---

Repository Structure

Key files for evaluators: public/index.html (full platform) · public/certus-engine-v2.5.3.js (scoring logic) · public/ai-analysis.js (OpenRouter integration)

```
VERITAS-SHELLFISH/
├── public/                         ← All static frontend assets
│   ├── index.html                  ← Main VERITAS‑SHELLFISH interface
│   ├── certus-engine-v2.5.3.js     ← CERTUS Engine (epistemic scoring)
│   ├── ai-analysis.js              ← OpenRouter AI integration (LFA strip analysis)
│   ├── manifest.json               ← PWA manifest
│   ├── sw.js                       ← Service Worker (offline capability)
│   └── icons/                      ← App icons for PWA
│
├── api/                            ← Vercel serverless functions (separate deployment)
│   ├── stp-seal.js                 ← STP seal service (GitHub ledger)
│   └── templates/                  ← STP template registry (17 templates incl. VERITAS‑SHELLFISH)
│
├── docs/                           ← Documentation
│   ├── CERTUS-TOXIN.md             ← CERTUS Engine adaptation for HAB toxins
│   └── NOAA-LOI-SUBMISSION.md      ← LOI text and compliance notes
│
├── LICENSE                         ← GPL-3.0
├── COMMERCIAL-LICENSE.md
└── README.md                       ← This file
```

---

Overview

Most point‑of‑use toxin tests stop at a binary result.
They do not tell a harvester, a regulator, or a tribal monitoring program how much to trust that result under field conditions.

VERITAS‑SHELLFISH is an open‑source epistemic scoring and data integrity platform for point‑of‑use HAB toxin detection.
It ingests data from any lateral flow assay or biosensor, computes a calibrated Confidence Score with quantified Uncertainty Mass, and cryptographically seals every result for an immutable audit trail.

How it works — three steps:

1. A community harvester or field technician photographs an LFA test strip. The CERTUS Engine scores the result instantly.
2. Authorized labs upload calibration data (PDFs, CSVs) to the Knowledge Base, refining the confidence model over time.
3. Regulators access a confidence‑weighted dashboard showing harvest zone risk levels, with every data point sealed and verifiable.

· Live Simulation: aionsystem.github.io/veritas-shellfish
· NOFO: NOAA‑NOS‑NCCOS‑2026‑32955 · HAB Innovation Challenge: Toxin Detection in Seafood

---

The CERTUS Engine (Toxin Confidence)

The CERTUS Engine (v2.5.3) is the core epistemic scoring system, adapted for HAB toxin detection.

Scoring Dimensions (Toxin Confidence Index)

Dimension Weight Description
Signal Confidence 35% AI analysis of test/control line intensity & image quality
Corroboration 30% Agreement with nearby tests (same species, toxin, timeframe)
Temporal Freshness 20% Decay based on time since harvest (not test time)
Matrix Consistency 15% Species‑specific toxin profile alignment

Confidence Output

Score Range Validity Status Action
≥ 0.70 VALID High confidence — regulatory decision support
0.40–0.69 DEGRADED Monitor — verify with additional testing
< 0.40 SUSPENDED Field verification required before action

Uncertainty Mass (UM)

Every score carries an Uncertainty Mass — a measure of how much the score itself is uncertain:

UM Meaning
< 0.35 Score is reliable
0.35–0.60 Score useful but uncertain
≥ 0.60 Do not rely on this score

Graduated Model Trust: The engine uses a declared calibration status for the AI strip reader.
As partner labs upload ground‑truth validation data, the uncertainty penalty automatically decreases — no code changes required.

---

AI Strip Analysis — OpenRouter Integration

VERITAS‑SHELLFISH uses OpenRouter to access AI models for lateral flow assay interpretation.

Model Configuration

Priority Model Purpose
Primary GPT‑4o‑mini (OpenAI) Fast, cost‑efficient test line analysis
Fallback Claude 3.5 Sonnet (Anthropic) Higher‑accuracy fallback

How It Works

1. User captures photo → Canvas strips EXIF metadata.
2. Image sent to OpenRouter API with structured prompt: "Analyze this lateral flow assay strip. Identify test line and control line. Estimate intensity ratio and provide confidence."
3. AI returns: test line intensity, control line presence, confidence.
4. CERTUS Engine applies graduated trust scoring to the intensity value for the Signal Confidence dimension.
5. If API unavailable → falls back to mock analysis (offline simulation mode).

---

Knowledge Base & Calibration

The platform includes a secure Knowledge Base Module (accessible via Regulator Dashboard) where authorized partners can upload structured calibration data.

Supported Formats

· PDF laboratory reports
· CSV / Excel validation datasets
· Instrument exports (HPLC‑MS, ELISA plate readers)

Calibration Workflow (Simulation)

1. Partner uploads file → file is hashed (SHA‑256) client‑side.
2. File staged in IndexedDB (offline) / Supabase (online).
3. AI Calibration Engine (system prompt) extracts parameters:
   · Toxin type, LOD, test line threshold, matrix effects.
4. Updated calibration parameters are displayed in the Active Calibration Panel.
5. Future test results automatically use the updated model.

In the LOI simulation, this workflow is demonstrated with mock data.
The full proposal includes integration with a partner lab (e.g., SEATOR network) for ground‑truth HPLC‑MS validation.

---

Sovereign Trace Protocol Integration

VERITAS‑SHELLFISH integrates the Sovereign Trace Protocol (STP) — a permanence infrastructure with 17 template types.

Template Trigger Result
Template 15 (VERITAS Report) Automatic after test submission Every toxin test result is permanently sealed
Template 17 (Calibration Data) On Knowledge Base upload Calibration datasets are sealed for auditability
Template 16 (VERITAS Export) Manual via Dashboard Exported datasets have verifiable integrity

Verification

Anyone can verify a sealed test result or exported dataset by:

1. Recomputing the SHA‑256 hash of the file.
2. Comparing it to the hash sealed in the STP ledger (GitHub Issues).
3. If they match, the data has not been altered.

---

Technical Stack

Layer Technology Why
App Shell PWA (HTML + Service Worker) Offline‑first, installable, works in remote harvest areas
Local Storage IndexedDB Survives offline, syncs when back online
Maps Leaflet.js + OpenStreetMap Free, open source, harvest zone visualization
AI Analysis OpenRouter (GPT‑4o‑mini + Claude 3.5 Sonnet) Cost‑efficient with high‑accuracy fallback
Backend Sync Supabase Real‑time, row‑level security
STP Ledger GitHub Issues + API Immutable, verifiable, permanent
Deployment Vercel (api/) + GitHub Pages (public/) Frontend fully functional standalone
License GPL‑3.0 with Commercial option Open source for research & communities; commercial licenses available

---

Three Core Modules

🧪 Test Shellfish — Community Submission (Mobile‑First)

For a subsistence harvester or field technician with limited connectivity who needs to record and certify a test result.

· Works offline (IndexedDB + Service Worker)
· Photo capture (EXIF stripped automatically)
· Select shellfish species, toxin type, lot number
· Harvest time logging (for freshness scoring)
· AI‑assisted strip analysis
· Confidence score + validity status displayed immediately
· Automatic STP seal (Template 15) — every test permanently recorded

⚠️ Unsafe Harvest Alert — Emergency Signal

For a community member or monitor to flag a harvest zone as potentially unsafe based on recent tests.

· One‑tap alert button
· Automatic location capture (GPS with fallback)
· Works offline — queues alert for when connectivity returns
· High‑visibility warning on regulator dashboard
· Critical urgency flag in export data

📊 Regulator Dashboard — Access‑Code Gated

For NOAA program managers, tribal monitoring coordinators, or lab directors to triage incoming test data and calibration uploads.

Access code: NOAA2026

· Confidence map with color‑coded harvest zones
· Live confidence dashboard with score distribution
· Knowledge Base Uploader — drag‑and‑drop calibration files
· Active Calibration Panel — view current model parameters
· Audit Trail Verifier — input a seal hash to view chain of custody
· One‑click export: JSON, CSV, GeoJSON with integrity hash
· STP seal integration — one‑click dataset sealing

---

Anonymization & Data Sovereignty

· No accounts, no emails, no IP logging at the application layer — UUID generated client‑side.
· EXIF metadata stripped from all photos before upload.
· GPS fuzzing option — "Area Mode (±100m)" for subsistence harvest zones.
· Indigenous data sovereignty — UNDRIP Article 31 as a design principle; data remains under community control.

---

Installation & Deployment

1. Clone the repository

```bash
git clone https://github.com/AionSystem/VERITAS-SHELLFISH.git
cd VERITAS-SHELLFISH
```

2. Configure OpenRouter (for AI strip analysis)

· Sign up at openrouter.ai
· Get your API key
· On first use, the app will prompt for the key (stored locally)

3. Deploy to GitHub Pages

```bash
# From the public/ directory
git add .
git commit -m "Deploy VERITAS‑SHELLFISH simulation"
git push origin main
```

The simulation will be live at https://aionsystem.github.io/veritas-shellfish.

4. (Optional) Deploy STP seal service to Vercel

```bash
cd api
vercel --prod
```

---

License

VERITAS‑SHELLFISH is dual‑licensed:

· GNU General Public License v3.0 — for research, non‑profit, tribal monitoring, and open‑source use.
· Commercial License — for proprietary integration, OEM applications, and commercial labs.

User Type License
Tribal Monitoring Programs / Subsistence Communities GPL‑3.0 (Free)
Academic / NOAA‑Funded Research GPL‑3.0 (Free)
Government Agencies (Non‑Commercial Use) GPL‑3.0 (Free)
Commercial Laboratories / Kit Manufacturers Commercial License (Fee)

See LICENSE for GPL terms and COMMERCIAL-LICENSE.md for commercial licensing information.

For commercial licensing inquiries: aionsystem@outlook.com

---

Acknowledgments

· CERTUS Engine — epistemic scoring framework
· Sovereign Trace Protocol — cryptographic permanence infrastructure
· OpenRouter — unified AI API
· Leaflet.js — open‑source mapping
· Supabase — backend sync
· xBD Dataset — inspiration for graduated model trust scoring

---

"The code is open source. The architecture is not replicable."

This is an application of the AION Constitutional Stack — applied to seafood safety, subsistence harvest protection, and verifiable toxin detection.
The method travels. The judgment behind it doesn't.

---

CERTUS Engine v2.5.3 — Adapted for HAB Toxin Detection
STP Template Registry — 17 permanent seal types
VERITAS‑SHELLFISH — Every test sealed. Every calibration logged. Every export verifiable.
