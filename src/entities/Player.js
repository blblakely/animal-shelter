import Phaser from 'phaser';

const ROW = { down: 0, left: 1, right: 2, up: 3 };

export class Player extends Phaser.Physics.Arcade.Sprite {
  static SPEED = 190;

  constructor(scene, x, y, input, facing = 'down') {
    super(scene, x, y, 'temporary-player', ROW[facing] * 4);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.inputController = input;
    this.facing = facing;
    this.setDepth(10).setCollideWorldBounds(true);
    this.body.setSize(22, 16).setOffset(21, 76);
    this.createAnimations();
  }

  createAnimations() {
    Object.entries(ROW).forEach(([direction, row]) => {
      const key = `walk-${direction}`;
      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({ key, frames: this.scene.anims.generateFrameNumbers('temporary-player', { start: row * 4, end: row * 4 + 3 }), frameRate: 7, repeat: -1 });
      }
    });
  }

  update() {
    const movement = this.inputController.getMovement();
    const vector = new Phaser.Math.Vector2(movement.x, movement.y);
    if (vector.lengthSq() === 0) {
      this.setVelocity(0);
      this.anims.stop();
      this.setFrame(ROW[this.facing] * 4);
      return;
    }
    vector.normalize().scale(Player.SPEED);
    this.setVelocity(vector.x, vector.y);
    if (Math.abs(movement.x) > Math.abs(movement.y)) this.facing = movement.x < 0 ? 'left' : 'right';
    else this.facing = movement.y < 0 ? 'up' : 'down';
    this.anims.play(`walk-${this.facing}`, true);
  }
}

