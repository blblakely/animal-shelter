export class GameTimeHud {
  constructor(scene, gameTime) {
    this.gameTime = gameTime;
    this.text = scene.add.text(942, 18, '', {
      fontFamily: 'DM Sans, sans-serif',
      fontSize: '14px',
      color: '#fff4d5',
      backgroundColor: '#203a34bb',
      padding: { x: 8, y: 5 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(50);
    this.update();
  }

  update() { this.text.setText(this.gameTime.getDisplayTime()); }
}
