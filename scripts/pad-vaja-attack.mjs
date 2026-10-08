// Repack the recorded attack strip without redrawing it. Frame 8's staff tip
// crosses the source cell boundary, so those pixels belong to frame 8, not 9.
// The end of cell 3 also contains a stray crystal pixel from the next pose.
import sharp from 'sharp';

const source = 'src/assets/works/vaja/strip-attack1.webp';
const output = 'src/assets/works/vaja/strip-attack1-padded.webp';
const { width, height } = await sharp(source).metadata();
const count = 10;
const cell = 540;
const inset = 20;
const spill = 70;
const edge = (i) => Math.round(i * width / count);
const frames = [];

for (let i = 0; i < count; i++) {
  const left = edge(i) + (i === 8 ? spill : 0);
  const right = edge(i + 1) + (i === 7 ? spill : 0) - (i === 2 ? 25 : 0);
  const pixels = await sharp(source).extract({ left, top: 0, width: right - left, height }).png().toBuffer();
  frames.push({ input: pixels, left: i * cell + inset + (i === 8 ? spill : 0), top: 0 });
}

await sharp({ create: { width: count * cell, height, channels: 4, background: '#00000000' } })
  .composite(frames)
  .webp({ quality: 95, alphaQuality: 100 })
  .toFile(output);
