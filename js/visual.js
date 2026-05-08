/* ============================================================
   VISUAL — procedural source canvas + slit-scan shader
   ============================================================ */
const SRC_W = 960, SRC_H = 540;
const sourceCanvas = document.createElement('canvas');
sourceCanvas.width = SRC_W; sourceCanvas.height = SRC_H;
const sctx = sourceCanvas.getContext('2d');

const pctx = previewCanvas.getContext('2d');
previewCanvas.width = 240; previewCanvas.height = 135;

// small offscreen canvases for source and processed-output visual analysis
const ANA_W = 64, ANA_H = 36;
function makeVisualAnalysisBuffer() {
  const canvas = document.createElement('canvas');
  canvas.width = ANA_W; canvas.height = ANA_H;
  return {
    canvas,
    ctx: canvas.getContext('2d', { willReadFrequently: true }),
    prevPixels: null,
  };
}
const visualAnalysisBuffers = {
  source: makeVisualAnalysisBuffer(),
  feedback: makeVisualAnalysisBuffer(),
};
let visualFeedbackReadWarningShown = false;

let currentScene = 'cars';
let sceneState = {};
let lastTime = performance.now();
let elapsed = 0;

const scenes = {
  cars: {
    init() {
      const cars = [];
      const lanes = [
        { y: SRC_H * 0.55, dir: 1,  speedMin:  90, speedMax: 220 },
        { y: SRC_H * 0.65, dir: 1,  speedMin: 130, speedMax: 280 },
        { y: SRC_H * 0.75, dir: -1, speedMin: 110, speedMax: 240 },
        { y: SRC_H * 0.85, dir: -1, speedMin: 160, speedMax: 320 },
      ];
      for (let i = 0; i < 14; i++) {
        const lane = lanes[i % lanes.length];
        cars.push({
          lane, x: Math.random() * SRC_W,
          w: 70 + Math.random() * 90, h: 26 + Math.random() * 16,
          speed: lane.speedMin + Math.random() * (lane.speedMax - lane.speedMin),
          color: `hsl(${Math.floor(Math.random()*360)}, 80%, 60%)`,
          window: `hsl(${Math.floor(Math.random()*360)}, 30%, 80%)`,
        });
      }
      sceneState = { cars, lanes };
    },
    draw(t, dt) {
      const grad = sctx.createLinearGradient(0, 0, 0, SRC_H * 0.55);
      grad.addColorStop(0, '#1a0a2e'); grad.addColorStop(0.5, '#7a2c8e'); grad.addColorStop(1, '#ff6b35');
      sctx.fillStyle = grad; sctx.fillRect(0, 0, SRC_W, SRC_H);
      sctx.fillStyle = '#ffe066';
      sctx.beginPath(); sctx.arc(SRC_W * 0.7, SRC_H * 0.45, 60, 0, Math.PI * 2); sctx.fill();
      sctx.fillStyle = '#1f0d2f';
      for (let i = 0; i < 18; i++) {
        const bx = i * (SRC_W / 18), bw = SRC_W / 18 + 2, bh = 60 + ((i*53) % 90);
        sctx.fillRect(bx, SRC_H * 0.55 - bh, bw, bh);
      }
      sctx.fillStyle = '#0d0d0d'; sctx.fillRect(0, SRC_H * 0.55, SRC_W, SRC_H * 0.45);
      sctx.fillStyle = '#ffcc00';
      for (const lane of sceneState.lanes) {
        const sw = 50;
        const off = ((t * 60 * lane.dir) % (sw * 2) + sw * 2) % (sw * 2);
        for (let x = -off; x < SRC_W; x += sw * 2) sctx.fillRect(x, lane.y - 2, sw * 0.6, 3);
      }
      for (const car of sceneState.cars) {
        car.x += car.speed * car.lane.dir * dt;
        if (car.lane.dir > 0 && car.x > SRC_W + car.w) car.x = -car.w;
        if (car.lane.dir < 0 && car.x < -car.w) car.x = SRC_W + car.w;
        const y = car.lane.y - car.h;
        sctx.fillStyle = car.color; sctx.fillRect(car.x, y, car.w, car.h);
        sctx.fillStyle = car.window; sctx.fillRect(car.x + car.w*0.15, y + 4, car.w*0.7, car.h*0.45);
        sctx.fillStyle = '#000';
        sctx.fillRect(car.x + 8, y + car.h, 14, 8);
        sctx.fillRect(car.x + car.w - 22, y + car.h, 14, 8);
      }
    }
  },
  bouncers: {
    init() {
      const balls = [];
      for (let i = 0; i < 10; i++) {
        const r = 24 + Math.random() * 36;
        balls.push({
          x: r + Math.random()*(SRC_W - 2*r), y: r + Math.random()*(SRC_H - 2*r),
          vx: (Math.random()-0.5)*500, vy: (Math.random()-0.5)*500, r,
          color: `hsl(${Math.floor(Math.random()*360)}, 75%, 60%)`,
        });
      }
      sceneState = { balls };
    },
    draw(t, dt) {
      sctx.fillStyle = '#0a0a14'; sctx.fillRect(0,0,SRC_W,SRC_H);
      sctx.strokeStyle = '#1a1a28'; sctx.lineWidth = 1;
      for (let x=0; x<SRC_W; x+=60){ sctx.beginPath(); sctx.moveTo(x,0); sctx.lineTo(x,SRC_H); sctx.stroke(); }
      for (let y=0; y<SRC_H; y+=60){ sctx.beginPath(); sctx.moveTo(0,y); sctx.lineTo(SRC_W,y); sctx.stroke(); }
      for (const b of sceneState.balls) {
        b.x += b.vx*dt; b.y += b.vy*dt;
        if (b.x < b.r){b.x=b.r; b.vx=-b.vx;} if (b.x > SRC_W-b.r){b.x=SRC_W-b.r; b.vx=-b.vx;}
        if (b.y < b.r){b.y=b.r; b.vy=-b.vy;} if (b.y > SRC_H-b.r){b.y=SRC_H-b.r; b.vy=-b.vy;}
        const g = sctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*1.4);
        g.addColorStop(0, b.color); g.addColorStop(1,'rgba(0,0,0,0)');
        sctx.fillStyle = g; sctx.beginPath(); sctx.arc(b.x,b.y,b.r*1.4,0,Math.PI*2); sctx.fill();
        sctx.fillStyle = b.color; sctx.beginPath(); sctx.arc(b.x,b.y,b.r,0,Math.PI*2); sctx.fill();
      }
    }
  },
  marquee: {
    init() { sceneState = { text: 'SLIT • SCAN • TIME • DISPLACEMENT • FEEDBACK • ', offset: 0 }; },
    draw(t, dt) {
      const bands = 6;
      for (let i=0;i<bands;i++){ sctx.fillStyle = `hsl(${(i*50+t*20)%360}, 70%, 22%)`; sctx.fillRect(0,(SRC_H/bands)*i, SRC_W, SRC_H/bands+1); }
      sceneState.offset = (t*280) % 1200;
      sctx.font = 'bold 110px ui-monospace, monospace'; sctx.textBaseline='middle';
      const text = sceneState.text.repeat(6);
      const measureW = sctx.measureText(text).width;
      sctx.fillStyle = '#fff';
      let x = -sceneState.offset;
      while (x < SRC_W) { sctx.fillText(text, x, SRC_H/2); x += measureW; }
      sctx.fillStyle = '#ff7a18'; sctx.beginPath();
      sctx.arc(SRC_W/2 + Math.sin(t*2)*SRC_W*0.4, SRC_H*0.85, 24, 0, Math.PI*2); sctx.fill();
    }
  },
  walker: {
    init() { sceneState = { phase: 0 }; },
    draw(t, dt) {
      const grad = sctx.createLinearGradient(0,0,0,SRC_H);
      grad.addColorStop(0,'#0a1a2e'); grad.addColorStop(0.6,'#3a5a8e'); grad.addColorStop(0.7,'#2a7a4e'); grad.addColorStop(1,'#1a3a2e');
      sctx.fillStyle = grad; sctx.fillRect(0,0,SRC_W,SRC_H);
      sctx.fillStyle = '#0a2a1e';
      for (let i=0;i<8;i++) sctx.fillRect(0, SRC_H*0.7 + i*20, SRC_W, 4);
      const cycle = 6, u = (t % cycle)/cycle;
      const cx = u*(SRC_W+200) - 100, cy = SRC_H*0.62;
      const stride = Math.sin(t*6), bob = Math.abs(Math.cos(t*6))*8;
      sctx.fillStyle = '#ffd166';
      sctx.fillRect(cx-18, cy-80-bob, 36, 60);
      sctx.beginPath(); sctx.arc(cx, cy-100-bob, 22, 0, Math.PI*2); sctx.fill();
      sctx.strokeStyle = '#ffd166'; sctx.lineWidth = 12; sctx.lineCap = 'round';
      sctx.beginPath();
      sctx.moveTo(cx-12, cy-70-bob); sctx.lineTo(cx-12-stride*24, cy-30-bob);
      sctx.moveTo(cx+12, cy-70-bob); sctx.lineTo(cx+12+stride*24, cy-30-bob);
      sctx.stroke();
      sctx.strokeStyle = '#06d6a0';
      sctx.beginPath();
      sctx.moveTo(cx-8, cy-20-bob); sctx.lineTo(cx-8-stride*28, cy+20);
      sctx.moveTo(cx+8, cy-20-bob); sctx.lineTo(cx+8+stride*28, cy+20);
      sctx.stroke();
    }
  },
};

