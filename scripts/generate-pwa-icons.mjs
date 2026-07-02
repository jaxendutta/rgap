#!/usr/bin/env node
// Generates the PWA manifest icons (192, 512, and a maskable 512) from
// public/logo.png. Source art has no built-in padding, so the maskable
// variant is scaled down and composited onto an opaque canvas to stay
// inside Android's adaptive-icon safe-zone circle -- a naive resize would
// get clipped by the mask.
//
// One-shot, run manually after the source logo changes:
//   npm run generate:pwa-icons

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const sourceLogo = path.join(publicDir, "logo.png");
const iconsDir = path.join(publicDir, "icons");

const THEME_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };
const MASKABLE_SAFE_ZONE_SCALE = 0.62;

fs.mkdirSync(iconsDir, { recursive: true });

async function generateStandardIcon(size) {
    const outPath = path.join(iconsDir, `icon-${size}.png`);
    await sharp(sourceLogo)
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outPath);
    console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
}

async function generateMaskableIcon(size) {
    const outPath = path.join(iconsDir, `icon-${size}-maskable.png`);
    const artworkSize = Math.round(size * MASKABLE_SAFE_ZONE_SCALE);

    const artwork = await sharp(sourceLogo)
        .resize(artworkSize, artworkSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

    await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: THEME_BACKGROUND,
        },
    })
        .composite([{ input: artwork, gravity: "center" }])
        .png()
        .toFile(outPath);
    console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
}

await generateStandardIcon(192);
await generateStandardIcon(512);
await generateMaskableIcon(512);
