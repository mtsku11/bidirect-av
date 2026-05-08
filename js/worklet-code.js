/* ============================================================
   AUDIO WORKLET — spectral slit-scan via FFT
   ============================================================ */
const workletCode = `
class FFTHelper {
  constructor(n) {
    this.n = n;
    this.cosTbl = new Float32Array(n / 2);
    this.sinTbl = new Float32Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
      const a = -2 * Math.PI * i / n;
      this.cosTbl[i] = Math.cos(a); this.sinTbl[i] = Math.sin(a);
    }
  }
  fft(real, imag) {
    const n = this.n;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      while (j & bit) { j ^= bit; bit >>= 1; }
      j ^= bit;
      if (i < j) {
        let t = real[i]; real[i] = real[j]; real[j] = t;
        t = imag[i]; imag[i] = imag[j]; imag[j] = t;
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const half = len >> 1; const tableStep = n / len;
      for (let i = 0; i < n; i += len) {
        for (let j = 0, k = 0; j < half; j++, k += tableStep) {
          const wr = this.cosTbl[k], wi = this.sinTbl[k];
          const ar = real[i+j+half], ai = imag[i+j+half];
          const tr = wr * ar - wi * ai;
          const ti = wr * ai + wi * ar;
          real[i+j+half] = real[i+j] - tr;
          imag[i+j+half] = imag[i+j] - ti;
          real[i+j] += tr; imag[i+j] += ti;
        }
      }
    }
  }
  ifft(real, imag) {
    const n = this.n;
    for (let i = 0; i < n; i++) imag[i] = -imag[i];
    this.fft(real, imag);
    const inv = 1 / n;
    for (let i = 0; i < n; i++) { real[i] *= inv; imag[i] = -imag[i] * inv; }
  }
}

class SpectralSlitScanProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    const FFT_SIZE = 2048, HOP = 512;
    this.fftSize = FFT_SIZE; this.hop = HOP;
    this.numBins = FFT_SIZE / 2 + 1;
    this.fft = new FFTHelper(FFT_SIZE);
    this.window = new Float32Array(FFT_SIZE);
    for (let i = 0; i < FFT_SIZE; i++)
      this.window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (FFT_SIZE - 1)));
    this.inRing = new Float32Array(FFT_SIZE);
    this.inWritePos = 0;
    this.outRing = new Float32Array(FFT_SIZE * 2);
    this.outReadPos = 0;
    this.realIn = new Float32Array(FFT_SIZE);
    this.imagIn = new Float32Array(FFT_SIZE);
    this.feedbackMag = new Float32Array(this.numBins);
    this.samplesUntilFrame = HOP;
    this.slitStartBin = Math.floor(this.numBins * 0.45);
    this.slitEndBin   = Math.floor(this.numBins * 0.55);
    this.scanSpeed = 1.0;
    this.dryWet = 1.0;
    this.preMag = new Float32Array(this.numBins);
    this.postMag = new Float32Array(this.numBins);
    this.framesSinceVizSend = 0;
    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.type === 'params') {
        this.slitStartBin = Math.max(1, Math.min(this.numBins - 2, Math.round(d.slitStartBin)));
        this.slitEndBin   = Math.max(this.slitStartBin + 1, Math.min(this.numBins - 1, Math.round(d.slitEndBin)));
        this.scanSpeed = d.scanSpeed;
        this.dryWet = d.dryWet;
      } else if (d.type === 'reset') {
        this.feedbackMag.fill(0); this.outRing.fill(0);
      }
    };
  }
  processFrame() {
    const N = this.fftSize, numBins = this.numBins;
    for (let i = 0; i < N; i++) {
      const idx = (this.inWritePos + i) % N;
      this.realIn[i] = this.inRing[idx] * this.window[i];
      this.imagIn[i] = 0;
    }
    this.fft.fft(this.realIn, this.imagIn);
    for (let k = 0; k < numBins; k++) {
      const re = this.realIn[k], im = this.imagIn[k];
      this.preMag[k] = Math.sqrt(re * re + im * im);
    }
    const slitS = this.slitStartBin, slitE = this.slitEndBin;
    const shift = Math.max(1, Math.round(this.scanSpeed));
    const outMag = this.postMag;
    for (let k = 0; k < slitS; k++) {
      const src = Math.min(slitS, k + shift);
      outMag[k] = this.feedbackMag[src];
    }
    for (let k = slitS; k <= slitE; k++) outMag[k] = this.preMag[k];
    for (let k = slitE + 1; k < numBins; k++) {
      const src = Math.max(slitE, k - shift);
      outMag[k] = this.feedbackMag[src];
    }
    this.feedbackMag.set(outMag);
    if (this.dryWet < 1.0) {
      const w = this.dryWet;
      for (let k = 0; k < numBins; k++) outMag[k] = this.preMag[k] * (1 - w) + outMag[k] * w;
    }
    for (let k = 0; k < numBins; k++) {
      const re = this.realIn[k], im = this.imagIn[k];
      const mag = Math.sqrt(re * re + im * im);
      if (mag > 1e-9) {
        const scale = outMag[k] / mag;
        this.realIn[k] = re * scale; this.imagIn[k] = im * scale;
      } else { this.realIn[k] = outMag[k]; this.imagIn[k] = 0; }
    }
    for (let k = 1; k < numBins - 1; k++) {
      this.realIn[N - k] = this.realIn[k];
      this.imagIn[N - k] = -this.imagIn[k];
    }
    this.fft.ifft(this.realIn, this.imagIn);
    const olaScale = 1.0 / 1.5;
    for (let i = 0; i < N; i++) {
      const pos = (this.outReadPos + i) % this.outRing.length;
      this.outRing[pos] += this.realIn[i] * this.window[i] * olaScale;
    }
    this.framesSinceVizSend++;
    if (this.framesSinceVizSend >= 4) {
      this.framesSinceVizSend = 0;
      this.port.postMessage({
        type: 'viz', pre: this.preMag.slice(), post: outMag.slice(),
        slitStart: slitS, slitEnd: slitE,
      });
    }
  }
  process(inputs, outputs) {
    const input = inputs[0]; const output = outputs[0];
    if (!output || !output.length) return true;
    const inCh = (input && input[0]) ? input[0] : null;
    const outCh = output[0]; const numSamples = outCh.length;
    for (let i = 0; i < numSamples; i++) {
      this.inRing[this.inWritePos] = inCh ? inCh[i] : 0;
      this.inWritePos = (this.inWritePos + 1) % this.fftSize;
      outCh[i] = this.outRing[this.outReadPos];
      this.outRing[this.outReadPos] = 0;
      this.outReadPos = (this.outReadPos + 1) % this.outRing.length;
      this.samplesUntilFrame--;
      if (this.samplesUntilFrame <= 0) {
        this.samplesUntilFrame = this.hop;
        this.processFrame();
      }
    }
    for (let ch = 1; ch < output.length; ch++) output[ch].set(outCh);
    return true;
  }
}
registerProcessor('spectral-slitscan', SpectralSlitScanProcessor);
`;
