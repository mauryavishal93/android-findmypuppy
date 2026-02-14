import fs from 'fs';
const html = fs.readFileSync('puppy-designs-preview.html', 'utf8');
const re = /<img src="(data:image\/svg\+xml;base64,[^"]+)" class="puppy-image" alt="([^"]+)"/g;
const items = [];
let m;
while ((m = re.exec(html)) !== null) items.push({ src: m[1], alt: m[2] });

const lines = ['export const PUPPY_IMAGES = ['];
items.forEach((x, i) => {
  lines.push('  // ' + x.alt);
  const escaped = x.src.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  lines.push('  `' + escaped + '`,');
});
lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1); // remove trailing comma
lines.push('];');

fs.writeFileSync('constants/puppyImages.ts', lines.join('\n'));
console.log('Written', items.length, 'images to constants/puppyImages.ts');
