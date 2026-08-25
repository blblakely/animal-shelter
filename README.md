# Willowmere Animal Center

A browser-based 2D animal adoption center management game built with JavaScript, Phaser 3, and Vite.

## Milestones

- Milestone 1 established the movement and map foundation: title screen, smooth keyboard movement, four-direction animation, foot collision, two connected 32×32-grid maps, camera following, fade transitions, and an optional debug overlay.
- Milestone 2 adds the first data-driven animal: Maple the dog, species and individual records, smooth enclosure-bound wandering, and a nearby animal information card. Care actions, needs decay, intake, adoption, and economy are intentionally deferred.

## Local development

```bash
npm install
npm run dev
```

Open the local address printed by Vite. Use WASD or the arrow keys to move, `E` to meet a nearby animal, and `D` to toggle debug mode.

## Checks

```bash
npm test
npm run build
```

GitHub Actions deploys `dist` to GitHub Pages after each push to `main`.
