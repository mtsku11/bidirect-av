/* ============================================================
   DOM
   ============================================================ */
const stage         = document.getElementById('stage');
const previewCanvas = document.getElementById('preview');
const spectroPanel  = document.getElementById('spectroPanel');
const spectroCanvas = document.getElementById('spectroCanvas');
const fileInput     = document.getElementById('fileInput');
const audioFileInput= document.getElementById('audioFileInput');
const resetVisualBtn= document.getElementById('resetVisualBtn');
const resetAudioBtn = document.getElementById('resetAudioBtn');
const audioToggleBtn= document.getElementById('audioToggleBtn');
const videoAudioBtn = document.getElementById('videoAudioBtn');
const errorBox      = document.getElementById('error');
const statusEl      = document.getElementById('status');
const audioStatusEl = document.getElementById('audioStatus');
const fpsMeter      = document.getElementById('fpsMeter');
const slitCenter    = document.getElementById('slitCenter');
const slitWidth     = document.getElementById('slitWidth');
const scanSpeed     = document.getElementById('scanSpeed');
const audioGain     = document.getElementById('audioGain');
const audioMix      = document.getElementById('audioMix');
const resSelect     = document.getElementById('resSelect');
const axisHBtn      = document.getElementById('axisH');
const axisVBtn      = document.getElementById('axisV');
const explorerLoopBtn = document.getElementById('explorerLoopBtn');
const presetSlotName = document.getElementById('presetSlotName');
const copyPresetBtn = document.getElementById('copyPresetBtn');
const loadPresetBtn = document.getElementById('loadPresetBtn');
const saveSlotBtn = document.getElementById('saveSlotBtn');
const loadSlotBtn = document.getElementById('loadSlotBtn');
const presetStatus = document.getElementById('presetStatus');
const minimalLoopBtn = document.getElementById('minimalLoopBtn');
const panicBtn      = document.getElementById('panicBtn');
const feedbackSafetyStatus = document.getElementById('feedbackSafetyStatus');
const stabilityStatus = document.getElementById('stabilityStatus');

/* ============================================================
   ANALYSIS HUB
   Holds live analyzed values, smoothed, normalized 0..1
   ============================================================ */
const makeAudioAnalysis = () => ({ amplitude: 0, centroid: 0.5, spread: 0, onset: 0 });
const makeVisualAnalysis = () => ({ brightness: 0, motion: 0, hue: 0.5 });

const analysisTaps = {
  source: {
    audio: makeAudioAnalysis(),
    visual: makeVisualAnalysis(),
  },
  feedback: {
    audio: makeAudioAnalysis(),
    visual: makeVisualAnalysis(),
  },
};

// Source analysis remains the default modulation feed until a route opts into feedback.
const A = analysisTaps.source;

const FEEDBACK_DEPTH_CAP = 0.3;
const FEEDBACK_RAMP_SECONDS = 5;
const FEEDBACK_ATTENUATION = 0.98;
const MAX_MODULATED_SCAN_SPEED = 6;
const STABILITY_WINDOW_SECONDS = 2;
const STABILITY_MIN_WINDOW_SECONDS = 1.5;
const LOCKUP_VARIANCE_THRESHOLD = 0.0005;
const LOCKUP_RANGE_THRESHOLD = 0.04;
const RUNAWAY_LOW_THRESHOLD = 0.03;
const RUNAWAY_HIGH_THRESHOLD = 0.97;
const PRESET_SCHEMA_VERSION = 1;
const PRESET_STORAGE_PREFIX = 'slitscan-av:preset:';

