// ==================== CERTUS-TOXIN ENGINE v1.1 ====================
// FSVE-informed Scoring Engine for HAB Toxin Detection
// Adapted from CERTUS v2.5.3 for VERITAS‑SHELLFISH
//
// Author: Sheldon K. Salmon & ALBEDO
// Date: April 2026
// Version: 1.1 — FORGE Red‑Team fixes applied (R1‑SA‑001 through R1‑SA‑004, R1‑EL‑001 through R1‑EL‑003)
//
// Changelog v1.0 → v1.1:
// - [R1‑SA‑001/003] Distributed coordination modules gated behind config flag; dead code removed from default path
// - [R1‑SA‑002] Storage and audit logging wrapped in circuit breaker / try‑catch to prevent scoring failures
// - [R1‑EL‑001] SPECIES_TOXIN_MATRIX now includes source citations
// - [R1‑EL‑002] updateModelCalibration() restored; calibration status exposed
// - [R1‑EL‑003] ECF contributions re‑integrated into Uncertainty Mass calculation
// - [R1‑SA‑004] Strip registry populated during scoring to enable adversarial duplicate detection
// - Removed unused appeal and evidence‑weighting helper functions (retained only if config enabled)
// - Restored computeECFContribution() and integrated into UM

const CERTUS_TOXIN = {

  // ── VERSION ────────────────────────────────────────────────────────────────
  VERSION: '1.1',
  CANARY_VERSION: '1.1-beta',

  // ── PRODUCTION CONFIGURATION ───────────────────────────────────────────────
  PRODUCTION: {
    maxConcurrentAppeals: 100,
    cacheTTL: 300,
    rateLimitWindow: 3600,
    distributedSyncInterval: 5000,
    healthCheckInterval: 30000,
    circuitBreakerManualResetOnly: true,
    auditLogRetentionDays: 365,
    encryptionKeyRotationDays: 90,
    canaryPercentage: 5,
    enableDistributedMode: false,      // R1‑SA‑001: disabled by default for VERITAS‑SHELLFISH
    enableAppeals: false,              // R1‑SA‑003: appeals not used in this deployment
  },

  // ── WEIGHTS ───────────────────────────────────────────────────────────────
  W: { SCS: 0.35, COR: 0.30, TFR: 0.20, MCS: 0.15 },

  // ── THRESHOLDS ────────────────────────────────────────────────────────────
  THRESHOLDS: {
    TCI_HIGH: 0.70,
    TCI_WATCH: 0.40,
    UM_VALID: 0.35,
    UM_DEGRADED: 0.60,
    MAX_APPEALS: 3,
    CORRELATED_FAILURE_RATE: 0.30,
    EPISTEMIC_CEILING: 0.95,
    EVIDENCE_HALF_LIFE_HOURS: 168,
    REPUTATION: {
      VERIFIED_BONUS: 10,
      FALSE_REPORT_PENALTY: 20,
      BAN_THRESHOLD: -100
    }
  },

  // ── EVIDENCE WEIGHTS WITH CREDIBILITY ─────────────────────────────────────
  CREDIBILITY_SCORES: {
    harvester: 0.85,
    field_technician: 0.9,
    lab_analyst: 0.98,
    community_monitor: 0.8,
    ai_analyzed_strip: 0.85,
    regulatory_inspector: 0.95
  },

  EVIDENCE_WEIGHTS: {
    STRIP: { weight: 0.35, confidence_boost: 0.12, likelihood: 0.85 },
    WITNESS: { weight: 0.25, confidence_boost: 0.08, likelihood: 0.70 },
    LAB: { weight: 0.40, confidence_boost: 0.25, likelihood: 0.95 }
  },

  // ── SENSITIVE LOCATION TYPES (for anonymization) ──────────────────────────
  SENSITIVE_LOCATION_TYPES: [
    'subsistence_harvest_zone', 'tribal_land', 'mariculture_site'
  ],

  // ── CONSENT OPTIONS ───────────────────────────────────────────────────────
  CONSENT_OPTIONS: {
    food_safety: { required: true, default: true },
    research: {
      required: false, default: false,
      explanation: 'Help improve HAB toxin detection through research'
    },
    commercial: {
      required: true, default: false,
      explanation: 'Allow commercial use of anonymized data',
      prohibited: false
    }
  },

  // ── DATA RECIPIENTS FOR TRANSPARENCY ──────────────────────────────────────
  DATA_RECIPIENTS: {
    noaa: {
      name: 'NOAA NCCOS',
      purpose: 'HAB monitoring and public health protection',
      retention: 'Indefinite (public health)',
      opt_out: false
    },
    tribal_authority: {
      name: 'Tribal Natural Resources',
      purpose: 'Subsistence harvest safety',
      retention: 'Indefinite',
      opt_out: true
    },
    research_institutions: {
      name: 'HAB Research Partners',
      purpose: 'Improving detection methods',
      retention: 'Indefinite (anonymized)',
      opt_out: true
    }
  },

  // ── VERIFICATION BADGES ───────────────────────────────────────────────────
  VERIFICATION_BADGES: {
    lab_verified: {
      icon: '🔬',
      label: 'Lab Verified',
      description: 'Confirmed by HPLC‑MS reference method',
      color: '#4ade80',
      weight: 1.3
    },
    ai_verified: {
      icon: '🤖',
      label: 'AI Verified',
      description: 'Verified by CERTUS‑TOXIN Engine',
      color: '#00d4ff',
      weight: 1.0
    },
    field_verified: {
      icon: '✅',
      label: 'Field Verified',
      description: 'Verified by multiple field tests',
      color: '#4ade80',
      weight: 1.1
    },
    pending: {
      icon: '⏳',
      label: 'Pending Verification',
      description: 'Awaiting confirmation',
      color: '#888',
      weight: 0.7
    }
  },

  // ── ACCESSIBILITY SETTINGS ────────────────────────────────────────────────
  ACCESSIBILITY: {
    large_text: { scale: 1.5, description: 'Increase text size', enabled: false },
    high_contrast: {
      enabled: false,
      description: 'Increase contrast',
      colors: { background: '#000000', text: '#ffffff', accent: '#00d4ff' }
    },
    reduce_motion: { enabled: false, description: 'Reduce animations' },
    haptic_feedback: { enabled: true, description: 'Vibration alerts' }
  },

  // ── ICON-BASED NAVIGATION (low-literacy) ─────────────────────────────────
  ICON_NAVIGATION: {
    steps: [
      { icon: '📸', action: 'photo', description: 'Photograph LFA strip', audio: 'step_strip.mp3' },
      { icon: '🧪', action: 'result', description: 'Read test result', audio: 'step_result.mp3' },
      { icon: '🐚', action: 'species', description: 'Select shellfish', audio: 'step_species.mp3' },
      { icon: '📍', action: 'location', description: 'Harvest zone', audio: 'step_location.mp3' },
      { icon: '✅', action: 'submit', description: 'Submit test', audio: 'step_submit.mp3' }
    ],
    actions: [
      { icon: '📤', action: 'share', description: 'Share result', audio: 'share.mp3' },
      { icon: '📞', action: 'call', description: 'Call coordinator', audio: 'call.mp3' }
    ]
  },

  // ── OFFLINE VOICE KEYWORDS ────────────────────────────────────────────────
  VOICE_KEYWORDS: {
    en: ['test', 'toxin', 'shellfish', 'positive', 'negative', 'harvest', 'location']
  },

  // ── AUDIO GUIDANCE ────────────────────────────────────────────────────────
  AUDIO_GUIDANCE: {
    en: {
      step_1: 'Take a clear photo of the lateral flow assay strip.',
      step_2: 'Read the test result: negative, trace, positive, or strong positive.',
      step_3: 'Select the shellfish species.',
      step_4: 'Pin the harvest location on the map.',
      step_5: 'Review and submit your test result.'
    }
  },

  // ── MARKER STYLES (color-blind accessible) ────────────────────────────────
  MARKER_STYLES: {
    high: { color: '#4ade80', pattern: 'solid' },
    watch: { color: '#f0a500', pattern: 'striped' },
    review: { color: '#ff4d4d', pattern: 'crosshatch' }
  },

  // ── PLAIN LANGUAGE ────────────────────────────────────────────────────────
  PLAIN_LANGUAGE: {
    'VALID': 'Reliable — confident enough to act',
    'DEGRADED': 'Somewhat uncertain — verify with additional testing',
    'SUSPENDED': 'Do not rely — lab confirmation required',
    'SCS': 'Strip image quality',
    'COR': 'Agreement with nearby tests',
    'TFR': 'Sample freshness',
    'MCS': 'Species–toxin consistency'
  },

  // ── SPECIES‑TOXIN MATRIX (Matrix Consistency) ─────────────────────────────
  // R1‑EL‑001: Citations added
  SPECIES_TOXIN_MATRIX: {
    // High‑risk accumulators (positive result is expected)
    // Source: NOAA NCCOS HAB Forecasting; FDA NSSP Guide for the Control of Molluscan Shellfish
    highRisk: [
      { species: 'Butter Clam', toxin: 'PST' },
      { species: 'Blue Mussel', toxin: 'PST' },
      { species: 'Blue Mussel', toxin: 'ASP' },
      { species: 'Razor Clam', toxin: 'ASP' },
      { species: 'Geoduck', toxin: 'PST' }
    ],
    // Low‑risk accumulators (positive result is unusual, verify)
    // Source: SEATOR 2024 PSP Report; Alaska DEC PSP data
    lowRisk: [
      { species: 'Pacific Oyster', toxin: 'PST' },
      { species: 'Scallop', toxin: 'PST' },
      { species: 'Manila Clam', toxin: 'PST' }
    ]
  },

  // ── INTERNAL STATE ────────────────────────────────────────────────────────
  _circuitBreaker: { engaged: false, correlatedFailureRate: 0, lastReset: Date.now(), backoff: 3600000, reason: null, manualResetRequired: true },
  _dependencyCircuitBreakers: {
    storage: { open: false, failures: 0, lastFailure: null, timeout: 10000 },
    supabase: { open: false, failures: 0, lastFailure: null, timeout: 8000 }
  },
  _backpressure: { tokens: 1000, lastRefill: Date.now(), rateLimit: 1000 },
  _degradedMode: false,
  _degradationReasons: [],
  _distributedStore: null,
  _useDistributed: false,  // R1‑SA‑001: controlled by PRODUCTION.enableDistributedMode
  _storage: null,
  _supabaseClient: null,
  _auditLog: { shards: [], currentShard: 0, maxShardSize: 10000, events: [] },
  _reputationStore: new Map(),
  _stripRegistry: new Map(),
  _inMemoryCounters: new Map(),
  _inMemoryStore: new Map(),
  _IN_MEMORY_STORE_MAX_SIZE: 10000,
  _instanceId: (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : `certus-toxin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  _offlineSupported: false,
  _currentTheme: 'light',

  // ── MODEL CALIBRATION STATE (R1‑EL‑002 restored) ──────────────────────────
  _modelCalibration: {
    trustScore: 0.0,
    calibrationStatus: 'UNCALIBRATED',
    calibrationSamples: 0,
    lastUpdated: null
  },

  // ══════════════════════════════════════════════════════════════════════════
  // UUID GENERATION
  // ══════════════════════════════════════════════════════════════════════════
  _generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MODEL CALIBRATION (R1‑EL‑002)
  // ══════════════════════════════════════════════════════════════════════════
  updateModelCalibration(validatedSampleCount, newStatus) {
    this._modelCalibration.calibrationSamples = validatedSampleCount;
    this._modelCalibration.calibrationStatus = newStatus;
    this._modelCalibration.lastUpdated = new Date().toISOString();
    
    // Update trust score according to CERTUS graduated scale
    if (newStatus === 'UNCALIBRATED') {
      this._modelCalibration.trustScore = 0.0;
    } else if (newStatus === 'PARTIAL') {
      // Linear interpolation between 0.01 and 0.59 for 1–249 samples
      const samples = Math.min(249, Math.max(1, validatedSampleCount));
      this._modelCalibration.trustScore = 0.01 + (samples / 249) * 0.58;
    } else if (newStatus === 'VERIFIED') {
      this._modelCalibration.trustScore = 1.0;
    }
    
    this._logAuditEvent({
      type: 'MODEL_CALIBRATION_UPDATED',
      calibrationStatus: newStatus,
      samples: validatedSampleCount,
      trustScore: this._modelCalibration.trustScore
    }).catch(() => {});
    
    return { ...this._modelCalibration };
  },

  getModelCalibration() {
    return { ...this._modelCalibration };
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GRACEFUL DEGRADATION
  // ══════════════════════════════════════════════════════════════════════════
  _recordDegradation(component, error) {
    this._degradedMode = true;
    this._degradationReasons.push({ component, error: error.message, timestamp: Date.now(), severity: 'warning' });
    if (typeof console !== 'undefined') console.warn(`[CERTUS-TOXIN] Degraded: ${component} - ${error.message}`);
  },

  // ══════════════════════════════════════════════════════════════════════════
  // AUDIT LOG (R1‑SA‑002: wrapped in try‑catch, never throws)
  // ══════════════════════════════════════════════════════════════════════════
  async _logAuditEvent(event) {
    try {
      const auditEvent = { ...event, timestamp: Date.now(), version: this.VERSION, instanceId: this._instanceId };
      const shard = this._auditLog.shards[this._auditLog.currentShard] || { events: [], size: 0 };
      shard.events.push(auditEvent);
      shard.size++;
      this._auditLog.shards[this._auditLog.currentShard] = shard;
      if (shard.size >= this._auditLog.maxShardSize) await this._rotateAuditShard();
      if (this._storage && this._storage.logAudit) await this._storage.logAudit(auditEvent);
    } catch (err) {
      // Silent fail — audit logging must not break scoring
      this._recordDegradation('audit', err);
    }
  },
  async _rotateAuditShard() {
    try {
      const oldShard = this._auditLog.shards[this._auditLog.currentShard];
      if (oldShard && this._storage) await this._storage.saveShard(oldShard);
      this._auditLog.currentShard++;
      this._auditLog.shards[this._auditLog.currentShard] = { events: [], size: 0 };
    } catch (err) {
      this._recordDegradation('audit_shard', err);
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CIRCUIT BREAKER (R1‑SA‑002: now used for storage)
  // ══════════════════════════════════════════════════════════════════════════
  async _callWithCircuitBreaker(dependency, fn, fallback) {
    const breaker = this._dependencyCircuitBreakers[dependency];
    if (!breaker) return fn();
    if (breaker.open) {
      if (Date.now() - breaker.lastFailure < breaker.timeout) return fallback();
      breaker.open = false;
      breaker.failures = 0;
    }
    try {
      const result = await fn();
      breaker.failures = 0;
      return result;
    } catch (err) {
      breaker.failures++;
      breaker.lastFailure = Date.now();
      if (breaker.failures >= 3) { breaker.open = true; this._recordDegradation(dependency, err); }
      return fallback();
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // STORAGE INIT (R1‑SA‑002: wrapped, never throws)
  // ══════════════════════════════════════════════════════════════════════════
  async _initializeStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        this._storage = {
          type: 'localstorage',
          get: (key) => { try { return JSON.parse(localStorage.getItem(`certus_toxin_${key}`)); } catch { return null; } },
          set: (key, val) => { try { localStorage.setItem(`certus_toxin_${key}`, JSON.stringify(val)); } catch {} },
          logAudit: async (e) => { const a = this._storage.get('audit') || []; a.push(e); this._storage.set('audit', a); },
          saveShard: async (s) => { const sh = this._storage.get('shards') || []; sh.push(s); this._storage.set('shards', sh); }
        };
        return this._storage;
      }
    } catch (err) {
      this._recordDegradation('storage_init', err);
    }
    // Memory fallback
    this._storage = {
      type: 'memory',
      memory: new Map(),
      get: (k) => this._storage.memory.get(k),
      set: (k, v) => this._storage.memory.set(k, v),
      logAudit: async () => {},
      saveShard: async () => {}
    };
    return this._storage;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ECF CONTRIBUTION (R1‑EL‑003 restored)
  // ══════════════════════════════════════════════════════════════════════════
  computeECFContribution(findings, dimension) {
    if (!findings || findings.length === 0) return 0;
    const ECF_WEIGHTS = { 'D': 0.00, 'R': 0.05, 'S': 0.10, '?': 0.15 };
    const dimensionFindings = findings.filter(f => f.dimension === dimension);
    if (dimensionFindings.length === 0) return 0;
    let total = 0;
    dimensionFindings.forEach(f => {
      const ecf = f.ecf || (f.tags ? f.tags.ecf : '?');
      total += ECF_WEIGHTS[ecf] || 0.10;
    });
    return Math.min(0.30, total / dimensionFindings.length);
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SCS — Strip Confidence Score
  // ══════════════════════════════════════════════════════════════════════════
  computeSCS(report, isRealModel = false) {
    const result = { value: 0.50, measurement_class: 'INFERENTIAL', evaluable: true, gated: false, um_contribution: 0, note: '' };
    const trustScore = this._modelCalibration.trustScore;
    
    if (!report.stripPhoto) {
      result.value = null; result.evaluable = false; result.measurement_class = 'NOT_EVALUABLE';
      result.um_contribution = 0.25; result.note = 'No strip photo submitted.';
      return result;
    }
    if (!report.stripAiScore || report.stripAiConf === null) {
      result.value = null; result.evaluable = false; result.measurement_class = 'NOT_EVALUABLE';
      result.um_contribution = 0.25; result.note = 'No AI analysis available.';
      return result;
    }
    if (report.stripAiConf < 0.60) {
      result.value = 0.50;
      result.measurement_class = isRealModel ? 'EVALUATIVE_GATED' : 'INFERENTIAL';
      result.gated = true;
      result.um_contribution = isRealModel ? 0.10 : 0.30;
      result.note = `AI confidence below 60% — SCS gated to 0.50.`;
      return result;
    }
    result.value = Math.max(0, Math.min(1, report.stripAiScore));
    result.gated = false;
    
    if (isRealModel && trustScore >= 0.60) {
      result.measurement_class = 'EVALUATIVE';
      result.um_contribution = Math.max(0, 0.20 * (1 - trustScore));
    } else {
      result.measurement_class = 'INFERENTIAL';
      result.um_contribution = 0.20;
    }
    result.note = `AI analysis: score ${report.stripAiScore.toFixed(3)}, confidence ${(report.stripAiConf*100).toFixed(0)}%.`;
    return result;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // COR — Corroboration Score
  // ══════════════════════════════════════════════════════════════════════════
  computeCOR(nearbyTests, currentResult, reportUuid) {
    const result = { value: 0.50, evaluable: true, um_contribution: 0, note: '', signal_type: 'NEUTRAL' };
    if (!nearbyTests || nearbyTests.length === 0) {
      result.value = null; result.evaluable = false; result.um_contribution = 0.20;
      result.signal_type = 'NO_EVIDENCE'; result.note = 'No nearby tests for corroboration.';
      return result;
    }
    if (nearbyTests.length === 1) {
      const agrees = nearbyTests[0].testResult === currentResult;
      result.value = agrees ? 0.55 : 0.40;
      result.um_contribution = 0.05;
      result.signal_type = agrees ? 'WEAK_AGREEMENT' : 'WEAK_CONTRADICTION';
      result.note = agrees ? 'One nearby test agrees.' : 'One nearby test disagrees.';
      return result;
    }
    const agreements = nearbyTests.filter(t => t.testResult === currentResult).length;
    const contradictions = nearbyTests.length - agreements;
    const rawScore = (agreements / nearbyTests.length) - (contradictions * 0.15);
    result.raw_score = parseFloat(rawScore.toFixed(3));
    result.value = parseFloat(Math.max(0, Math.min(1, rawScore)).toFixed(3));
    result.um_contribution = contradictions > 0 ? 0.08 * (contradictions / nearbyTests.length) : 0;
    result.signal_type = contradictions > 0 ? 'CONTRADICTION' : 'STRONG_AGREEMENT';
    result.note = `${nearbyTests.length} nearby tests: ${agreements} agree, ${contradictions} contradict.`;
    return result;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TFR — Temporal Freshness (harvest-based)
  // ══════════════════════════════════════════════════════════════════════════
  computeTFR(harvestTimeISO) {
    if (!harvestTimeISO) {
      return { value: 0.50, um_contribution: 0.05, hours_elapsed: 0, freshness_status: 'UNKNOWN', note: 'Harvest time not provided — using default.' };
    }
    const hoursElapsed = (Date.now() - new Date(harvestTimeISO).getTime()) / 3600000;
    const value = Math.max(0, 1 - (hoursElapsed / 48));
    let status, um;
    if (value >= 0.80) { status = 'FRESH'; um = 0; }
    else if (value >= 0.60) { status = 'AGING'; um = 0.05; }
    else if (value >= 0.25) { status = 'STALE'; um = 0.10; }
    else { status = 'EXPIRED'; um = 0.15; }
    return { value: parseFloat(value.toFixed(3)), um_contribution: um, hours_elapsed: parseFloat(hoursElapsed.toFixed(1)), freshness_status: status, harvest_based: true, note: `${hoursElapsed.toFixed(1)}h since harvest.` };
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MCS — Matrix Consistency Score
  // ══════════════════════════════════════════════════════════════════════════
  computeMCS(species, toxinType) {
    const result = { value: 1.0, um_contribution: 0, flagged: false, note: 'Species–toxin combination consistent.' };
    if (!species || !toxinType) {
      result.value = 0.80; result.note = 'Species or toxin not declared — default MCS.';
      return result;
    }
    const isHighRisk = this.SPECIES_TOXIN_MATRIX.highRisk.some(c => c.species === species && c.toxin === toxinType);
    const isLowRisk = this.SPECIES_TOXIN_MATRIX.lowRisk.some(c => c.species === species && c.toxin === toxinType);
    if (isHighRisk) {
      result.value = 1.0; result.note = `${species} is a known accumulator of ${toxinType}.`;
    } else if (isLowRisk) {
      result.value = 0.85; result.um_contribution = 0.05; result.flagged = true;
      result.note = `${species} is a low accumulator of ${toxinType} — verify.`;
    } else {
      result.value = 0.90; result.note = 'Combination not in reference set.';
    }
    return result;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CORRELATED FAILURE
  // ══════════════════════════════════════════════════════════════════════════
  detectCorrelatedFailures(scs, cor) {
    const result = { correlated: false, penalty: 0, reason: null };
    if (this._circuitBreaker.engaged) {
      result.correlated = true; result.penalty = 0.60; result.reason = 'Circuit breaker engaged';
      return result;
    }
    if (scs.measurement_class === 'INFERENTIAL' && cor.evaluable === false) {
      result.correlated = true; result.penalty = Math.max(scs.um_contribution, cor.um_contribution) * 1.2;
      result.reason = 'Strip and corroboration both weak';
    } else if (scs.evaluable === false && cor.evaluable === false) {
      result.correlated = true; result.penalty = 0.45; result.reason = 'Both strip and corroboration unavailable';
    }
    return result;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NORMALIZATION
  // ══════════════════════════════════════════════════════════════════════════
  normalizeWithPenalty(activeDimensions, scores) {
    const totalWeight = activeDimensions.reduce((sum, dim) => sum + this.W[dim], 0);
    const missingDimensions = ['SCS', 'COR', 'TFR', 'MCS'].filter(d => !activeDimensions.includes(d));
    const penalties = { SCS: 0.25, COR: 0.20, TFR: 0.15, MCS: 0.10 };
    let missingPenalty = 1.0;
    for (const dim of missingDimensions) missingPenalty -= penalties[dim] || 0.20;
    missingPenalty = Math.max(0.40, missingPenalty);
    let weightedSum = 0;
    activeDimensions.forEach(dim => { weightedSum += (this.W[dim] / totalWeight) * scores[dim]; });
    return { score: weightedSum * missingPenalty, missing_penalty_applied: missingPenalty, active_dimensions: activeDimensions };
  },

  // ══════════════════════════════════════════════════════════════════════════
  // UNCERTAINTY MASS (R1‑EL‑003: ECF contributions integrated)
  // ══════════════════════════════════════════════════════════════════════════
  computeUM(scs, cor, tfr, mcs, correlatedFailure, ecfContributions = {}) {
    const penalties = [
      scs.um_contribution + (ecfContributions.SCS || 0),
      cor.um_contribution + (ecfContributions.COR || 0),
      tfr.um_contribution + (ecfContributions.TFR || 0),
      mcs.um_contribution + (ecfContributions.MCS || 0)
    ].filter(p => p != null);
    
    let um = 1 - penalties.reduce((acc, p) => acc * (1 - Math.max(0, p)), 1);
    if (correlatedFailure.correlated) um = Math.min(1, um + correlatedFailure.penalty);
    
    // Baseline penalty for provisional matrix (R1‑EL‑003)
    um = Math.min(1, um + 0.05);
    
    um = parseFloat(Math.min(1, Math.max(0, um)).toFixed(3));
    
    let validity_status;
    if (um < this.THRESHOLDS.UM_VALID) validity_status = 'VALID';
    else if (um < this.THRESHOLDS.UM_DEGRADED) validity_status = 'DEGRADED';
    else validity_status = 'SUSPENDED';
    
    return { mass: um, validity_status };
  },

  // ══════════════════════════════════════════════════════════════════════════
  // STRENGTHS & WEAKNESSES
  // ══════════════════════════════════════════════════════════════════════════
  getStrengths(scs, cor, tfr, mcs) {
    const strengths = [], weaknesses = [];
    if (scs.value >= 0.80 && !scs.gated) strengths.push('✅ Strip image clear, high AI confidence');
    else if (scs.gated) weaknesses.push('⚠️ AI confidence low — strip image may be unclear');
    if (cor.signal_type === 'STRONG_AGREEMENT') strengths.push('✅ Strong corroboration — multiple tests agree');
    else if (cor.signal_type === 'CONTRADICTION') weaknesses.push('⚠️ Contradiction with nearby tests');
    else if (cor.signal_type === 'NO_EVIDENCE') weaknesses.push('⚠️ No corroborating tests yet');
    if (tfr.value >= 0.80) strengths.push(`✅ Fresh sample (${tfr.hours_elapsed}h since harvest)`);
    else if (tfr.value < 0.40) weaknesses.push(`⚠️ Sample is stale (${tfr.hours_elapsed}h old)`);
    if (mcs.flagged) weaknesses.push(`⚠️ ${mcs.note}`);
    return { strengths, weaknesses };
  },

  // ══════════════════════════════════════════════════════════════════════════
  // UM BREAKDOWN
  // ══════════════════════════════════════════════════════════════════════════
  getUMBreakdown(scs, cor, tfr, mcs) {
    const b = [];
    if (scs.um_contribution > 0) b.push(`📷 Strip image: +${(scs.um_contribution*100).toFixed(0)}%`);
    if (cor.um_contribution > 0) b.push(`🔍 Corroboration: +${(cor.um_contribution*100).toFixed(0)}%`);
    if (tfr.um_contribution > 0) b.push(`⏱️ Freshness: +${(tfr.um_contribution*100).toFixed(0)}%`);
    if (mcs.um_contribution > 0) b.push(`🧬 Matrix consistency: +${(mcs.um_contribution*100).toFixed(0)}%`);
    return b;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PERCEPTUAL HASH & DUPLICATE DETECTION (R1‑SA‑004: registry populated)
  // ══════════════════════════════════════════════════════════════════════════
  async _generatePerceptualHash(imageDataUrl) {
    if (!imageDataUrl) return null;
    if (typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
      try {
        const img = new Image();
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = imageDataUrl; });
        const canvas = document.createElement('canvas'); canvas.width = 9; canvas.height = 8;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, 9, 8);
        const data = ctx.getImageData(0, 0, 9, 8).data;
        const luma = [];
        for (let i = 0; i < data.length; i += 4) luma.push(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
        let bits = '';
        for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) bits += luma[row*9+col] > luma[row*9+col+1] ? '1' : '0';
        return bits;
      } catch (e) {}
    }
    let h = 0x811c9dc5;
    for (let i = 0; i < imageDataUrl.length; i++) { h ^= imageDataUrl.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return `fnv:${h.toString(16).padStart(8, '0')}`;
  },
  _calculateHashSimilarity(h1, h2) {
    if (!h1 || !h2) return 0;
    if (h1 === h2) return 1.0;
    if (/^[01]{64}$/.test(h1) && /^[01]{64}$/.test(h2)) {
      let matching = 0; for (let i=0;i<64;i++) if (h1[i]===h2[i]) matching++; return matching/64;
    }
    let diff = 0; for (let i=0;i<Math.min(h1.length,h2.length);i++) if (h1[i]!==h2[i]) diff++;
    diff += Math.abs(h1.length - h2.length);
    return Math.max(0, 1 - diff / Math.max(h1.length, h2.length));
  },
  async _registerStrip(hash, reportId) {
    if (!hash) return;
    const entry = { hash, report_id: reportId, timestamp: Date.now() };
    this._stripRegistry.set(hash, entry);
    
    // Persist to storage
    if (this._storage && this._storage.set) {
      try {
        const registry = Array.from(this._stripRegistry.values());
        this._storage.set('strip_registry', registry);
      } catch (err) {}
    }
  },
  async _loadStripRegistry() {
    if (this._storage && this._storage.get) {
      try {
        const saved = this._storage.get('strip_registry');
        if (Array.isArray(saved)) {
          saved.forEach(entry => this._stripRegistry.set(entry.hash, entry));
        }
      } catch (err) {}
    }
  },
  async _findDuplicateStrips(hashes, threshold = 0.95) {
    if (!hashes.length) return [];
    const duplicates = [];
    for (const hash of hashes) {
      for (const [existing, entry] of this._stripRegistry.entries()) {
        if (this._calculateHashSimilarity(hash, existing) >= threshold) {
          duplicates.push({ hash, matched_with: existing, original: entry.report_id });
        }
      }
    }
    return duplicates;
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MASTER SCORE
  // ══════════════════════════════════════════════════════════════════════════
  async score(report, nearbyTests = [], isRealModel = false, context = {}) {
    const timestamp = report.timestamp || new Date().toISOString();
    const reportUuid = report.uuid || this._generateUUID();
    
    // R1‑SA‑001: backpressure only if distributed mode enabled
    if (this.PRODUCTION.enableDistributedMode) {
      await this._acquireBackpressureToken();
    }
    
    const version = this.routeToVersion ? this.routeToVersion(reportUuid) : this.VERSION;

    // Reputation (if enabled)
    let reputation = { score: 0, banned: false };
    if (this.PRODUCTION.enableAppeals) {
      reputation = this._updateReputation(report.reporter_id, 'PENDING');
      if (reputation.banned) {
        await this._logAuditEvent({ type: 'BANNED_REPORTER_BLOCKED', report_id: reportUuid });
        return { usable: false, error: 'REPORTER_BANNED' };
      }
    }
    
    await this._logAuditEvent({ type: 'TEST_SCORED', report_id: reportUuid, version });

    const SCS = this.computeSCS(report, isRealModel);
    const COR = this.computeCOR(nearbyTests, report.testResult, reportUuid);
    const TFR = this.computeTFR(report.harvestTime);
    const MCS = this.computeMCS(report.species, report.toxinType);

    // R1‑SA‑004: register strip for duplicate detection
    if (report.stripPhoto && SCS.evaluable) {
      const hash = await this._generatePerceptualHash(report.stripPhoto);
      if (hash) {
        await this._registerStrip(hash, reportUuid);
      }
    }

    const rawScores = { SCS: SCS.evaluable ? SCS.value : null, COR: COR.evaluable ? COR.value : null, TFR: TFR.value, MCS: MCS.value };
    const activeDimensions = ['SCS', 'COR', 'TFR', 'MCS'].filter(d => rawScores[d] !== null);
    const normalized = this.normalizeWithPenalty(activeDimensions, rawScores);
    const tci_raw = normalized.score;
    const tci = parseFloat(Math.max(0, Math.min(1, tci_raw)).toFixed(3));

    const correlatedFailure = this.detectCorrelatedFailures(SCS, COR);
    
    // R1‑EL‑003: compute ECF contributions
    const ecfContributions = {
      SCS: this.computeECFContribution(report.findings || [], 'SCS'),
      COR: this.computeECFContribution(report.findings || [], 'COR'),
      TFR: this.computeECFContribution(report.findings || [], 'TFR'),
      MCS: this.computeECFContribution(report.findings || [], 'MCS')
    };
    
    const um = this.computeUM(SCS, COR, TFR, MCS, correlatedFailure, ecfContributions);

    const requiresHumanReview = um.validity_status === 'SUSPENDED';
    const hasValidHumanReview = context.human_review_proof?.reviewer_id;

    if (requiresHumanReview && !hasValidHumanReview) {
      return { usable: false, error: 'SUSPENDED — lab confirmation required', version };
    }

    const tier = tci >= this.THRESHOLDS.TCI_HIGH ? 'high' : (tci >= this.THRESHOLDS.TCI_WATCH ? 'watch' : 'review');
    const dims = { SCS: SCS.value || 0, COR: COR.value || 0, TFR: TFR.value, MCS: MCS.value };
    const bottleneck_dim = Object.keys(dims).reduce((a, b) => dims[a] < dims[b] ? a : b);

    const { strengths, weaknesses } = this.getStrengths(SCS, COR, TFR, MCS);
    const umBreakdown = this.getUMBreakdown(SCS, COR, TFR, MCS);

    // R1‑SA‑004: check for duplicate strips
    let duplicateFlag = false;
    if (report.stripPhoto && SCS.evaluable) {
      const hash = await this._generatePerceptualHash(report.stripPhoto);
      if (hash) {
        const duplicates = await this._findDuplicateStrips([hash]);
        duplicateFlag = duplicates.length > 0;
      }
    }

    return {
      tci, tier, usable: um.validity_status !== 'SUSPENDED' || hasValidHumanReview, version,
      tci_scs: SCS.value, tci_cor: COR.value, tci_tfr: TFR.value, tci_mcs: MCS.value,
      tci_uncertainty_mass: um.mass, tci_validity_status: um.validity_status,
      tci_um_breakdown: umBreakdown,
      tci_strengths: strengths, tci_weaknesses: weaknesses,
      tci_bottleneck: { dimension: bottleneck_dim, value: dims[bottleneck_dim] },
      tci_flags: {
        scs_gated: SCS.gated,
        cor_contradiction: COR.signal_type === 'CONTRADICTION',
        mcs_flagged: MCS.flagged,
        duplicate_strip: duplicateFlag
      },
      tci_hours_since_harvest: TFR.hours_elapsed,
      tci_freshness_status: TFR.freshness_status,
      tci_reporter_reputation: reputation,
      model_calibration: this.getModelCalibration(),
      constitutional_status: {
        prohibited_uses: ['discriminatory closure', 'commercial exploitation without consent'],
        prohibited_uses_enforcement: 'CALLER_RESPONSIBILITY',
        consent_gate: 'CALLER_RESPONSIBILITY'
      },
      location: this._anonymizeLocation(report.coordinates || { lat: 0, lng: 0 }, report.locationType),
      appeal_status: this.PRODUCTION.enableAppeals ? {
        appeals_remaining: this.THRESHOLDS.MAX_APPEALS - (report.appeal_count || 0)
      } : { appeals_remaining: 0, disabled: true }
    };
  },

  // ══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ══════════════════════════════════════════════════════════════════════════
  async initialize() {
    await this._callWithCircuitBreaker('storage', 
      () => this._initializeStorage(),
      () => { this._storage = { type: 'memory', get:()=>null, set:()=>{}, logAudit:async()=>{}, saveShard:async()=>{} }; }
    );
    
    // Load strip registry from storage
    await this._loadStripRegistry();
    
    await this._logAuditEvent({ type: 'ENGINE_INITIALIZED', version: this.VERSION });
    return { success: true, version: this.VERSION, calibration: this.getModelCalibration() };
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DISPLAY HELPERS
  // ══════════════════════════════════════════════════════════════════════════
  tierLabel(tier) {
    return { high: 'HIGH CONFIDENCE', watch: 'WATCH', review: 'REVIEW REQUIRED' }[tier] || 'UNKNOWN';
  },
  tierColor(tier) {
    return this.MARKER_STYLES[tier]?.color || '#888';
  },

  // ══════════════════════════════════════════════════════════════════════════
  // RETAINED BUT GATED FUNCTIONS (only used if PRODUCTION flags are true)
  // ══════════════════════════════════════════════════════════════════════════
  async _acquireBackpressureToken(tokens = 1, _maxRetries = 50) {
    if (!this.PRODUCTION.enableDistributedMode) return true;
    const POLL_INTERVAL_MS = 100;
    let retries = 0;
    while (retries < _maxRetries) {
      this._refillTokens();
      if (this._backpressure.tokens >= tokens) { this._backpressure.tokens -= tokens; return true; }
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
      retries++;
    }
    const err = new Error('BACKPRESSURE_EXHAUSTED');
    err.code = 'BACKPRESSURE_EXHAUSTED';
    throw err;
  },
  _refillTokens() {
    const now = Date.now();
    const elapsed = now - this._backpressure.lastRefill;
    const newTokens = elapsed * (this._backpressure.rateLimit / 1000);
    this._backpressure.tokens = Math.min(this._backpressure.rateLimit, this._backpressure.tokens + newTokens);
    this._backpressure.lastRefill = now;
  },
  _updateReputation(reporterId, reportOutcome) {
    if (!this.PRODUCTION.enableAppeals) return { score: 0, banned: false };
    if (!reporterId) return { score: 0, banned: false };
    let reputation = this._reputationStore.get(reporterId) || { score: 0, verified: 0, false: 0, banned: false };
    if (reputation.banned) return reputation;
    if (reportOutcome === 'VERIFIED') { reputation.score += this.THRESHOLDS.REPUTATION.VERIFIED_BONUS; reputation.verified++; }
    else if (reportOutcome === 'FALSE') { reputation.score -= this.THRESHOLDS.REPUTATION.FALSE_REPORT_PENALTY; reputation.false++; }
    if (reputation.score < this.THRESHOLDS.REPUTATION.BAN_THRESHOLD) { reputation.banned = true; reputation.ban_reason = 'Multiple false reports'; }
    this._reputationStore.set(reporterId, reputation);
    return reputation;
  },
  routeToVersion(userId) {
    const hash = this._hashCode(userId) % 100;
    return hash < this.PRODUCTION.canaryPercentage ? this.CANARY_VERSION : this.VERSION;
  },
  _hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
    return Math.abs(hash);
  },
  _anonymizeLocation(coords, locationType) {
    if (this.SENSITIVE_LOCATION_TYPES.includes(locationType)) {
      return { lat: Math.round(coords.lat * 1000) / 1000, lng: Math.round(coords.lng * 1000) / 1000, anonymized: true };
    }
    return { ...coords, anonymized: false };
  }
};

// ==================== EXPORT ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CERTUS_TOXIN;
}
if (typeof window !== 'undefined') {
  window.CERTUS_TOXIN = CERTUS_TOXIN;
  CERTUS_TOXIN.initialize().catch(console.warn);
}