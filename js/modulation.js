/* ============================================================
   APPLY MODULATIONS TO VISUAL UNIFORMS
   ============================================================ */
function computeVisualParams() {
  const baseCenter = parseFloat(slitCenter.value);
  const baseW      = parseFloat(slitWidth.value);
  const baseScan   = parseFloat(scanSpeed.value);
  const centroid = routeValue(routesById.audCentroidToVisPos);
  const amplitude = routeValue(routesById.audAmpToVisSpeed);
  const spread = routeValue(routesById.audSpreadToVisWidth);
  const onset = routeValue(routesById.audOnsetToVisClear);

  // audio centroid (centered on 0.5) modulates visual slit position
  const centMod = (centroid - 0.5) * 0.6 * routeDepth('audCentroidToVisPos'); // ±0.3
  const visCenter = clamp01(baseCenter + centMod);

  // audio spread widens the visual slit so broader spectra admit more fresh source
  const spreadAdd = spread * 0.18 * routeDepth('audSpreadToVisWidth');
  const visW = Math.min(0.5, Math.max(0.005, baseW + spreadAdd));

  // audio amplitude adds to scan speed
  const ampAdd = amplitude * 3.0 * routeDepth('audAmpToVisSpeed'); // up to +3
  const visScan = Math.min(MAX_MODULATED_SCAN_SPEED, baseScan + ampAdd);

  // onset triggers clear
  const clearAmount = onset * routeDepth('audOnsetToVisClear');

  return { visCenter, visW, visScan, clearAmount };
}

/* ============================================================
   SPECTRO VIZ
   ============================================================ */
function drawSpectro() {
  if (!lastVizData) return;
  const cw = spectroCanvas.clientWidth, chh = spectroCanvas.clientHeight;
  if (spectroCanvas.width !== cw || spectroCanvas.height !== chh) {
    spectroCanvas.width = cw; spectroCanvas.height = chh;
  }
  const ctx = spectroCanvas.getContext('2d');
  const W = spectroCanvas.width, H = spectroCanvas.height;
  ctx.clearRect(0, 0, W, H);
  const { pre, post, slitStart, slitEnd } = lastVizData;
  const N = pre.length;
  const sx = slitStart / N * W;
  const ex = slitEnd / N * W;
  ctx.fillStyle = 'rgba(24,212,255,0.12)';
  ctx.fillRect(sx, 0, ex - sx, H);
  const drawSpec = (data, color, lineWidth) => {
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = i / N * W;
      const m = data[i];
      const db = m > 1e-6 ? 20 * Math.log10(m) : -120;
      const y = H - Math.max(0, Math.min(1, (db + 80) / 80)) * H;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  drawSpec(pre, 'rgba(106,106,106,0.8)', 1);
  drawSpec(post, '#18d4ff', 1.5);
}

/* ============================================================
   METERS — show live analysis values in the cross-mod panels
   ============================================================ */
function updateMeters() {
  for (const route of ROUTES) {
    const meter = document.getElementById(route.meterId);
    if (meter) meter.style.width = (routeValue(route) * 100).toFixed(0) + '%';
  }
}

function updateTapDebug() {
  const pairs = [
    ['tapVisBrightSource', analysisTaps.source.visual.brightness],
    ['tapVisBrightFeedback', analysisTaps.feedback.visual.brightness],
    ['tapVisMotionSource', analysisTaps.source.visual.motion],
    ['tapVisMotionFeedback', analysisTaps.feedback.visual.motion],
    ['tapVisHueSource', analysisTaps.source.visual.hue],
    ['tapVisHueFeedback', analysisTaps.feedback.visual.hue],
    ['tapAudAmpSource', analysisTaps.source.audio.amplitude],
    ['tapAudAmpFeedback', analysisTaps.feedback.audio.amplitude],
    ['tapAudCentroidSource', analysisTaps.source.audio.centroid],
    ['tapAudCentroidFeedback', analysisTaps.feedback.audio.centroid],
    ['tapAudSpreadSource', analysisTaps.source.audio.spread],
    ['tapAudSpreadFeedback', analysisTaps.feedback.audio.spread],
    ['tapAudOnsetSource', analysisTaps.source.audio.onset],
    ['tapAudOnsetFeedback', analysisTaps.feedback.audio.onset],
  ];
  for (const [id, value] of pairs) {
    const el = document.getElementById(id);
    if (el) el.textContent = value.toFixed(2);
  }
}

