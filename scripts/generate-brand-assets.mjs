/**
 * Generates the app's brand raster assets from one vector mark (a beehive on a calendar:
 * unity and industry). Re-run after changing the design:
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Outputs (committed to the repo):
 *   public/icons/icon-192.png, icon-512.png, maskable-512.png   web app manifest icons
 *   src/app/apple-icon.png                                      iOS "Add to Home Screen" icon
 *   src/app/favicon.ico                                         browser tab icon (16/32/48)
 *   src/app/opengraph-image.png (+ .alt.txt)                    link-preview image (1200x630)
 *
 * Requires `sharp`, which Next.js installs alongside itself.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NAVY = '#0B2545';
const GOLD = '#D4AF37';
const CREAM = '#F8F4E8';

/** Calendar page with a beehive (skep) in its body, drawn on a 512x512 canvas */
function markGroup() {
  const dome = 'M168 404C168 318 196 216 256 216C316 216 344 318 344 404Z';
  return `
    <rect x="96" y="112" width="320" height="312" rx="38" fill="${CREAM}"/>
    <path d="M96 150a38 38 0 0 1 38-38h244a38 38 0 0 1 38 38v46H96z" fill="${GOLD}"/>
    <rect x="164" y="82" width="30" height="62" rx="15" fill="${NAVY}" stroke="${CREAM}" stroke-width="7"/>
    <rect x="318" y="82" width="30" height="62" rx="15" fill="${NAVY}" stroke="${CREAM}" stroke-width="7"/>
    <defs><clipPath id="dome"><path d="${dome}"/></clipPath></defs>
    <path d="${dome}" fill="${NAVY}"/>
    <g clip-path="url(#dome)" stroke="${CREAM}" stroke-width="7">
      <path d="M150 262H362"/><path d="M150 308H362"/><path d="M150 354H362"/>
    </g>
    <circle cx="256" cy="212" r="9" fill="${NAVY}"/>
    <path d="M232 404v-24a24 24 0 0 1 48 0v24z" fill="${GOLD}"/>`;
}

/** Full-bleed navy tile with the mark scaled about its center (maskable icons need a smaller scale) */
function tileSvg(size, scale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${NAVY}"/>
    <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${markGroup()}</g>
  </svg>`;
}

// Opaque output: iOS paints any transparent icon pixels black
const png = (svg) => sharp(Buffer.from(svg)).removeAlpha().png({ compressionLevel: 9 });
// Frames inside favicon.ico must be RGBA: Next's (Turbopack's) ICO decoder rejects RGB PNGs
const rgbaPng = (svg) => sharp(Buffer.from(svg)).ensureAlpha().png({ compressionLevel: 9 });

/** Packs PNG buffers into an .ico container (PNG-in-ICO is supported by all current browsers) */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function writeOut(relPath, data) {
  const target = join(ROOT, relPath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, data);
  console.log('wrote', relPath, `(${Math.round(data.length / 1024)} KB)`);
}

async function openGraphImage() {
  const W = 1200;
  const H = 630;
  const markSize = 330;
  const mark = await png(tileSvg(markSize, 1.08)).toBuffer();
  const rounded = await sharp(mark)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${markSize}" height="${markSize}"><rect width="${markSize}" height="${markSize}" rx="64" fill="#fff"/></svg>`,
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  const font = "font-family=\"'Segoe UI', 'Helvetica Neue', Arial, sans-serif\"";
  const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="18" fill="none" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="2"/>
    <text x="470" y="262" ${font} font-size="84" font-weight="700" fill="#FFFFFF">DC Prince Hall</text>
    <text x="470" y="352" ${font} font-size="84" font-weight="700" fill="#FFFFFF">Unified Calendar</text>
    <text x="470" y="414" ${font} font-size="32" font-weight="600" fill="${GOLD}">Masonic Temple &amp; Jurisdictional Events</text>
    <text x="470" y="468" ${font} font-size="24" fill="#CBD5E1">MWPHGLDC • Georgiana Thomas Grand Chapter O.E.S.</text>
    <text x="470" y="502" ${font} font-size="24" fill="#CBD5E1">PHFAMOESCEF • CEF THC</text>
    <text x="470" y="548" ${font} font-size="22" font-weight="600" fill="${GOLD}">1000 U Street NW • Washington, D.C.</text>
    <g>
      <rect x="0" y="${H - 14}" width="240" height="14" fill="#2980B9"/>
      <rect x="240" y="${H - 14}" width="240" height="14" fill="#F39C12"/>
      <rect x="480" y="${H - 14}" width="240" height="14" fill="#FFFFFF"/>
      <rect x="720" y="${H - 14}" width="240" height="14" fill="#27AE60"/>
      <rect x="960" y="${H - 14}" width="240" height="14" fill="#C0392B"/>
    </g>
  </svg>`;

  return sharp({ create: { width: W, height: H, channels: 3, background: NAVY } })
    .composite([
      { input: rounded, left: 90, top: Math.round((H - markSize) / 2) },
      { input: Buffer.from(text), left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  // Standard ("any") icons: mark fills most of the tile
  await writeOut('public/icons/icon-192.png', await png(tileSvg(192, 1.1)).toBuffer());
  await writeOut('public/icons/icon-512.png', await png(tileSvg(512, 1.1)).toBuffer());
  // Maskable: keep the mark inside the central 80% safe zone so any launcher mask is fine
  await writeOut('public/icons/maskable-512.png', await png(tileSvg(512, 0.86)).toBuffer());
  // iOS home screen icon (iOS applies its own rounded-corner mask)
  await writeOut('src/app/apple-icon.png', await png(tileSvg(180, 1.1)).toBuffer());

  // Favicon: a larger mark so it survives at tab size
  const favicons = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, data: await rgbaPng(tileSvg(size, 1.28)).toBuffer() })),
  );
  await writeOut('src/app/favicon.ico', buildIco(favicons));

  await writeOut('src/app/opengraph-image.png', await openGraphImage());
  await writeOut(
    'src/app/opengraph-image.alt.txt',
    Buffer.from('DC Prince Hall Unified Calendar: a beehive on a calendar, with the Prince Hall Masonic Temple and jurisdictional events schedule'),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
