/* ============================================================
   BOOT
   ============================================================ */
initThree();
clearVisualFeedback();
setScene('cars');
lastTime = performance.now();
requestAnimationFrame(loop);

/* ============================================================
   UI BINDINGS
   ============================================================ */
document.querySelectorAll('button[data-scene]').forEach(btn => btn.addEventListener('click', () => setScene(btn.dataset.scene)));
fileInput.addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (f) loadVideoFile(f); });
resetVisualBtn.addEventListener('click', clearVisualFeedback);

const updateLabels = () => {
  document.getElementById('slitCenterVal').textContent = parseFloat(slitCenter.value).toFixed(2);
  document.getElementById('slitWidthVal').textContent  = parseFloat(slitWidth.value).toFixed(3);
  document.getElementById('scanSpeedVal').textContent  = parseFloat(scanSpeed.value).toFixed(2);
  document.getElementById('audioGainVal').textContent  = parseFloat(audioGain.value).toFixed(2);
  document.getElementById('audioMixVal').textContent   = parseFloat(audioMix.value).toFixed(2);
  let feedbackCount = 0;
  for (const route of ROUTES) {
    const value = document.getElementById(route.valueId);
    if (value) value.textContent = route.depth.toFixed(2);
    const depthControl = document.getElementById(route.controlId);
    if (depthControl && depthControl.value !== String(route.depth)) depthControl.value = route.depth;
    const tapControl = document.getElementById(route.tapControlId);
    if (tapControl) tapControl.value = route.analysisTap;
    const ramp = document.getElementById(route.rampId);
    if (ramp) ramp.textContent = route.analysisTap === 'feedback'
      ? `${Math.round(route.feedbackRamp * 100)}%`
      : 'src';
    const modline = depthControl?.closest('.modline');
    if (modline) modline.classList.toggle('feedback', route.analysisTap === 'feedback');
    if (route.analysisTap === 'feedback' && route.depth > 0) feedbackCount++;
  }
  if (feedbackSafetyStatus) {
    feedbackSafetyStatus.innerHTML = feedbackCount
      ? `Active feedback routes: <b>${feedbackCount}</b> · cap ${FEEDBACK_DEPTH_CAP.toFixed(2)} · attenuation ${FEEDBACK_ATTENUATION.toFixed(2)} · ramp ${FEEDBACK_RAMP_SECONDS}s`
      : 'Active feedback routes: <b>0</b> · status: source-driven';
  }
  if (stabilityStatus) {
    stabilityStatus.className = `stability-status ${stabilityState.status}`;
    stabilityStatus.innerHTML = `<span class="lamp"></span><span><b>${stabilityState.status}</b> · ${stabilityState.detail}</span>`;
  }
};

[slitCenter, slitWidth, scanSpeed, audioMix].forEach(el => el.addEventListener('input', updateLabels));
audioGain.addEventListener('input', updateLabels);
updateLabels();

// modulation depth sliders
const bindRouteDepth = (route) => {
  const el = document.getElementById(route.controlId);
  if (!el) return;
  el.value = route.depth;
  el.addEventListener('input', () => {
    setRouteDepth(route.id, el.value);
    updateLabels();
  });
};
ROUTES.forEach(bindRouteDepth);

const bindRouteTap = (route) => {
  const el = document.getElementById(route.tapControlId);
  if (!el) return;
  el.value = route.analysisTap;
  el.addEventListener('change', () => {
    setRouteTap(route.id, el.value);
    updateLabels();
  });
};
ROUTES.forEach(bindRouteTap);

function panicFeedback() {
  for (const route of ROUTES) {
    if (route.analysisTap !== 'feedback') continue;
    route.depth = 0;
    route.feedbackRamp = 0;
  }
  updateLabels();
}

function configureFeedbackQuickstart(routeConfigs) {
  for (const route of ROUTES) {
    setRouteTap(route.id, 'source');
    setRouteDepth(route.id, 0);
  }
  for (const routeConfig of routeConfigs) {
    setRouteTap(routeConfig.id, 'feedback');
    setRouteDepth(routeConfig.id, routeConfig.depth);
  }
  updateLabels();
}

function engageMinimalLoop() {
  configureFeedbackQuickstart([
    { id: 'audCentroidToVisPos', depth: 0.2 },
    { id: 'visBrightToAudGain', depth: 0.2 },
  ]);
}

function engageExplorerLoop() {
  // Audio spread widens the visual slit when the post-worklet spectrum broadens,
  // which proved more mobile than the old centroid-position explorer pair.
  configureFeedbackQuickstart([
    { id: 'audSpreadToVisWidth', depth: 0.18 },
    { id: 'visHueToAudSlit', depth: 0.15 },
  ]);
  // Pulse needs a slightly narrower, less-wet starting point if the spread leg
  // is going to stay exploratory instead of pegging immediately.
  if (currentSourceType === 'pulse') {
    slitWidth.value = '0.03';
    audioMix.value = '0.85';
  } else {
    slitWidth.value = '0.04';
    audioMix.value = '1';
  }
  scanSpeed.value = '1';
  audioGain.value = '0.5';
  updateLabels();
}

panicBtn?.addEventListener('click', panicFeedback);
explorerLoopBtn?.addEventListener('click', engageExplorerLoop);
minimalLoopBtn?.addEventListener('click', engageMinimalLoop);

resSelect.addEventListener('change', () => {
  setResolution(resSelect.value);
});

axisHBtn.addEventListener('click', () => setAxis('h'));
axisVBtn.addEventListener('click', () => setAxis('v'));

audioToggleBtn.addEventListener('click', () => audioOn ? stopAudio() : startAudio());
resetAudioBtn.addEventListener('click', () => { if (workletNode) workletNode.port.postMessage({ type: 'reset' }); });

document.querySelectorAll('button[data-asource]').forEach(btn => btn.addEventListener('click', () => {
  const kind = btn.dataset.asource;
  if (kind === 'video' && !videoEl) {
    errorBox.style.display = 'block';
    errorBox.textContent = 'Upload a movie first to use Movie audio.';
    return;
  }
  selectAudioSource(kind);
}));
audioFileInput.addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  audioFile = f;
  selectAudioSource('file');
});

presetSlotName?.addEventListener('change', normalizePresetSlotName);
copyPresetBtn?.addEventListener('click', () => {
  copyPresetLink().catch(err => setPresetStatus(`copy failed · ${err.message}`, true));
});
loadPresetBtn?.addEventListener('click', () => {
  try {
    loadPresetFromHash();
  } catch (err) {
    setPresetStatus(`hash failed · ${err.message}`, true);
  }
});
saveSlotBtn?.addEventListener('click', () => {
  try {
    savePresetSlot();
  } catch (err) {
    setPresetStatus(`save failed · ${err.message}`, true);
  }
});
loadSlotBtn?.addEventListener('click', () => {
  try {
    loadPresetSlot();
  } catch (err) {
    setPresetStatus(`load failed · ${err.message}`, true);
  }
});

try {
  if (presetHashValue()) loadPresetFromHash();
} catch (err) {
  setPresetStatus(`startup hash failed · ${err.message}`, true);
}

window.addEventListener('beforeunload', () => {
  if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
  stopAudio(); disposeThree();
});
