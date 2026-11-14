# Immersive portfolio

A scroll-driven 3D portfolio rendered at `/` and aliased at `/immersive`. The original CMS homepage lives at `/classic`.

## Structure

- `ImmersivePortfolio.tsx` — fixed canvas, scrolling HTML layer, nav, project modal.
- `PortfolioScene.tsx` — R3F canvas, lighting, fog, stars, grid, and post-processing.
- `CameraRig.tsx` — weighted mouse parallax layered over the scroll camera target.
- `ScrollDirector.tsx` — GSAP `ScrollTrigger` timeline (`scrub: 1.5`) for five camera shots.
- `NeonCard.tsx` — interactive project cards with Drei `Edges`, `Text`, hover glow, and click.
- `DeveloperDesk.tsx` — procedural workspace fallback.
- `DracoModel.tsx` — self-hosted Draco loader. Drop a model at
  `public/models/developer-desk.glb` and replace `<DeveloperDesk />` with
  `<DracoModel />` inside `PortfolioScene.tsx`.
- `CanvasLoader.tsx` — Drei `useProgress` percentage overlay.
- `PostFX.tsx` — Bloom, desktop Depth of Field, and Vignette.

The Draco decoder is self-hosted in `public/draco/`.