// Shared deterministic RNG for repeatable regression screens. Keep this helper
// centralized so audio and visual sources do not silently diverge.
function createSeededRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROUTES = [
  {
    id: 'audAmpToVisSpeed',
    sourceDomain: 'audio',
    sourceFeature: 'amplitude',
    analysisTap: 'source',
    targetDomain: 'visual',
    targetParam: 'scanSpeed',
    controlId: 'modA1',
    tapControlId: 'tapA1',
    valueId: 'modA1Val',
    meterId: 'meterA1',
    rampId: 'rampA1',
    defaultDepth: 0.5,
    depth: 0.5,
    feedbackRamp: 0,
    feedbackValue: 0,
  },
  {
    id: 'audCentroidToVisPos',
    sourceDomain: 'audio',
    sourceFeature: 'centroid',
    analysisTap: 'source',
    targetDomain: 'visual',
    targetParam: 'slitPosition',
    controlId: 'modA2',
    tapControlId: 'tapA2',
    valueId: 'modA2Val',
    meterId: 'meterA2',
    rampId: 'rampA2',
    defaultDepth: 0.5,
    depth: 0.5,
    feedbackRamp: 0,
    feedbackValue: 0.5,
  },
  {
    id: 'audOnsetToVisClear',
    sourceDomain: 'audio',
    sourceFeature: 'onset',
    analysisTap: 'source',
    targetDomain: 'visual',
    targetParam: 'clear',
    controlId: 'modA3',
    tapControlId: 'tapA3',
    valueId: 'modA3Val',
    meterId: 'meterA3',
    rampId: 'rampA3',
    defaultDepth: 0.3,
    depth: 0.3,
    feedbackRamp: 0,
    feedbackValue: 0,
  },
  {
    id: 'audSpreadToVisWidth',
    sourceDomain: 'audio',
    sourceFeature: 'spread',
    analysisTap: 'source',
    targetDomain: 'visual',
    targetParam: 'slitWidth',
    controlId: 'modA4',
    tapControlId: 'tapA4',
    valueId: 'modA4Val',
    meterId: 'meterA4',
    rampId: 'rampA4',
    defaultDepth: 0,
    depth: 0,
    feedbackRamp: 0,
    feedbackValue: 0,
  },
  {
    id: 'visMotionToAudSpeed',
    sourceDomain: 'visual',
    sourceFeature: 'motion',
    analysisTap: 'source',
    targetDomain: 'audio',
    targetParam: 'scanSpeed',
    controlId: 'modV1',
    tapControlId: 'tapV1',
    valueId: 'modV1Val',
    meterId: 'meterV1',
    rampId: 'rampV1',
    defaultDepth: 0.5,
    depth: 0.5,
    feedbackRamp: 0,
    feedbackValue: 0,
  },
  {
    id: 'visBrightToAudGain',
    sourceDomain: 'visual',
    sourceFeature: 'brightness',
    analysisTap: 'source',
    targetDomain: 'audio',
    targetParam: 'gain',
    controlId: 'modV2',
    tapControlId: 'tapV2',
    valueId: 'modV2Val',
    meterId: 'meterV2',
    rampId: 'rampV2',
    defaultDepth: 0.3,
    depth: 0.3,
    feedbackRamp: 0,
    feedbackValue: 0,
  },
  {
    id: 'visHueToAudSlit',
    sourceDomain: 'visual',
    sourceFeature: 'hue',
    analysisTap: 'source',
    targetDomain: 'audio',
    targetParam: 'slitPosition',
    controlId: 'modV3',
    tapControlId: 'tapV3',
    valueId: 'modV3Val',
    meterId: 'meterV3',
    rampId: 'rampV3',
    defaultDepth: 0.5,
    depth: 0.5,
    feedbackRamp: 0,
    feedbackValue: 0.5,
  },
];

const routesById = Object.fromEntries(ROUTES.map(route => [route.id, route]));
const stabilityState = {
  status: 'stable',
  detail: 'waiting for feedback window',
  routeId: null,
  routeLabel: null,
};

// helpers
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = v => Math.max(0, Math.min(1, v));
const wrap01 = v => {
  const wrapped = v % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
};
const circularDelta01 = (from, to) => {
  let delta = wrap01(to) - wrap01(from);
  if (delta > 0.5) delta -= 1;
  else if (delta < -0.5) delta += 1;
  return delta;
};
const lerpCircular01 = (from, to, t) => wrap01(from + circularDelta01(from, to) * t);
const foldHueForSlit = hue => {
  const wrapped = wrap01(hue);
  const folded = wrapped <= 0.5 ? wrapped : 1 - wrapped;
  return clamp01(folded * 2);
};
const clampRange = (value, min, max, fallback = min) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

function routeDepth(id) {
  const route = routesById[id];
  if (!route) return 0;
  const cappedDepth = route.analysisTap === 'feedback'
    ? Math.min(route.depth, FEEDBACK_DEPTH_CAP)
    : route.depth;
  return cappedDepth * (route.analysisTap === 'feedback' ? route.feedbackRamp : 1);
}

function setRouteDepth(id, value) {
  const route = routesById[id];
  if (!route) return;
  const requested = clamp01(Number.parseFloat(value) || 0);
  route.depth = route.analysisTap === 'feedback'
    ? Math.min(requested, FEEDBACK_DEPTH_CAP)
    : requested;
}

