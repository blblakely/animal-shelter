export class CareActionSystem {
  constructor(scene, player, feedingStations) {
    this.scene = scene;
    this.player = player;
    this.feedingStations = feedingStations;
    this.isBusy = false;
    this.feedback = scene.add.text(480, 452, '', {
      fontFamily: 'DM Sans, sans-serif',
      fontSize: '16px',
      color: '#fff4d5',
      backgroundColor: '#203a34e8',
      padding: { x: 12, y: 7 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(205).setVisible(false);
  }

  fillBowl(station) {
    if (this.isBusy || station.state.isFilled || !this.feedingStations.isDefaultFoodCompatible(station)) return false;
    this.isBusy = true;
    this.player.setVelocity(0);
    this.player.anims.stop();
    this.feedback.setText(`Filling ${station.definition.displayName}…`).setVisible(true).setAlpha(1);
    this.scene.time.delayedCall(650, () => {
      this.feedingStations.fill(station, station.definition.defaultFoodId);
      this.isBusy = false;
      this.feedback.setText(`${station.definition.displayName} is filled!`);
      this.scene.tweens.add({
        targets: this.feedback,
        alpha: 0,
        delay: 900,
        duration: 400,
        onComplete: () => this.feedback.setVisible(false).setAlpha(1),
      });
    });
    return true;
  }
}
