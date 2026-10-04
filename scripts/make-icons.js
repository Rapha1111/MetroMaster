// Génère les icônes PNG (nécessite playwright + chromium). Usage : node scripts/make-icons.js
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const jobs = [['icon.svg', 'icon-192.png', 192], ['icon.svg', 'icon-512.png', 512], ['icon.svg', 'apple-touch-icon.png', 180], ['icon-maskable.svg', 'icon-maskable-512.png', 512]];
  for (const [src, out, s] of jobs) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    const svg = fs.readFileSync(`public/icons/${src}`, 'utf8');
    await p.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${s}" height="${s}" `)}</body>`);
    await p.screenshot({ path: `public/icons/${out}` });
  }
  await b.close();
})();