function setRouteTap(id, tap) {
  const route = routesById[id];
  if (!route || !analysisTaps[tap]) return;
  if (route.analysisTap === tap) return;
  route.analysisTap = tap;
  if (tap === 'feedback') {
    route.depth = Math.min(route.depth, FEEDBACK_DEPTH_CAP);
    route.feedbackRamp = 0;
    route.feedbackValue = routeValueRaw(route, 'feedback');
  } else {
    route.feedbackRamp = 0;
  }
}

function routeValueRaw(route, tapName = route.analysisTap) {
  const tap = analysisTaps[tapName] ?? analysisTaps.source;
  return tap[route.sourceDomain]?.[route.sourceFeature] ?? 0;
}

function routeValue(route) {
  const raw = routeValueRaw(route);
  if (route.analysisTap !== 'feedback') return raw;
  return route.feedbackValue;
}

function attenuateFeedbackValue(route, value) {
  if (route.sourceFeature === 'centroid' || route.sourceFeature === 'hue') {
    return 0.5 + (value - 0.5) * FEEDBACK_ATTENUATION;
  }
  return value * FEEDBACK_ATTENUATION;
}

function updateFeedbackRouteValues() {
  for (const route of ROUTES) {
    if (route.analysisTap !== 'feedback') continue;
    const raw = routeValueRaw(route, 'feedback');
    route.feedbackValue = attenuateFeedbackValue(route, raw);
  }
}

function updateFeedbackRamps(dt) {
  const step = dt / FEEDBACK_RAMP_SECONDS;
  for (const route of ROUTES) {
    const target = route.analysisTap === 'feedback' && route.depth > 0 ? 1 : 0;
    if (route.feedbackRamp < target) route.feedbackRamp = Math.min(target, route.feedbackRamp + step);
    else if (route.feedbackRamp > target) route.feedbackRamp = Math.max(target, route.feedbackRamp - step);
  }
}

function routeLabel(route) {
  return `${route.sourceFeature} to ${route.targetParam}`;
}

function updateStabilityIndicator(nowSeconds) {
  const activeRoutes = ROUTES.filter(route => route.analysisTap === 'feedback' && routeDepth(route.id) > 0.01);

  for (const route of ROUTES) {
    if (!route.stabilitySamples) route.stabilitySamples = [];
    if (!activeRoutes.includes(route)) {
      route.stabilitySamples.length = 0;
      continue;
    }
    route.stabilitySamples.push({ time: nowSeconds, value: routeValue(route) });
    while (route.stabilitySamples.length && nowSeconds - route.stabilitySamples[0].time > STABILITY_WINDOW_SECONDS) {
      route.stabilitySamples.shift();
    }
  }

  if (!activeRoutes.length) {
    stabilityState.status = 'stable';
    stabilityState.detail = 'source-driven';
    stabilityState.routeId = null;
    stabilityState.routeLabel = null;
    return;
  }

  let watchDetail = 'gathering feedback window';
  for (const route of activeRoutes) {
    const samples = route.stabilitySamples || [];
    if (samples.length < 2) continue;
    const span = samples[samples.length - 1].time - samples[0].time;
    if (span < STABILITY_MIN_WINDOW_SECONDS) continue;

    let min = 1, max = 0, sum = 0;
    for (const sample of samples) {
      min = Math.min(min, sample.value);
      max = Math.max(max, sample.value);
      sum += sample.value;
    }
    const mean = sum / samples.length;
    let variance = 0;
    for (const sample of samples) variance += (sample.value - mean) ** 2;
    variance /= samples.length;
    const range = max - min;
    const label = routeLabel(route);

    if ((mean <= RUNAWAY_LOW_THRESHOLD || mean >= RUNAWAY_HIGH_THRESHOLD) && range < LOCKUP_RANGE_THRESHOLD) {
      stabilityState.status = 'runaway';
      stabilityState.detail = `pegged ${mean.toFixed(2)} on ${label}`;
      stabilityState.routeId = route.id;
      stabilityState.routeLabel = label;
      return;
    }
    if (variance < LOCKUP_VARIANCE_THRESHOLD && range < LOCKUP_RANGE_THRESHOLD) {
      stabilityState.status = 'lockup';
      stabilityState.detail = `flat ${mean.toFixed(2)} on ${label}`;
      stabilityState.routeId = route.id;
      stabilityState.routeLabel = label;
      return;
    }
    watchDetail = `window ${span.toFixed(1)}s · range ${range.toFixed(2)}`;
  }

  stabilityState.status = 'stable';
  stabilityState.detail = watchDetail;
  stabilityState.routeId = null;
  stabilityState.routeLabel = null;
}
