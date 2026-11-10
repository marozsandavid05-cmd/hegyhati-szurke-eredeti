/* Egyszeri bekötés: a tools/ord-szovegek.js "on" szövegeit a kézi oldalakban
   <!-- @ord kulcs --> ... <!-- @/ord --> jelölővel veszi körül.
   Ha egy szöveg már jelölve van, kihagyja. Ha nem találja, hibát ír ki.
   Futtatás a projekt gyökeréből: node tools/ord-jeloles.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = { window: {}, location: { protocol: 'file:' }, Intl };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/config.js'), 'utf8'), ctx);
const texts = require('./ord-szovegek.js')(ctx.window.HF.SITE);

let done = 0, skipped = 0, missing = [];
for (const t of texts) {
  const file = path.join(ROOT, t.file);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes(`<!-- @ord ${t.key} -->`)) { skipped++; continue; }
  /* a fájlokban vegyes sorvég van (CRLF és LF), ezért a sortörés bármelyikre illeszkedik */
  const re = new RegExp(t.on.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\n/g, '\\r?\\n'), 'g');
  const hits = s.match(re) || [];
  if (hits.length === 0) { missing.push(t.file + ' :: ' + t.key); continue; }
  if (hits.length > 1) { missing.push(t.file + ' :: ' + t.key + ' (többször szerepel)'); continue; }
  s = s.replace(re, m => `<!-- @ord ${t.key} -->${m}<!-- @/ord -->`);
  fs.writeFileSync(file, s, 'utf8');
  done++;
}
console.log(`jelölve: ${done}, már jelölt: ${skipped}, nem található: ${missing.length}`);
missing.forEach(m => console.log('  HIÁNYZIK ' + m));
process.exitCode = missing.length ? 1 : 0;
