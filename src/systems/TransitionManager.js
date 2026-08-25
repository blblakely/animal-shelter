import { GRID_SIZE } from '../config/constants.js';

export class TransitionManager {
  constructor(scene, exits) {
    this.scene = scene;
    this.transitioning = false;
    this.zones = exits.map((exit) => {
      const zone = scene.add.zone((exit.tileX + exit.width / 2) * GRID_SIZE, (exit.tileY + exit.height / 2) * GRID_SIZE, exit.width * GRID_SIZE, exit.height * GRID_SIZE);
      scene.physics.add.existing(zone, true);
      zone.exitData = exit;
      return zone;
    });
  }

  connect(player) {
    this.zones.forEach((zone) => this.scene.physics.add.overlap(player, zone, () => this.enter(zone.exitData)));
  }

  async enter(exit) {
    if (this.transitioning) return;
    this.transitioning = true;
    this.scene.player.setVelocity(0);
    this.scene.player.body.enable = false;
    await new Promise((resolve) => this.scene.cameras.main.fadeOut(260, 16, 35, 33, (_camera, progress) => progress === 1 && resolve()));
    this.scene.scene.restart({ mapId: exit.toMap, entranceId: exit.entranceId });
  }
}
