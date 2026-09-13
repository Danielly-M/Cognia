/**
 * Gera os efeitos sonoros do Cognia como WAV PCM 16-bit mono.
 * Rode: node scripts/gen-sounds.js
 *
 * Síntese deliberadamente suave: senoides puras, ataque rápido curto,
 * decaimento exponencial e volume baixo — nada de "buzzer" de erro.
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const AMPLITUDE = 0.6; // 0..1 do full-scale; volume final é ajustado no app

function writeWav(filePath, samples) {
  const n = samples.length;
  const buffer = Buffer.alloc(44 + n * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + n * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk
  buffer.writeUInt16LE(1, 20); // formato PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits
  buffer.write('data', 36);
  buffer.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

/** Uma nota senoidal com ataque curto e decaimento exponencial suave. */
function tone(freq, seconds, { decay = 6, gain = 1 } = {}) {
  const n = Math.floor(SAMPLE_RATE * seconds);
  const out = new Array(n);
  const attackN = Math.floor(SAMPLE_RATE * 0.012);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const attack = i < attackN ? i / attackN : 1;
    const env = attack * Math.exp(-decay * t);
    out[i] = Math.sin(2 * Math.PI * freq * t) * env * gain;
  }
  return out;
}

/** Concatena trechos com uma pequena pausa entre eles. */
function sequence(parts, gapSeconds = 0.02) {
  const gap = new Array(Math.floor(SAMPLE_RATE * gapSeconds)).fill(0);
  const out = [];
  parts.forEach((part, idx) => {
    out.push(...part);
    if (idx < parts.length - 1) out.push(...gap);
  });
  return out;
}

// Notas (Hz)
const E5 = 659.25;
const A5 = 880.0;
const C5 = 523.25;
const G5 = 783.99;
const C6 = 1046.5;
const D3 = 146.83;
const F3 = 174.61;

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

// Acerto: duas notas ascendentes e claras (E5 → A5) — reforço positivo.
writeWav(
  path.join(outDir, 'acerto.wav'),
  sequence([tone(E5, 0.16), tone(A5, 0.22)]).map((s) => s * AMPLITUDE),
);

// "Tente de novo": duas notas graves e macias (D3 → F3), sem aspereza.
// NÃO é um som de "erro": é neutro e acolhedor.
writeWav(
  path.join(outDir, 'erro.wav'),
  sequence([tone(D3, 0.18, { decay: 5, gain: 0.55 }), tone(F3, 0.2, { decay: 5, gain: 0.55 })]).map(
    (s) => s * AMPLITUDE,
  ),
);

// Vitória: arpejo C5-E5-G5-C6, breve e alegre sem ser estridente.
writeWav(
  path.join(outDir, 'vitoria.wav'),
  sequence([tone(C5, 0.16), tone(E5, 0.16), tone(G5, 0.16), tone(C6, 0.3)]).map(
    (s) => s * AMPLITUDE,
  ),
);

console.log('Sons gerados em', outDir);