function setScene(name) {
  if (!scenes[name]) return;
  currentScene = name;
  scenes[name].init();
  document.querySelectorAll('button[data-scene]').forEach(b => b.classList.toggle('primary', b.dataset.scene === name));
  useVideoSource = false;
  if (sourceTexture) { sourceTexture.dispose(); sourceTexture = null; }
  sourceTexture = new THREE.CanvasTexture(sourceCanvas);
  sourceTexture.minFilter = THREE.LinearFilter; sourceTexture.magFilter = THREE.LinearFilter;
  if (simMaterial) simMaterial.uniforms.uSource.value = sourceTexture;
  updateStatus();
}

function activateVideoVisualSource() {
  if (!videoEl) return false;
  useVideoSource = true;
  document.querySelectorAll('button[data-scene]').forEach(b => b.classList.remove('primary'));
  updateStatus();
  return true;
}

let renderer, simScene, displayScene, quadCamera;
let simMaterial, displayMaterial;
let sourceTexture = null;
let pingPong = []; let pingIdx = 0;
let width = 640, height = 480;
let axis = 'h';
let videoEl = null, currentBlobUrl = null, useVideoSource = false;
let videoHasAudio = false;

// onset clear request
let pendingClearAmount = 0;

function disposeThree() {
  if (renderer) {
    pingPong.forEach(rt => rt.dispose()); pingPong = [];
    if (simMaterial) simMaterial.dispose();
    if (displayMaterial) displayMaterial.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    renderer = null;
  }
}

