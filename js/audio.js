/* ============================================================
   AUDIO — context, source, worklet, viz, analysis
   ============================================================ */
let audioCtx = null;
let workletNode = null;
let masterGain = null;
let preAnalyser = null;
let preAnalyserData = null;
let preAnalyserPrev = null;
let postAnalyser = null;
let postAnalyserData = null;
let postAnalyserPrev = null;
let currentSource = null;
let currentSourceType = 'pad';
let audioOn = false;
let audioFile = null;
let audioFileEl = null;
let videoMediaSource = null;  // MediaElementSource for video's audio track
let lastVizData = null;

const FFT_SIZE = 2048;
const NUM_BINS = FFT_SIZE / 2 + 1;
const F_MIN = 80, F_MAX = 12000;

function sliderToBin(v, sampleRate) {
  const hz = F_MIN * Math.pow(F_MAX / F_MIN, clamp01(v));
  return Math.round(hz / (sampleRate / FFT_SIZE));
}

async function startAudio() {
  if (audioOn) return;
  try {
    errorBox.style.display = 'none';
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    const blob = new Blob([workletCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    await audioCtx.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);

    workletNode = new AudioWorkletNode(audioCtx, 'spectral-slitscan', {
      numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2],
    });
    workletNode.port.onmessage = (e) => {
      if (e.data.type === 'viz') lastVizData = e.data;
    };

    preAnalyser = audioCtx.createAnalyser();
    preAnalyser.fftSize = 1024;
    preAnalyser.smoothingTimeConstant = 0.4;
    preAnalyserData = new Uint8Array(preAnalyser.frequencyBinCount);
    preAnalyserPrev = new Uint8Array(preAnalyser.frequencyBinCount);

    postAnalyser = audioCtx.createAnalyser();
    postAnalyser.fftSize = 1024;
    postAnalyser.smoothingTimeConstant = 0.4;
    postAnalyserData = new Uint8Array(postAnalyser.frequencyBinCount);
    postAnalyserPrev = new Uint8Array(postAnalyser.frequencyBinCount);

    masterGain = audioCtx.createGain();
    masterGain.gain.value = parseFloat(audioGain.value);

    workletNode.connect(postAnalyser).connect(masterGain).connect(audioCtx.destination);

    buildSource(currentSourceType);
    pushAudioParams();

    audioOn = true;
    audioToggleBtn.textContent = 'Stop audio';
    resetAudioBtn.disabled = false;
    spectroPanel.classList.remove('hidden');
    audioStatusEl.innerHTML = `audio: <b>on</b> · ${audioCtx.sampleRate}Hz · 2048-FFT`;
    statusEl.classList.add('audio-live');
    updateStatus();
  } catch (e) {
    console.error(e);
    errorBox.style.display = 'block';
    errorBox.textContent = 'Audio error: ' + (e.message || e.name || 'unknown');
  }
}

function stopAudio() {
  if (!audioOn) return;
  disposeCurrentSource();
  if (preAnalyser) { try { preAnalyser.disconnect(); } catch(e){} preAnalyser = null; preAnalyserData = null; preAnalyserPrev = null; }
  if (postAnalyser) { try { postAnalyser.disconnect(); } catch(e){} postAnalyser = null; postAnalyserData = null; postAnalyserPrev = null; }
  if (workletNode) { try { workletNode.disconnect(); } catch(e){} workletNode = null; }
  if (masterGain) { try { masterGain.disconnect(); } catch(e){} masterGain = null; }
  if (audioCtx) { try { audioCtx.close(); } catch(e){} audioCtx = null; }
  audioOn = false;
  audioToggleBtn.textContent = 'Start audio';
  resetAudioBtn.disabled = true;
  spectroPanel.classList.add('hidden');
  audioStatusEl.innerHTML = 'audio: <b>off</b>';
  statusEl.classList.remove('audio-live');
  updateStatus();
}

function disposeCurrentSource() {
  if (currentSource) {
    try { currentSource.disconnect(); } catch(e){}
    if (currentSource._cleanup) currentSource._cleanup();
    currentSource = null;
  }
  if (audioFileEl) {
    try { audioFileEl.pause(); audioFileEl.removeAttribute('src'); audioFileEl.load(); } catch(e){}
    audioFileEl = null;
  }
  // Note: videoMediaSource persists for the lifetime of the video element;
  // it can't be re-created. We only disconnect it.
  if (videoMediaSource) {
    try { videoMediaSource.disconnect(); } catch(e){}
  }
}

