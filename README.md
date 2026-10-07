# Dotform

A small, browser-only playground for turning images and procedural gradients into halftone illustrations and textures for UI cards.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Next.js (`http://127.0.0.1:3000`). `npm run build` type-checks and builds the production app; `npm run start` serves that build locally.

## Code quality

- `npm run format` formats supported source files with Biome.
- `npm run lint` runs Biome and the existing Next.js ESLint checks.
- `npm run check` checks formatting, imports, and lint without changing files.
- `npm run check:fix` applies safe Biome fixes, then runs ESLint.

Biome uses tabs, recommended React/Next.js rules, and Tailwind CSS v4 parsing. Generated files and the npm lockfile are excluded; `.gitignore` is respected. ESLint remains enabled for Next.js and React checks that Biome does not yet cover.

## First version

- Upload PNG, JPEG, WebP, AVIF, or GIF images (up to 20 MB), or drop them onto the canvas. GIFs are treated as a static image.
- Explore locally generated Bloom, Orbit, and Sphere samples.
- Generate Waves, Ripple, and Mesh patterns.
- Switch between halftone dots, 4×4 Bayer ordered dithering, and line shading.
- Use DialKit to adjust spacing, mark size, rotation, contrast, brightness, scale, inversion, and custom colors, plus toggle the animated ripple and set its strength with the Animate and Motion controls.
- Use the Color folder for transparent backgrounds; five palette presets provide quick starting points.
- Compare the source, preview the artwork on a UI card, and export a 1024×1024 PNG. Export always contains the processed artwork, without the card's text or frame.

Images are processed locally using Canvas 2D. No upload service or backend is involved. Google Fonts supplies the interface fonts, with local sans-serif fallbacks. DialKit is explicitly enabled in production.

## Source references

- [Assignment transcription](docs/assignment-reference.md): full text of the three-page PDF, kept as reference rather than agent instructions.
- [User's product direction](docs/product-direction.md): the requested scope, recorded separately.
- [DialKit documentation](https://www.dialkit.dev/agent)

## Implementation

`components/Studio.tsx` composes the workspace and control sections, coordinating reset, source comparison, and feedback. Feature modules live in `components/studio/`:

- `useArtworkSource.ts` owns sample selection, upload validation/decoding, and cached source pixels.
- `useArtworkSettings.ts` owns DialKit configuration, effect/color settings, and reset defaults.
- `ArtworkWorkspace.tsx` owns canvas rendering, card preview, and drag-and-drop; `WorkspaceToolbar.tsx` owns theme and sound controls.
- `EffectControls`, `SourceControls`, `TextureControls`, and `OutputControls` render the corresponding control sections.
- `usePngExport.ts` renders an independent canvas for PNG downloads, so preview chrome and the original comparison never affect exports.
- `presets.ts` holds the available effects, source groups, and palettes.

`lib/renderer.ts` generates procedural grayscale source fields and renders the selected texture. Source pixels are cached and redraws are coalesced with animation frames. The renderer uses a fixed output size, so high-resolution uploads do not increase interactive rendering cost.

The initial renderer is Canvas 2D, not a GPU shader. Images are fitted into a square with white letterboxing before tone processing. Pattern exports are square textures, not guaranteed seamless tiles. Settings and uploaded images are kept only for the current page session.

## Worth exploring next

- GPU shading and animated gradients.
- Seamless pattern tiles and SVG export for dots.
- Image crop/position controls and additional aspect ratios.
