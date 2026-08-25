import Phaser from 'phaser';

const ROW = { down: 0, left: 1, right: 2, up: 3 };

export class Animal extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, animalData, species, navigation) {
    super(scene, x, y, species.sprite.key, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.animalData = animalData;
    this.species = species;
    this.navigation = navigation;
    this.facing = 'down';
    this.target = null;
    this.nextMoveAt = scene.time.now + this.randomIdleDuration();
    this.setCollideWorldBounds(true).setDepth(9);
    this.body.setSize(species.collider.width, species.collider.height);
    this.body.setOffset(species.collider.offsetX, species.collider.offsetY);
    this.createAnimations();
  }

  createAnimations() {
    const { key, framesPerDirection } = this.species.sprite;
    Object.entries(ROW).forEach(([direction, row]) => {
      const animationKey = `${key}-walk-${direction}`;
      if (!this.scene.anims.exists(animationKey)) {
        this.scene.anims.create({
          key: animationKey,
          frames: this.scene.anims.generateFrameNumbers(key, {
            start: row * framesPerDirection,
            end: row * framesPerDirection + framesPerDirection - 1,
          }),
          frameRate: this.species.movement.animationFrameRate,
          repeat: -1,
        });
      }
    });
  }

  randomIdleDuration() {
    const [minimum, maximum] = this.species.movement.idleDurationMs;
    return Phaser.Math.Between(minimum, maximum);
  }

  startWandering() {
    this.target = this.navigation.nextTarget();
    this.animalData.currentBehavior = 'Exploring';
  }

  stopWandering(time) {
    this.target = null;
    this.setVelocity(0);
    this.anims.stop();
    this.setFrame(ROW[this.facing] * this.species.sprite.framesPerDirection);
    this.nextMoveAt = time + this.randomIdleDuration();
    this.animalData.currentBehavior = 'Relaxing';
  }

  update(time) {
    this.setDepth(9 + this.y / 10000);
    if (!this.target) {
      if (time >= this.nextMoveAt) this.startWandering();
      return;
    }

    const toTarget = new Phaser.Math.Vector2(this.target.x - this.x, this.target.y - this.y);
    if (toTarget.lengthSq() <= 64 || this.body.blocked.none === false) {
      this.stopWandering(time);
      return;
    }

    toTarget.normalize().scale(this.species.movement.speed);
    this.setVelocity(toTarget.x, toTarget.y);
    if (Math.abs(toTarget.x) > Math.abs(toTarget.y)) this.facing = toTarget.x < 0 ? 'left' : 'right';
    else this.facing = toTarget.y < 0 ? 'up' : 'down';
    this.anims.play(`${this.species.sprite.key}-walk-${this.facing}`, true);
  }
}
