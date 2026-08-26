# Willowmere Animal Center

A browser-based 2D animal adoption center management game built with JavaScript, Phaser 3, and Vite.

## Milestones

- Milestone 1 established the movement and map foundation: title screen, smooth keyboard movement, four-direction animation, foot collision, two connected 32×32-grid maps, camera following, fade transitions, and an optional debug overlay.
- Milestone 2 adds the first data-driven animal: Maple the dog, species and individual records, smooth enclosure-bound wandering, and a nearby animal information card. Care actions, needs decay, intake, adoption, and economy are intentionally deferred.
- Milestone 3 adds a persistent configurable game clock, changing animal needs, hunger- and energy-driven behavior, a data-driven food definition, and one complete physical feeding interaction using Maple's empty/filled bowl.

## Local development

```bash
npm install
npm run dev
```

Open the local address printed by Vite. Use WASD or the arrow keys to move, `E` to meet a nearby animal or fill an empty bowl, and `D` to toggle debug mode.

For development testing, append `?timeScale=0.1` to slow game time or `?timeScale=4` to accelerate it. Normal play uses the configured scale of `1`.

## Checks

```bash
npm test
npm run build
```

GitHub Actions deploys `dist` to GitHub Pages after each push to `main`.
