/* ============================================================
   VIDEO UPLOAD
   ============================================================ */
async function loadVideoFile(file) {
  try {
    errorBox.style.display = 'none';
    if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    if (videoEl) {
      try { videoEl.pause(); } catch(e){}
      // Note: we do NOT reuse videoEl because MediaElementSource is bound to it.
      // Create fresh element each upload.
    }
    if (videoMediaSource) {
      try { videoMediaSource.disconnect(); } catch(e){}
      videoMediaSource = null;
    }
    currentBlobUrl = URL.createObjectURL(file);
    videoEl = document.createElement('video');
    videoEl.playsInline = true; videoEl.muted = true; videoEl.loop = true;
    await new Promise((resolve, reject) => {
      videoEl.addEventListener('loadedmetadata', resolve, { once: true });
      videoEl.addEventListener('error', () => reject(new Error('Could not decode video — try mp4/webm.')), { once: true });
      setTimeout(() => reject(new Error('Video load timeout.')), 15000);
      videoEl.src = currentBlobUrl;
    });
    await videoEl.play();
    useVideoSource = true;
    document.querySelectorAll('button[data-scene]').forEach(b => b.classList.remove('primary'));

    // Detect audio track. webkitAudioDecodedByteCount works on Chromium; otherwise we just enable the button.
    videoHasAudio = !!(videoEl.audioTracks && videoEl.audioTracks.length) || true; // be permissive
    videoAudioBtn.disabled = false;

    updateStatus();
  } catch (e) {
    console.error(e);
    errorBox.style.display = 'block';
    errorBox.textContent = 'Video error: ' + (e.message || e.name);
  }
}

/* ============================================================
   STATUS
   ============================================================ */
function updateStatus() {
  const src = useVideoSource ? 'movie' : `scene: ${currentScene}`;
  statusEl.textContent = `${src} · render ${width}×${height}`;
  statusEl.classList.add('live');
}

function setResolution(value) {
  if (!value) return;
  const option = Array.from(resSelect.options).find(entry => entry.value === value);
  if (!option) return;
  if (resSelect.value === value) return;
  resSelect.value = value;
  const [w, h] = value.split(',').map(Number);
  width = w;
  height = h;
  const old = sourceTexture;
  initThree();
  clearVisualFeedback();
  sourceTexture = old;
  simMaterial.uniforms.uSource.value = sourceTexture;
  updateStatus();
}

function setAxis(nextAxis) {
  axis = nextAxis === 'v' ? 'v' : 'h';
  axisHBtn.classList.toggle('primary', axis === 'h');
  axisVBtn.classList.toggle('primary', axis === 'v');
}

function selectAudioSource(kind) {
  if (!kind) return false;
  if (kind === 'video' && !videoEl) return false;
  if (kind === 'file' && !audioFile) return false;
  if (audioOn) buildSource(kind);
  else {
    currentSourceType = kind;
    document.querySelectorAll('button[data-asource]').forEach(b => b.classList.toggle('primary', b.dataset.asource === kind));
  }
  return true;
}

function normalizePresetSlotName() {
  const normalized = (presetSlotName?.value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'default';
  if (presetSlotName) presetSlotName.value = normalized;
  return normalized;
}

function presetHashValue() {
  if (!window.location.hash.startsWith('#preset=')) return null;
  return window.location.hash.slice('#preset='.length);
}

function encodePreset(preset) {
  return btoa(JSON.stringify(preset))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodePreset(encoded) {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - normalized.length % 4) % 4);
  return JSON.parse(atob(normalized + padding));
}

function collectPreset() {
  return {
    version: PRESET_SCHEMA_VERSION,
    visualSource: useVideoSource
      ? { mode: 'video' }
      : { mode: 'scene', scene: currentScene },
    audioSource: currentSourceType,
    controls: {
      slitCenter: clampRange(slitCenter.value, 0, 1, 0.5),
      slitWidth: clampRange(slitWidth.value, 0.005, 0.5, 0.04),
      scanSpeed: clampRange(scanSpeed.value, 0, 5, 1),
      audioGain: clampRange(audioGain.value, 0, 1, 0.5),
      audioMix: clampRange(audioMix.value, 0, 1, 1),
      resolution: resSelect.value,
      axis,
    },
    routes: ROUTES.map(route => ({
      id: route.id,
      tap: route.analysisTap,
      depth: Number(route.depth.toFixed(3)),
    })),
  };
}

