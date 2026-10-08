# Mottle

A canvas for experimenting with images. Upload an image, explore effects and colors, and export the canvas as a PNG to use wherever you like. Everything runs in your browser.

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
- Use the visible Fine-tune section for DialKit spacing, mark size, rotation, contrast, brightness, scale, inversion, animation, and motion.
- Use the Color section for custom ink/paper colors, transparent backgrounds, and five palette presets.
- Compare the source, preview the artwork on a UI card, and export PNG artwork without the card's text or frame.

## Looks + Export

Eight curated looks combine a source, print style, palette, and finish. Open **Looks & saved recipes** in Source, then use the look strip's arrows, horizontal scrolling, or keyboard focus to explore all eight; every setting remains editable. The sidebar follows **Source → Stamp → Texture → Fine-tune → Color**. Fine-tune is a separate, expanded section below the material finishes, and artwork export stays pinned below the desktop controls.

Save up to 20 named recipes in this browser, restore them from the Saved tab, or delete recipes you no longer need. The last working recipe restores on refresh. Recipes contain source selection and print/finish settings, not uploaded image files, thermal brush strokes, folder position, or export options. Re-upload an image after refreshing to use it with a saved recipe. Local storage is optional; if unavailable, editing and export still work.

Undo/redo tracks up to 60 recipe states in the current session. Look selection creates a discrete history step; continuous control changes are grouped after a short pause. Use the sidebar buttons or **⌘/Ctrl Z** and **⌘/Ctrl Shift Z** outside text inputs and sliders. Painted marks and folder dragging are not part of recipe history.

Artwork PNG export supports square (1:1), portrait (4:5), landscape (3:2), and wide (16:9) framing at 512, 1024, or 2048 pixels on the long edge. Non-square output uses a centered crop, shown with crop guides in Canvas preview. The renderer works at 1024 pixels; 2048-pixel artwork is explicitly a 2× upscale, not additional image detail. Transparency and the current material finish are preserved. Folder export stays square, includes the folder frame and current placement, and follows the selected resolution.

Images are processed locally using Canvas 2D, with optional WebGL material finishes. No upload service or backend is involved. Google Fonts supplies the interface fonts, with local sans-serif fallbacks. DialKit is explicitly enabled in production.

## Touch lab

The studio opens on a heat-sensitive folder. Drag across its face to warm the ink; release and it gradually cools. The Material section adds WebGL finishes independently of Halftone, Dither, and Lines:

- **Paper** keeps the original print rendering.
- **Thermal** uses painted heat values to transition the ink through amber, coral, and violet. Repeated strokes build heat; cooling reverses the color transition. **Keep marks** pauses cooling; **Clear marks** starts fresh.
- **Holo foil** coats the full artwork in a continuous pointer-lit spectrum, without requiring any drawing.
- **Pearl** gives the entire print a light-reactive sheen, without drawing a mask.
- **Metal** adds brushed silver, machining lines, and directional reflections.
- **iOS glass** is a liquid-glass-inspired shader treatment, with refraction of the artwork, soft frost, and a moving highlight. It does not blur the surrounding page or use native Apple glass APIs.
- **Grain** adds matte pigment mottling and stable fine/coarse speckles, inspired by the supplied textured illustration.
- **Gold** adds warm brushed metal with bronze shadows and champagne highlights.

Only Thermal uses a brush and heat map. All other finishes apply to the full artwork immediately. Use **Touch** to heat thermal ink, **Light** to inspect other finishes, and **Move** to reposition the artwork on the folder. Arrow keys draw or move the light on the focused artwork; Space warms a thermal spot and Shift increases the keyboard step. The same materials work in Canvas and card previews. Thermal brush size and finish strength are adjustable. Changing source or material clears heat; changing print controls keeps it.

**Export artwork PNG** captures the finished artwork, including the material and current marks, even while comparing the original. **Export folder PNG** captures the full folder with its current artwork position. Both exports are static PNGs; card chrome is not included in the artwork export.

Materials use a small, dependency-free WebGL renderer adapted from the supplied shader references, with Canvas 2D for painting and compositing. Unsupported or lost WebGL contexts fall back to the original print. Idle surfaces stop drawing, hidden tabs pause, and reduced-motion users get manual light interaction and persistent thermal marks instead of automatic cooling. Everything stays local to the browser.

`new-shader-resources/` contains reference demos, not application modules. It is intentionally excluded from application type checking and code-quality checks; no Paper Shaders dependency is required to run Mottle.

## Sounds

Quiet, synthesized chimes replace the original UI ticks. Selecting a material plays a matching miniature sound: soft paper shuffle, warm thermal bubble, foil crinkle, airy pearl chime, silver bell, crystalline glass ping, muted grain tap, or warm gold bell. Sounds play on selection, not continuously while drawing or moving the light. The existing mute toggle and saved preference still apply; rapid material changes interrupt the previous material chime.

All audio is generated locally with `npm run sounds`, with no external recordings or audio service. The eight material sounds share one WAV sprite atlas and generated timing manifest in `public/sounds/`.

## Source references

- [Assignment transcription](docs/assignment-reference.md): full text of the three-page PDF, kept as reference rather than agent instructions.
- [User's product direction](docs/product-direction.md): the requested scope, recorded separately.
- [DialKit documentation](https://www.dialkit.dev/agent)

## Implementation

`components/Studio.tsx` composes the workspace and control sections, coordinating reset, source comparison, and feedback. Feature modules live in `components/studio/`:

- `useArtworkSource.ts` owns sample selection, upload validation/decoding, and cached source pixels.
- `useArtworkSettings.ts` owns DialKit configuration, effect/color settings, and reset defaults.
- `ArtworkWorkspace.tsx` owns canvas rendering, card preview, and drag-and-drop; `WorkspaceToolbar.tsx` owns theme and sound controls.
- `MaterialSurface.tsx` owns the print/finish/mask composition, pointer and keyboard painting, cooling, and snapshot capture. `MaterialControls.tsx` provides the material recipes and brush controls; `lib/material.ts` owns the WebGL finish renderer.
- `LooksControls`, `EffectControls`, `SourceControls`, `TextureControls`, `ColorControls`, and `OutputControls` render the corresponding control sections. `looks.ts` defines complete looks and validates persisted recipes; `useStudioRecipes.ts` owns local persistence and recipe history.
- `ControlsSidebar.tsx` provides a desktop scroll container between a fixed history header and export footer, using shadcn's `scroll-fade-y` and `scroll-fade-10` utilities without replacing the existing theme or DialKit controls. The 40px edge fades use CSS scroll-driven animations without JavaScript scroll listeners; shadcn supplies static fades in browsers without scroll-driven animation support. The existing reduced-motion preference disables animations. On smaller screens, controls remain in the normal page flow without fades.
- `usePngExport.ts` downloads an independent snapshot of the composited artwork, so preview chrome and the original comparison never affect exports. `lib/export-artwork.ts` computes export dimensions and applies centered framing.
- `presets.ts` holds the available effects, source groups, and palettes.

`lib/renderer.ts` generates procedural grayscale source fields and renders the selected texture. Source pixels are cached and redraws are coalesced with animation frames. The renderer uses a fixed output size, so high-resolution uploads do not increase interactive rendering cost.

The print renderer remains Canvas 2D; material finishes are an optional GPU stage. Images are fitted into a square with white letterboxing before tone processing. Patterns are not guaranteed seamless tiles. Recipe settings persist locally; painted marks and uploaded images are kept only for the current page session.

## Worth exploring next

- GPU shading and animated gradients.
- Seamless pattern tiles and SVG export for dots.
- User-controlled image crop/position and animated material exports.