function buildSource(kind) {
  if (!audioCtx || !workletNode || !preAnalyser) return;
  disposeCurrentSource();
  currentSourceType = kind;
  document.querySelectorAll('button[data-asource]').forEach(b => b.classList.toggle('primary', b.dataset.asource === kind));

  // wire: source → preAnalyser → workletNode (already wired to master)
  const headGain = audioCtx.createGain();
  headGain.connect(preAnalyser);
  preAnalyser.connect(workletNode);

  if (kind === 'pad') {
    const root = 110;
    const ratios = [1, 6/5, 3/2, 9/4];
    const out = headGain;
    out.gain.value = 0.5;
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 1200; filt.Q.value = 1.5;
    const lfo = audioCtx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.13;
    const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 800;
    lfo.connect(lfoGain).connect(filt.frequency); lfo.start();
    const oscs = [];
    for (const r of ratios) {
      const o = audioCtx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = root * r;
      const detuneLfo = audioCtx.createOscillator();
      detuneLfo.type = 'sine'; detuneLfo.frequency.value = 0.2 + Math.random()*0.4;
      const detGain = audioCtx.createGain(); detGain.gain.value = 6 + Math.random()*8;
      detuneLfo.connect(detGain).connect(o.detune); detuneLfo.start();
      const og = audioCtx.createGain(); og.gain.value = 0.2;
      o.connect(og).connect(filt); o.start();
      oscs.push(o, detuneLfo);
    }
    filt.connect(out);
    currentSource = out;
    currentSource._cleanup = () => oscs.forEach(o => { try { o.stop(); } catch(e){} });
  } else if (kind === 'pulse') {
    const out = headGain; out.gain.value = 0.6;
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 3000; filt.Q.value = 0.7;
    filt.connect(out);
    const scale = [220, 247, 277, 330, 370, 440, 494, 554];
    let scheduledUntil = audioCtx.currentTime;
    const tick = () => {
      if (!audioOn || currentSourceType !== 'pulse') return;
      const now = audioCtx.currentTime;
      while (scheduledUntil < now + 0.5) {
        const t = scheduledUntil;
        const f = scale[Math.floor(Math.random() * scale.length)] * (Math.random() < 0.3 ? 2 : 1);
        const o = audioCtx.createOscillator();
        o.type = 'triangle'; o.frequency.value = f;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.25, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.connect(g).connect(filt);
        o.start(t); o.stop(t + 0.2);
        scheduledUntil += 0.18;
      }
      pulseTimer = setTimeout(tick, 100);
    };
    let pulseTimer = setTimeout(tick, 50);
    currentSource = out;
    currentSource._cleanup = () => clearTimeout(pulseTimer);
  } else if (kind === 'video') {
    if (!videoEl) {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Upload a video first to use Movie audio.';
      return;
    }
    try {
      // MediaElementSource can only be created once per element; reuse if exists
      if (!videoMediaSource) {
        videoMediaSource = audioCtx.createMediaElementSource(videoEl);
      }
      videoEl.muted = false;
      videoEl.volume = 1.0;
      videoMediaSource.connect(headGain);
      headGain.gain.value = 0.9;
      currentSource = headGain;
      currentSource._cleanup = () => {
        try { videoMediaSource.disconnect(); } catch(e){}
        if (videoEl) videoEl.muted = true;
      };
      videoEl.play().catch(()=>{});
    } catch (e) {
      console.error(e);
      errorBox.style.display = 'block';
      errorBox.textContent = 'Could not route video audio: ' + (e.message || e.name);
    }
  } else if (kind === 'file' && audioFile) {
    audioFileEl = document.createElement('audio');
    audioFileEl.src = URL.createObjectURL(audioFile);
    audioFileEl.loop = true;
    const node = audioCtx.createMediaElementSource(audioFileEl);
    const out = headGain; out.gain.value = 0.8;
    node.connect(out);
    currentSource = out;
    currentSource._cleanup = () => { try { node.disconnect(); } catch(e){} };
    audioFileEl.play().catch(err => {
      errorBox.style.display = 'block';
      errorBox.textContent = 'Audio file playback error: ' + err.message;
    });
  }
}

