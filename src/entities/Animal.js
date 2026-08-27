import Phaser from 'phaser';

const ROW = { down: 0, left: 1, right: 2, up: 3 };

export class Animal extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, animalData, species, navigation, feedingStations) {
    super(scene, x, y, species.sprite.key, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.animalData = animalData;
    this.species = species;
    this.navigation = navigation;
    this.feedingStations = feedingStations;
    this.facing = 'down';
    this.target = null;
    this.route = [];
    this.routeKind = null;
    this.routeCompletion = null;
    this.routeFailure = null;
    this.reservedStation = null;
    this.eatingEndsAt = null;
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
    const eatingKey = `${key}-eat-up`;
    if (!this.scene.anims.exists(eatingKey)) {
      this.scene.anims.create({
        key: eatingKey,
        frames: this.species.behavior.eatingAnimationFrames.map((frame) => ({ key, frame })),
        frameRate: 2,
        repeat: -1,
      });
    }
  }

  randomIdleDuration() {
    const [minimum, maximum] = this.species.movement.idleDurationMs;
    return Phaser.Math.Between(minimum, maximum);
  }

  startWandering() {
    const route = this.navigation.nextRoute({ x: this.x, y: this.y });
    if (!route) return this.stopWandering(this.scene.time.now);
    return this.beginRoute(route, 'Exploring', 'wander', (time) => this.stopWandering(time));
  }

  setBehavior(behavior) { this.animalData.currentBehavior = behavior; }

  stopAtFacing(facing = this.facing) {
    this.facing = facing;
    this.setVelocity(0);
    this.anims.stop();
    this.setFrame(ROW[this.facing] * this.species.sprite.framesPerDirection);
  }

  stopWandering(time, behavior = 'Relaxing') {
    this.clearRoute();
    this.target = null;
    this.stopAtFacing();
    this.nextMoveAt = time + this.randomIdleDuration();
    this.setBehavior(behavior);
  }

  moveTowardTarget(time, onArrival, onBlocked) {
    const toTarget = new Phaser.Math.Vector2(this.target.x - this.x, this.target.y - this.y);
    if (toTarget.lengthSq() <= 64) {
      onArrival();
      return;
    }
    if (this.body.blocked.none === false) {
      if (onBlocked) onBlocked(time);
      else this.stopWandering(time);
      return;
    }
    toTarget.normalize().scale(this.species.movement.speed);
    this.setVelocity(toTarget.x, toTarget.y);
    if (Math.abs(toTarget.x) > Math.abs(toTarget.y)) this.facing = toTarget.x < 0 ? 'left' : 'right';
    else this.facing = toTarget.y < 0 ? 'up' : 'down';
    this.anims.play(`${this.species.sprite.key}-walk-${this.facing}`, true);
  }

  startResting() {
    this.target = null;
    this.stopAtFacing();
    this.setBehavior('Resting');
  }

  startSeekingFood(station) {
    if (!this.feedingStations.reserve(station, this.animalData.id)) return false;
    this.reservedStation = station;
    const route = this.navigation.routeTo({ x: this.x, y: this.y }, station.animalUsePoint);
    if (!route) {
      this.releaseStation();
      return false;
    }
    return this.beginRoute(
      route,
      'Seeking food',
      'feeding',
      (time) => this.startEating(time),
      (time) => { this.releaseStation(); this.stopWandering(time, 'Hungry'); },
    );
  }

  startEating(time) {
    this.clearRoute();
    this.target = this.reservedStation.animalUsePoint;
    this.stopAtFacing(this.reservedStation.definition.animalUse.facing);
    this.setBehavior('Eating');
    this.eatingEndsAt = time + this.species.behavior.eatingDurationMs;
    this.anims.play(`${this.species.sprite.key}-eat-up`, true);
  }

  releaseStation() {
    if (this.reservedStation) this.feedingStations.release(this.reservedStation, this.animalData.id);
    this.reservedStation = null;
  }

  finishEating(time) {
    this.stopAtFacing(this.reservedStation?.definition.animalUse.facing ?? this.facing);
    const completed = this.reservedStation
      ? this.feedingStations.completeFeeding(this.reservedStation, this)
      : false;
    if (!completed) this.releaseStation();
    else this.reservedStation = null;
    this.eatingEndsAt = null;
    this.stopWandering(time);
  }

  beginRoute(waypoints, behavior, kind, onComplete, onFailure = null) {
    if (!waypoints?.length) return false;
    this.route = waypoints.map((point) => ({ ...point }));
    this.routeKind = kind;
    this.routeCompletion = onComplete;
    this.routeFailure = onFailure;
    this.target = this.route.shift();
    this.setBehavior(behavior);
    return true;
  }

  clearRoute() {
    this.route = [];
    this.routeKind = null;
    this.routeCompletion = null;
    this.routeFailure = null;
  }

  advanceRoute(time) {
    if (this.route.length > 0) {
      this.target = this.route.shift();
      return;
    }
    const completion = this.routeCompletion;
    this.clearRoute();
    this.target = null;
    completion?.(time);
  }

  failRoute(time) {
    const failure = this.routeFailure;
    this.clearRoute();
    this.target = null;
    this.stopAtFacing();
    failure?.(time);
  }

  assignCareRoute(waypoints, behavior, onComplete, onFailure) {
    return this.beginRoute(waypoints, behavior, 'care', onComplete, onFailure);
  }

  cancelAssignedRoute() {
    this.clearRoute();
    this.target = null;
    this.stopAtFacing();
  }

  update(time) {
    this.setDepth(9 + this.y / 10000);

    if (this.routeKind) {
      if (this.routeKind === 'feeding'
        && (!this.reservedStation?.state.isFilled || this.reservedStation.state.reservedBy !== this.animalData.id)) {
        this.releaseStation();
        this.stopWandering(time, 'Hungry');
        return;
      }
      this.moveTowardTarget(time, () => this.advanceRoute(time), () => this.failRoute(time));
      return;
    }

    if (this.animalData.currentBehavior === 'Eating') {
      if (time >= this.eatingEndsAt) this.finishEating(time);
      return;
    }

    if (this.animalData.currentBehavior === 'Resting') {
      if (this.animalData.needs.energy >= this.species.behavior.restedAt) this.stopWandering(time);
      return;
    }

    const isHungry = this.animalData.needs.hunger <= this.species.behavior.hungryBelow;
    const station = isHungry ? this.feedingStations.getAvailableStation(this.animalData, this.species) : null;
    for (const priority of this.species.behavior.priority) {
      if (priority === 'food' && station && this.startSeekingFood(station)) return;
      if (priority === 'rest' && this.animalData.needs.energy <= this.species.behavior.tiredBelow) {
        this.startResting();
        return;
      }
    }
    if (isHungry && !this.target) this.setBehavior('Hungry');

    if (!this.target) {
      if (time >= this.nextMoveAt) this.startWandering();
      return;
    }

    this.moveTowardTarget(time, () => this.stopWandering(time));
  }
}
