/*
 * Presentation-specific adaptation of the Fourier visualizations from
 * Jez Swanson's "Introduction to Fourier Transforms".
 * Original project: https://github.com/Jezzamonn/fourier
 * Original code is MIT licensed; see LICENSE.
 *
 * This file intentionally has no external dependencies so it can run
 * directly on GitHub Pages without npm or a build step.
 */
(() => {
  'use strict';

  const palette = {
    blue: '#4657d7',
    cyan: '#57a7cc'
  };

  const TAU = Math.PI * 2;
  const SAMPLE_COUNT = 128;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function getWave(fn, n = SAMPLE_COUNT) {
    return Array.from({ length: n }, (_, i) => fn(i / n));
  }

  function squareWave(t) { return t < 0.5 ? -1 : 1; }

  // Small dependency-free real DFT. With 128 samples this is easily fast enough,
  // and it lets the GitHub Pages package stay completely self-contained.
  function getRealFourierData(points) {
    const n = points.length;
    const result = [];
    for (let k = 0; k < n / 2; k++) {
      let re = 0;
      let im = 0;
      for (let j = 0; j < n; j++) {
        const angle = -TAU * k * j / n;
        re += points[j] * Math.cos(angle);
        im += points[j] * Math.sin(angle);
      }
      result.push({
        freq: k,
        amplitude: 2 * Math.hypot(re, im) / n,
        phase: Math.atan2(im, re)
      });
    }
    return result;
  }

  function normalizeZeroMean(path) {
    const mean = path.reduce((a, b) => a + b, 0) / path.length;
    return path.map(v => v - mean);
  }

  function drawWave(ctx, wave, yPosition, yMultiple, phaseShift) {
    const width = ctx.canvas.width;
    const n = wave.length;
    const offset = ((phaseShift % 1) + 1) % 1;
    const startSample = Math.floor(offset * n);

    ctx.beginPath();
    for (let px = 0; px <= width; px++) {
      const samplePosition = (px / width) * n + startSample;
      const i0 = Math.floor(samplePosition) % n;
      const i1 = (i0 + 1) % n;
      const t = samplePosition - Math.floor(samplePosition);
      const value = lerp(wave[i0], wave[i1], t);
      const y = yPosition + yMultiple * value;
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
  }

  class WaveSplitDemo {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.fadeFrequencies = options.fadeFrequencies ?? true;
      this.fourierAmount = options.fourierAmount ?? 1;
      this.splitAmount = options.splitAmount ?? 1;
      this.phase = 0;
      this.partialWave = [];
      this.fourierData = [];
      this.wavePoints = [];
      this.maxComponents = 1;
    }

    setPath(path) {
      this.wavePoints = normalizeZeroMean(path);
      this.fourierData = getRealFourierData(this.wavePoints)
        .filter(f => f.amplitude > 0.001)
        .sort((a, b) => b.amplitude - a.amplitude);

      this.waveTop = Math.min(...this.wavePoints);
      this.waveBottom = Math.max(...this.wavePoints);
      this.totalHeight = this.waveBottom - this.waveTop;
      this.fourierData.forEach(f => { this.totalHeight += 2 * f.amplitude; });
      this.maxComponents = Math.min(50, this.fourierData.length);
    }

    setFourierAmount(value) {
      this.fourierAmount = Math.max(0, Math.min(1, Number(value)));
    }

    componentCount() {
      return Math.max(1, Math.round(lerp(1, this.maxComponents, this.fourierAmount)));
    }

    update(dt) {
      this.phase = (this.phase + dt / 7) % 1;
    }

    render() {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (!this.wavePoints.length) return;

      const top = 0.1 * h;
      const bottom = 0.9 * h;
      const sizeMultiple = (bottom - top) / this.totalHeight;
      const spacingMultiplier = 0.8;
      const numBabies = this.maxComponents;
      const renderedBabies = this.componentCount();
      const splitAmt = this.splitAmount;
      let curWavePos = this.waveBottom - this.waveTop;
      this.partialWave = new Array(this.wavePoints.length).fill(0);

      ctx.lineWidth = 2;
      ctx.strokeStyle = palette.cyan;

      for (let babe = 0; babe < renderedBabies; babe++) {
        const waveData = this.fourierData[babe];
        curWavePos += waveData.amplitude;
        const wavePosition = lerp(-this.waveTop, curWavePos, splitAmt);
        const wave = new Array(this.wavePoints.length);

        for (let i = 0; i < this.wavePoints.length; i++) {
          const iAmt = i / this.wavePoints.length;
          const sineAmt = waveData.amplitude * Math.cos(TAU * waveData.freq * iAmt + waveData.phase);
          wave[i] = lerp(this.wavePoints[i], sineAmt, splitAmt);
          this.partialWave[i] += wave[i];
        }

        const babeAmt = numBabies > 1 ? babe / (numBabies - 1) : 0;
        ctx.globalAlpha = this.fadeFrequencies ? 1 - babeAmt : 1;
        drawWave(ctx, wave, top + sizeMultiple * wavePosition, sizeMultiple * spacingMultiplier, this.phase);
        curWavePos += waveData.amplitude;
      }

      ctx.globalAlpha = 1;
      if (this.fourierAmount >= 0.9999) this.partialWave = this.wavePoints.slice();

      ctx.strokeStyle = palette.blue;
      ctx.lineWidth = 2;
      drawWave(ctx, this.partialWave, top + sizeMultiple * (-this.waveTop), sizeMultiple * spacingMultiplier, this.phase);
    }
  }

  function normalizeWave(wave) {
    const min = Math.min(...wave);
    const max = Math.max(...wave);
    if (max === min) return wave.map(() => 0);
    return wave.map(v => lerp(-1, 1, (v - min) / (max - min)));
  }

  let audioContext = null;
  function getAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioContext) audioContext = new AudioContext();
    return audioContext;
  }

  async function playSoundWave(wave) {
    if (!wave || !wave.length) return;
    const ac = getAudioContext();
    if (!ac) {
      alert('Your browser does not support the Web Audio API.');
      return;
    }
    if (ac.state === 'suspended') await ac.resume();

    const sampleRate = ac.sampleRate;
    const duration = 1.6;
    const frames = Math.floor(sampleRate * duration);
    const buffer = ac.createBuffer(1, frames, sampleRate);
    const channel = buffer.getChannelData(0);
    const normalized = normalizeWave(wave);
    const baseFrequency = 220;

    for (let i = 0; i < frames; i++) {
      const cycles = baseFrequency * (i / sampleRate);
      const pos = (cycles % 1) * normalized.length;
      const i0 = Math.floor(pos) % normalized.length;
      const i1 = (i0 + 1) % normalized.length;
      channel[i] = lerp(normalized[i0], normalized[i1], pos - Math.floor(pos));
    }

    const source = ac.createBufferSource();
    source.buffer = buffer;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.55, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
    source.connect(gain);
    gain.connect(ac.destination);
    source.start();
  }

  function applyPresentationMode() {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get('demo');
    const clean = params.get('clean');
    if (clean === '1' || clean === 'true') document.body.classList.add('clean');
    if (demo === 'combo') {
      document.body.classList.add('single-demo', 'hide-square');
    } else if (demo === 'square') {
      document.body.classList.add('single-demo', 'hide-combo');
    }
  }

  function start() {
    applyPresentationMode();

    const comboCanvas = document.getElementById('combo-sine-wave-split');
    const squareCanvas = document.getElementById('square-wave-build-up');
    const slider = document.getElementById('square-wave-build-up-slider');
    const button = document.getElementById('square-wave-button');
    const count = document.getElementById('component-count');

    const demos = [];

    if (comboCanvas) {
      const combo = new WaveSplitDemo(comboCanvas, {
        fadeFrequencies: false,
        fourierAmount: 1,
        splitAmount: 1
      });
      combo.setPath(getWave(t => Math.sin(TAU * t) + 0.5 * Math.sin(3 * TAU * t)));
      demos.push(combo);
    }

    let square = null;
    if (squareCanvas) {
      square = new WaveSplitDemo(squareCanvas, {
        fadeFrequencies: true,
        fourierAmount: 0,
        splitAmount: 1
      });
      square.setPath(getWave(squareWave));
      demos.push(square);
    }

    function syncSlider() {
      if (!square || !slider) return;
      square.setFourierAmount(slider.value);
      if (count) count.value = String(square.componentCount());
    }

    if (slider) {
      slider.addEventListener('input', syncSlider);
      syncSlider();
    }

    if (button && square) {
      button.addEventListener('click', () => playSoundWave(square.partialWave));
    }

    let previous = performance.now();
    function frame(now) {
      const dt = Math.min(0.1, (now - previous) / 1000);
      previous = now;
      for (const demo of demos) {
        demo.update(dt);
        demo.render();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
