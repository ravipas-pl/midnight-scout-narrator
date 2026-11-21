import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let html = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'css/style.css'), 'utf8');
html = html.replace('<link rel="stylesheet" href="css/style.css">', () => `<style>\n${css}\n</style>`);
for (const name of ['settings','game-engine','audio-engine','speech-engine','app']) {
  const js = await readFile(resolve(root, `js/${name}.js`), 'utf8');
  // Defer behavior is preserved by moving the scripts after the application DOM.
  html = html.replace(`  <script defer src="js/${name}.js"></script>\n`, '');
  html = html.replace('</body>', () => `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>\n</body>`);
}
// Inline recorded sounds so the release stays a single file with no external assets.
for (const name of ['fart','plop','flush']) {
  const data = (await readFile(resolve(root, `sounds/${name}.mp3`))).toString('base64');
  const path = `'sounds/${name}.mp3'`;
  if (!html.includes(path)) throw new Error(`Build: ${path} not referenced`);
  html = html.replaceAll(path, () => `'data:audio/mpeg;base64,${data}'`);
}
await mkdir(resolve(root,'dist'), { recursive:true });
await writeFile(resolve(root,'dist/index.html'), html);
console.log('Built dist/index.html — self-contained, no external assets.');
