/* ============================================================
   RENDER LOOP
   ============================================================ */
let frameCount = 0, lastFpsTime = performance.now();
let metersFrame = 0;

function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  elapsed += dt;

  // 1) Update source content
  if (!useVideoSource) {
    scenes[currentScene].draw(elapsed, dt);
    if (sourceTexture) sourceTexture.needsUpdate = true;
  } else if (videoEl && videoEl.readyState >= 2) {
    sctx.drawImage(videoEl, 0, 0, SRC_W, SRC_H);
    if (sourceTexture) sourceTexture.needsUpdate = true;
  }

  // 2) Analyze
  analyzeVisual();
  if (audioOn) analyzeAudio();
  updateFeedbackRamps(dt);
  updateFeedbackRouteValues();
  updateStabilityIndicator(elapsed);

  // 3) Apply modulations to params
  const { visCenter, visW, visScan, clearAmount } = computeVisualParams();
  const halfW = visW / 2;
  simMaterial.uniforms.uSlit.value.set(Math.max(0, visCenter - halfW), Math.min(1, visCenter + halfW));
  simMaterial.uniforms.uScanSpeed.value = visScan;
  simMaterial.uniforms.uAxis.value = (axis === 'h') ? 0 : 1;
  simMaterial.uniforms.uTexelStep.value.set(1.0 / width, 1.0 / height);
  simMaterial.uniforms.uClear.value = clearAmount;

  if (audioOn) pushAudioParams();

  // 4) Render visual
  pctx.drawImage(sourceCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
  const writeIdx = 1 - pingIdx;
  if (!renderer || !simMaterial || !displayMaterial || !pingPong[pingIdx] || !pingPong[writeIdx]) return;
  simMaterial.uniforms.uFeedback.value = pingPong[pingIdx].texture;
  renderer.setRenderTarget(pingPong[writeIdx]);
  renderer.render(simScene, quadCamera);
  pingIdx = writeIdx;
  displayMaterial.uniforms.uTex.value = pingPong[pingIdx].texture;
  renderer.setRenderTarget(null);
  renderer.render(displayScene, quadCamera);
  analyzeVisualFeedback();

  // 5) UI feedback
  if (audioOn) drawSpectro();
  metersFrame++;
  if (metersFrame >= 3) {
    metersFrame = 0;
    updateMeters();
    updateTapDebug();
    updateLabels();
  }

  // FPS
  frameCount++;
  if (now - lastFpsTime >= 1000) {
    fpsMeter.textContent = Math.round(frameCount * 1000 / (now - lastFpsTime)) + ' FPS';
    frameCount = 0; lastFpsTime = now;
  }
}