function pushAudioParams() {
  if (!workletNode || !audioCtx) return;
  // compute modulated values
  const baseCenter = parseFloat(slitCenter.value);
  const baseW      = parseFloat(slitWidth.value);
  const baseScan   = parseFloat(scanSpeed.value);
  const hue = routeValue(routesById.visHueToAudSlit);
  const motion = routeValue(routesById.visMotionToAudSpeed);
  const brightness = routeValue(routesById.visBrightToAudGain);

  // Fold hue around the red seam before mapping it onto linear slit position,
  // so near-red frames stay adjacent instead of snapping across the full range.
  const foldedHue = foldHueForSlit(hue);
  const hueMod = (foldedHue - 0.5) * 0.6 * routeDepth('visHueToAudSlit'); // ±0.3 max
  const audioCenter = clamp01(baseCenter + hueMod);

  // visual motion adds to scan speed
  const motionAdd = motion * 3.0 * routeDepth('visMotionToAudSpeed'); // up to +3
  const audioScan = Math.min(MAX_MODULATED_SCAN_SPEED, baseScan + motionAdd);

  const cBin = sliderToBin(audioCenter, audioCtx.sampleRate);
  const halfBins = Math.max(1, Math.round(baseW * NUM_BINS / 2));

  workletNode.port.postMessage({
    type: 'params',
    slitStartBin: cBin - halfBins,
    slitEndBin:   cBin + halfBins,
    scanSpeed: audioScan,
    dryWet: parseFloat(audioMix.value),
  });

  // visual brightness modulates audio gain
  if (masterGain) {
    const baseG = parseFloat(audioGain.value);
    const depth = routeDepth('visBrightToAudGain');
    const gMul = (1 - depth) + brightness * depth; // depth=0 → 1.0; depth=1 → brightness
    masterGain.gain.setTargetAtTime(baseG * gMul, audioCtx.currentTime, 0.05);
  }
}

/* ============================================================
   AUDIO ANALYSIS — amplitude, centroid, spread, onset
   ============================================================ */
function analyzeAudioAnalyser(analyser, data, prev, target, tapName = 'source') {
  if (!analyser || !data || !prev) return;
  analyser.getByteFrequencyData(data);
  const N = data.length;

  let sum = 0, weighted = 0, weightedSq = 0, total = 0;
  let flux = 0;
  for (let i = 0; i < N; i++) {
    const v = data[i] / 255;
    sum += v * v;
    weighted += v * i;
    weightedSq += v * i * i;
    total += v;
    const dv = v - prev[i] / 255;
    if (dv > 0) flux += dv;
  }
  const newAmp = Math.sqrt(sum / N);          // RMS-ish (0..1)
  const centroidIndex = total > 0 ? weighted / total : N * 0.5;
  const newCentroid = centroidIndex / N; // 0..1
  const spreadVariance = total > 0 ? Math.max(0, weightedSq / total - centroidIndex * centroidIndex) : 0;
  const newSpread = clamp01(Math.sqrt(spreadVariance) / (N * 0.28));
  // onset: compare flux to running mean
  // (cheap thresholding — proper onset detection would whiten + adapt)
  const onsetRaw = clamp01((flux - 0.5) * 0.3); // crude but works

  prev.set(data);

  const isFeedback = tapName === 'feedback';
  const ampSmooth = isFeedback ? 0.14 : 0.3;
  const centroidSmooth = isFeedback ? 0.07 : 0.15;
  const spreadSmooth = isFeedback ? 0.09 : 0.18;
  const onsetRelease = isFeedback ? 0.92 : 0.85;
  target.amplitude = lerp(target.amplitude, newAmp, ampSmooth);
  target.centroid  = lerp(target.centroid, newCentroid, centroidSmooth);
  target.spread    = lerp(target.spread, newSpread, spreadSmooth);
  // onset uses a fast attack, slow release
  target.onset = onsetRaw > target.onset
    ? onsetRaw
    : target.onset * onsetRelease;
}

function analyzeAudio() {
  analyzeAudioAnalyser(preAnalyser, preAnalyserData, preAnalyserPrev, analysisTaps.source.audio, 'source');
  analyzeAudioAnalyser(postAnalyser, postAnalyserData, postAnalyserPrev, analysisTaps.feedback.audio, 'feedback');
}

