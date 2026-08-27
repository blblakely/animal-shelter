import Phaser from 'phaser';
import { GRID_SIZE } from '../config/constants.js';
import { getCareActionDefinition } from '../data/careActions.js';
import { applyCareActionCompletion, canStartCareAction } from './CareActionBehavior.js';

const PLAYER_START_DISTANCE = 90;
const ABANDON_DISTANCE = 520;

export class CareActionSystem {
  constructor(scene, player, feedingStations, careStations, enclosureRegistry) {
    this.scene = scene;
    this.player = player;
    this.feedingStations = feedingStations;
    this.careStations = careStations;
    this.enclosureRegistry = enclosureRegistry;
    this.isBusy = false;
    this.assignment = null;
    this.effectObjects = [];
    this.feedback = scene.add.text(480, 452, '', {
      fontFamily: 'DM Sans, sans-serif',
      fontSize: '16px',
      color: '#fff4d5',
      backgroundColor: '#203a34e8',
      padding: { x: 12, y: 7 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(205).setVisible(false);
    this.cancelKey = scene.input.keyboard.addKey('ESC');
    this.cancelKey.on('down', () => {
      if (this.assignment && !this.assignment.phase.startsWith('returning')) this.cancelCurrent('Care action cancelled');
    });
    this.unsubscribeEnclosure = enclosureRegistry.onChange(() => {
      if (this.assignment && !this.assignment.phase.startsWith('returning')) this.cancelCurrent('Enclosure changed');
    });
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
  }

  showFeedback(message, holdMs = 1100) {
    this.feedback.setText(message).setVisible(true).setAlpha(1);
    this.scene.tweens.killTweensOf(this.feedback);
    if (holdMs > 0) {
      this.scene.tweens.add({
        targets: this.feedback,
        alpha: 0,
        delay: holdMs,
        duration: 350,
        onComplete: () => this.feedback.setVisible(false).setAlpha(1),
      });
    }
  }

  fillBowl(station) {
    if (this.isBusy || this.assignment || station.state.isFilled || !this.feedingStations.isDefaultFoodCompatible(station)) return false;
    this.isBusy = true;
    this.player.setVelocity(0);
    this.player.anims.stop();
    this.showFeedback(`Filling ${station.definition.displayName}…`, 0);
    this.scene.time.delayedCall(650, () => {
      this.feedingStations.fill(station, station.definition.defaultFoodId);
      this.isBusy = false;
      this.showFeedback(`${station.definition.displayName} is filled!`);
    });
    return true;
  }

  canRequestWash(animal) {
    if (this.assignment || this.isBusy) return false;
    const action = getCareActionDefinition('wash');
    const station = this.careStations.stations.find(({ definition }) => (
      definition.objectType === action.requiredStationType
      && definition.compatibleSpecies.includes(animal.animalData.speciesId)
    ));
    return Boolean(station
      && !station.reservation.reservedBy
      && canStartCareAction(action, animal.animalData, animal.species, station.definition));
  }

  requestWash(animal) {
    if (!this.canRequestWash(animal)) {
      this.showFeedback('Washing is not available right now');
      return false;
    }
    const action = getCareActionDefinition('wash');
    const station = this.careStations.getAvailable(action.requiredStationType, animal.animalData.speciesId);
    const enclosure = this.enclosureRegistry.get(animal.animalData.location.enclosureId);
    const careRoute = enclosure?.definition.careRoutes.find(({ stationId }) => stationId === station?.definition.instanceId);
    if (!station || !enclosure || !careRoute || !this.careStations.reserve(station, animal.animalData.id)) {
      this.showFeedback('The wash station is occupied');
      return false;
    }
    const route = animal.navigation.careRouteTo(
      { x: animal.x, y: animal.y },
      station.animalInteractionPoint,
      careRoute,
    );
    if (!route) {
      this.careStations.release(station, animal.animalData.id);
      this.showFeedback('Maple cannot reach the wash station');
      return false;
    }
    this.assignment = {
      action,
      animal,
      station,
      enclosure,
      careRoute,
      phase: 'traveling-to-station',
      requestedAt: this.scene.time.now,
      route: route.map((point) => ({ ...point })),
      cleanlinessBefore: animal.animalData.needs.cleanliness,
    };
    animal.assignCareRoute(
      route,
      'Walking to wash station',
      () => this.arriveAtStation(),
      () => this.cancelCurrent('The care route became blocked'),
    );
    this.showFeedback('Maple is walking to the wash station');
    return true;
  }

  arriveAtStation() {
    if (!this.assignment) return;
    const { animal, action } = this.assignment;
    this.assignment.phase = 'waiting-for-player';
    animal.stopAtFacing(action.animalPose.facing);
    animal.setBehavior('Waiting to be washed');
    this.showFeedback('Meet Maple at the wash station');
  }

  canBeginReservedAction(station) {
    if (!this.assignment || this.assignment.station !== station || this.assignment.phase !== 'waiting-for-player') return false;
    const { animal } = this.assignment;
    return station.reservation.reservedBy === animal.animalData.id
      && Phaser.Math.Distance.Between(this.player.x, this.player.y, station.playerInteractionPoint.x, station.playerInteractionPoint.y) <= PLAYER_START_DISTANCE;
  }

  beginReservedAction(station) {
    if (!this.canBeginReservedAction(station)) return false;
    const { action, animal } = this.assignment;
    this.assignment.phase = 'washing';
    this.assignment.startedAt = this.scene.time.now;
    this.assignment.endsAt = this.scene.time.now + action.durationMs;
    this.isBusy = true;
    this.player.setVelocity(0);
    this.player.anims.stop();
    this.player.facing = action.playerPose.facing;
    this.player.setFrame({ down: 0, left: 4, right: 8, up: 12 }[this.player.facing]);
    animal.stopAtFacing(action.animalPose.facing);
    animal.setBehavior(action.animalPose.behavior);
    this.startWashEffects(station);
    this.showFeedback('Washing Maple…', 0);
    return true;
  }

  startWashEffects(station) {
    const bubbles = [
      { text: '○', x: -24, delay: 0 },
      { text: '◦', x: 4, delay: 260 },
      { text: '✦', x: 26, delay: 520 },
    ];
    bubbles.forEach((bubble) => {
      const object = this.scene.add.text(station.x + bubble.x, station.y - 12, bubble.text, {
        fontFamily: 'Fredoka, sans-serif', fontSize: '22px', color: '#d9fbff', stroke: '#65b9c5', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(12).setAlpha(0);
      this.effectObjects.push(object);
      this.scene.tweens.add({
        targets: object, y: station.y - 66, alpha: { from: 0, to: 1 }, delay: bubble.delay,
        duration: 850, yoyo: true, repeat: -1,
      });
    });
  }

  clearWashEffects() {
    this.effectObjects.forEach((object) => { this.scene.tweens.killTweensOf(object); object.destroy(); });
    this.effectObjects = [];
  }

  completeWashing() {
    if (!this.assignment || this.assignment.phase !== 'washing') return;
    const { action, animal, station } = this.assignment;
    applyCareActionCompletion(action, animal.animalData.needs);
    this.clearWashEffects();
    this.isBusy = false;
    this.careStations.release(station, animal.animalData.id);
    this.showFeedback(`Maple is clean! Returning to her yard`);
    this.beginReturn(false);
  }

  getReturnPoint() {
    const { enclosure, careRoute } = this.assignment;
    const rest = enclosure.definition.restPositions.find(({ id }) => id === careRoute.returnPositionId)
      ?? enclosure.definition.restPositions[0];
    return { x: (rest.tileX + 0.5) * GRID_SIZE, y: rest.tileY * GRID_SIZE + 4 };
  }

  beginReturn(cancelled) {
    if (!this.assignment) return;
    const { animal, careRoute } = this.assignment;
    const destination = this.getReturnPoint();
    const route = animal.navigation.careRouteTo({ x: animal.x, y: animal.y }, destination, careRoute);
    this.assignment.phase = cancelled ? 'returning-after-cancel' : 'returning-to-enclosure';
    this.assignment.route = route?.map((point) => ({ ...point })) ?? [];
    if (!route) {
      // Static milestone geometry always supplies a return route. Keep Maple stopped and retry
      // after the next enclosure refresh rather than allowing unrestricted wandering.
      animal.stopAtFacing();
      animal.setBehavior('Waiting for safe return route');
      this.assignment.nextReturnRetryAt = this.scene.time.now + 1000;
      return;
    }
    this.assignment.nextReturnRetryAt = null;
    animal.assignCareRoute(
      route,
      'Returning to enclosure',
      (time) => this.finishReturn(time),
      () => this.retryReturn(),
    );
  }

  retryReturn() {
    if (!this.assignment) return;
    this.beginReturn(this.assignment.phase === 'returning-after-cancel');
  }

  finishReturn(time) {
    if (!this.assignment) return;
    const animal = this.assignment.animal;
    animal.stopWandering(time, 'Relaxing');
    this.assignment = null;
  }

  cancelCurrent(reason, sceneShutdown = false) {
    if (!this.assignment) return false;
    const { animal, station } = this.assignment;
    this.clearWashEffects();
    this.isBusy = false;
    this.careStations.release(station, animal.animalData.id);
    animal.cancelAssignedRoute();
    if (sceneShutdown) {
      animal.setBehavior('Relaxing');
      this.assignment = null;
      return true;
    }
    this.showFeedback(`${reason} — Maple is returning safely`);
    if (animal.navigation.isInNormalRegion({ x: animal.x, y: animal.y })) {
      animal.stopWandering(this.scene.time.now, 'Relaxing');
      this.assignment = null;
    } else this.beginReturn(true);
    return true;
  }

  update(time) {
    if (!this.assignment) return;
    const { phase, station, animal, requestedAt } = this.assignment;
    if (phase.startsWith('returning') && this.assignment.nextReturnRetryAt && time >= this.assignment.nextReturnRetryAt) {
      this.beginReturn(phase === 'returning-after-cancel');
      return;
    }
    if (station.reservation.reservedBy !== animal.animalData.id && !phase.startsWith('returning')) {
      this.cancelCurrent('The wash station reservation was lost');
      return;
    }
    if ((phase === 'traveling-to-station' || phase === 'waiting-for-player')
      && time - requestedAt > 1500
      && Phaser.Math.Distance.Between(this.player.x, this.player.y, station.x, station.y) > ABANDON_DISTANCE) {
      this.cancelCurrent('You walked away before washing began');
      return;
    }
    if (phase === 'washing') {
      const progress = Phaser.Math.Clamp((time - this.assignment.startedAt) / this.assignment.action.durationMs, 0, 1);
      this.feedback.setText(`Washing Maple… ${Math.round(progress * 100)}%`);
      if (time >= this.assignment.endsAt) this.completeWashing();
    }
  }

  shutdown() {
    this.unsubscribeEnclosure?.();
    if (this.assignment) this.cancelCurrent('Map changed', true);
    this.clearWashEffects();
    this.isBusy = false;
  }
}
