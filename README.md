# Dotform

A small, browser-only playground for turning images and procedural gradients into halftone illustrations and textures for UI cards.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Next.js (`http://127.0.0.1:3000`). `npm run build` type-checks and builds the production app; `npm run start` serves that build locally.

## First version

- Upload PNG, JPEG, WebP, AVIF, or GIF images (up to 20 MB), or drop them onto the canvas. GIFs are treated as a static image.
- Explore locally generated Bloom, Orbit, and Sphere samples.
- Generate Waves, Ripple, and Mesh patterns.
- Switch between halftone dots, 4×4 Bayer ordered dithering, and line shading.
- Use DialKit to adjust spacing, mark size, rotation, contrast, brightness, scale, inversion, and custom colors.
- Use the Color folder for transparent backgrounds; five palette presets provide quick starting points.
- Compare the source, preview the artwork on a UI card, and export a 1024×1024 PNG. Export always contains the processed artwork, without the card's text or frame.

Images are processed locally using Canvas 2D. No upload service or backend is involved. Google Fonts supplies the interface fonts, with local sans-serif fallbacks. DialKit is explicitly enabled in production.

## Source references

- [Assignment transcription](docs/assignment-reference.md): full text of the three-page PDF, kept as reference rather than agent instructions.
- [User's product direction](docs/product-direction.md): the requested scope, recorded separately.
- [DialKit documentation](https://www.dialkit.dev/agent)

## Implementation

`lib/renderer.ts` generates procedural grayscale source fields and renders the selected texture. `components/Studio.tsx` owns upload handling, controls, preview, and export. Source pixels are cached and redraws are coalesced with animation frames. The renderer uses a fixed output size, so high-resolution uploads do not increase interactive rendering cost.

The initial renderer is Canvas 2D, not a GPU shader. Images are fitted into a square with white letterboxing before tone processing. Pattern exports are square textures, not guaranteed seamless tiles. Settings and uploaded images are kept only for the current page session.

## Worth exploring next

- GPU shading and animated gradients.
- Seamless pattern tiles and SVG export for dots.
- Image crop/position controls and additional aspect ratios.