function setPresetStatus(message, isError = false) {
  if (!presetStatus) return;
  presetStatus.textContent = message;
  presetStatus.classList.toggle('error', isError);
}

function writePresetHash(preset) {
  const encoded = encodePreset(preset);
  history.replaceState(null, '', `#preset=${encoded}`);
  return `${window.location.origin}${window.location.pathname}#preset=${encoded}`;
}

function applyPreset(preset, options = {}) {
  if (!preset || typeof preset !== 'object') throw new Error('Preset payload is not valid JSON.');
  const controls = preset.controls || {};
  const notes = [];

  if (typeof controls.resolution === 'string') setResolution(controls.resolution);
  if (controls.axis === 'h' || controls.axis === 'v') setAxis(controls.axis);
  slitCenter.value = String(clampRange(controls.slitCenter, 0, 1, 0.5));
  slitWidth.value = String(clampRange(controls.slitWidth, 0.005, 0.5, 0.04));
  scanSpeed.value = String(clampRange(controls.scanSpeed, 0, 5, 1));
  audioGain.value = String(clampRange(controls.audioGain, 0, 1, 0.5));
  audioMix.value = String(clampRange(controls.audioMix, 0, 1, 1));

  if (preset.visualSource?.mode === 'scene' && typeof preset.visualSource.scene === 'string') {
    setScene(preset.visualSource.scene);
  } else if (preset.visualSource?.mode === 'video' && !activateVideoVisualSource()) {
    notes.push('upload movie to restore video source');
  }

  const routeEntries = Array.isArray(preset.routes) ? preset.routes : [];
  for (const routeState of routeEntries) {
    const route = routesById[routeState.id];
    if (!route) continue;
    if (routeState.tap === 'source' || routeState.tap === 'feedback') {
      setRouteTap(route.id, routeState.tap);
    }
    if (typeof routeState.depth === 'number') {
      setRouteDepth(route.id, routeState.depth);
    }
  }

  if (typeof preset.audioSource === 'string' && !selectAudioSource(preset.audioSource)) {
    if (preset.audioSource === 'file') notes.push('upload audio to restore file source');
    else if (preset.audioSource === 'video') notes.push('upload movie to restore movie audio');
  }

  updateLabels();
  if (audioOn) pushAudioParams();

  const label = options.label || 'preset loaded';
  setPresetStatus(notes.length ? `${label} · ${notes.join(' · ')}` : `${label} · ready`, notes.length > 0);
}

function savePresetSlot() {
  const slot = normalizePresetSlotName();
  const preset = collectPreset();
  localStorage.setItem(`${PRESET_STORAGE_PREFIX}${slot}`, JSON.stringify(preset));
  writePresetHash(preset);
  setPresetStatus(`slot saved · ${slot}`, false);
}

function loadPresetSlot() {
  const slot = normalizePresetSlotName();
  const raw = localStorage.getItem(`${PRESET_STORAGE_PREFIX}${slot}`);
  if (!raw) {
    setPresetStatus(`slot missing · ${slot}`, true);
    return false;
  }
  applyPreset(JSON.parse(raw), { label: `slot loaded · ${slot}` });
  writePresetHash(collectPreset());
  return true;
}

function loadPresetFromHash() {
  const encoded = presetHashValue();
  if (!encoded) {
    setPresetStatus('no preset hash present', true);
    return false;
  }
  applyPreset(decodePreset(encoded), { label: 'hash loaded' });
  return true;
}

async function copyPresetLink() {
  const url = writePresetHash(collectPreset());
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    setPresetStatus('preset link copied', false);
  } else {
    setPresetStatus('hash updated · clipboard unavailable', false);
  }
}