function initThree() {
  disposeThree();
  renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: false });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  const dom = renderer.domElement;
  dom.id = 'three';
  dom.style.width = '100%'; dom.style.height = '100%'; dom.style.objectFit = 'contain';
  stage.appendChild(dom);

  const rtOpts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat, type: THREE.UnsignedByteType, depthBuffer: false, stencilBuffer: false };
  pingPong = [
    new THREE.WebGLRenderTarget(width, height, rtOpts),
    new THREE.WebGLRenderTarget(width, height, rtOpts),
  ];
  pingIdx = 0;
  quadCamera = new THREE.Camera();

  simScene = new THREE.Scene();
  simMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uSource: { value: sourceTexture },
      uFeedback: { value: pingPong[0].texture },
      uSlit: { value: new THREE.Vector2(0.48, 0.52) },
      uTexelStep: { value: new THREE.Vector2(1.0/width, 1.0/height) },
      uScanSpeed: { value: 1.0 },
      uAxis: { value: 0 },
      uClear: { value: 0.0 }, // onset-driven clear
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uSource; uniform sampler2D uFeedback;
      uniform vec2 uSlit; uniform vec2 uTexelStep; uniform float uScanSpeed; uniform int uAxis;
      uniform float uClear;
      varying vec2 vUv;
      void main() {
        float coord = (uAxis == 0) ? vUv.x : vUv.y;
        float step  = (uAxis == 0) ? uTexelStep.x : uTexelStep.y;
        float shift = step * uScanSpeed;
        vec4 color;
        if (coord < uSlit.x) {
          vec2 uv = (uAxis == 0) ? vec2(vUv.x + shift, vUv.y) : vec2(vUv.x, vUv.y + shift);
          color = texture2D(uFeedback, uv) * (1.0 - uClear);
        } else if (coord > uSlit.y) {
          vec2 uv = (uAxis == 0) ? vec2(vUv.x - shift, vUv.y) : vec2(vUv.x, vUv.y - shift);
          color = texture2D(uFeedback, uv) * (1.0 - uClear);
        } else {
          color = texture2D(uSource, vUv);
        }
        gl_FragColor = color;
      }
    `,
  });
  simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2), simMaterial));

  displayScene = new THREE.Scene();
  displayMaterial = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: pingPong[0].texture } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
    fragmentShader: `precision highp float; uniform sampler2D uTex; varying vec2 vUv; void main(){ gl_FragColor = texture2D(uTex, vUv); }`,
  });
  displayScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2), displayMaterial));
}

function clearVisualFeedback() {
  if (!renderer) return;
  pingPong.forEach(rt => {
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 1); renderer.clear();
  });
  renderer.setRenderTarget(null);
}

/* ============================================================
   VISUAL ANALYSIS — brightness, motion, hue from source/output taps
   ============================================================ */
function analyzeVisualBuffer(buffer, target, tapName = 'source') {
  const img = buffer.ctx.getImageData(0, 0, ANA_W, ANA_H);
  const data = img.data;
  const N = ANA_W * ANA_H;

  // Brightness, hue (saturation-weighted), motion
  let sumLum = 0;
  let sumX = 0, sumY = 0, sumW = 0; // for hue circular-mean (treat hue as angle)
  let motion = 0;
  for (let i = 0, p = 0; i < N; i++, p += 4) {
    const r = data[p] / 255, g = data[p+1] / 255, b = data[p+2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sumLum += lum;
    const sat = max - min;
    if (sat > 0.02) {
      // compute hue
      let h;
      if (max === r) h = ((g - b) / sat) % 6;
      else if (max === g) h = (b - r) / sat + 2;
      else h = (r - g) / sat + 4;
      h = h * 60; // degrees
      if (h < 0) h += 360;
      const ang = h * Math.PI / 180;
      const w = sat;
      sumX += Math.cos(ang) * w;
      sumY += Math.sin(ang) * w;
      sumW += w;
    }
    if (buffer.prevPixels) {
      const dr = r - buffer.prevPixels[p] / 255;
      const dg = g - buffer.prevPixels[p+1] / 255;
      const db = b - buffer.prevPixels[p+2] / 255;
      motion += Math.abs(dr) + Math.abs(dg) + Math.abs(db);
    }
  }

  const newBrightness = sumLum / N;
  let newHue = 0.5;
  if (sumW > 0) {
    let ang = Math.atan2(sumY, sumX);
    if (ang < 0) ang += 2 * Math.PI;
    newHue = ang / (2 * Math.PI); // 0..1 = 0..360°
  }
  // motion normalisation: typical max sum ~ N*3 for full white-to-black flips → normalize
  const newMotion = clamp01(motion / (N * 0.6));

  // Feedback taps get extra damping because they can re-enter the system.
  const isFeedback = tapName === 'feedback';
  const aFast = isFeedback ? 0.18 : 0.35;
  const aSlow = isFeedback ? 0.08 : 0.15;
  target.brightness = lerp(target.brightness, newBrightness, aSlow);
  target.motion     = lerp(target.motion, newMotion, aFast);
  // Hue is circular, so smooth across the shortest wrapped path instead of
  // interpolating through the 0/1 seam.
  target.hue        = lerpCircular01(target.hue, newHue, aSlow);

  // store for next motion calc
  if (!buffer.prevPixels) buffer.prevPixels = new Uint8ClampedArray(data.length);
  buffer.prevPixels.set(data);
}

function analyzeVisual() {
  const buffer = visualAnalysisBuffers.source;
  // Blit current source to small analysis canvas
  if (useVideoSource && videoEl && videoEl.readyState >= 2) {
    buffer.ctx.drawImage(videoEl, 0, 0, ANA_W, ANA_H);
  } else {
    buffer.ctx.drawImage(sourceCanvas, 0, 0, ANA_W, ANA_H);
  }
  analyzeVisualBuffer(buffer, analysisTaps.source.visual, 'source');
}

function analyzeVisualFeedback() {
  if (!renderer?.domElement) return;
  const buffer = visualAnalysisBuffers.feedback;
  try {
    buffer.ctx.drawImage(renderer.domElement, 0, 0, ANA_W, ANA_H);
    analyzeVisualBuffer(buffer, analysisTaps.feedback.visual, 'feedback');
  } catch (e) {
    if (!visualFeedbackReadWarningShown) {
      console.warn('Visual feedback analysis unavailable:', e.message || e.name);
      visualFeedbackReadWarningShown = true;
    }
  }
}

