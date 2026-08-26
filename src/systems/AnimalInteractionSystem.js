const INTERACTION_DISTANCE = 88;
const OPEN_PROFILE_DISTANCE = 180;

const makeTextStyle = (size, color = '#fff4d5') => ({
  fontFamily: 'DM Sans, sans-serif',
  fontSize: `${size}px`,
  color,
});

export class AnimalInteractionSystem {
  constructor(scene, player, animalManager, feedingStations, careActions) {
    this.scene = scene;
    this.player = player;
    this.animalManager = animalManager;
    this.feedingStations = feedingStations;
    this.careActions = careActions;
    this.selectedAnimal = null;
    this.prompt = scene.add.text(480, 494, '', {
      ...makeTextStyle(15),
      backgroundColor: '#203a34e8',
      padding: { x: 12, y: 7 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);
    this.panel = this.createPanel();
    this.interactKey = scene.input.keyboard.addKey('E');
    this.closeKey = scene.input.keyboard.addKey('ESC');
    this.interactKey.on('down', () => this.toggleNearest());
    this.closeKey.on('down', () => this.close());
  }

  createPanel() {
    const background = this.scene.add.rectangle(0, 0, 282, 252, 0x173832, 0.96)
      .setOrigin(0)
      .setStrokeStyle(3, 0xf2ca78);
    this.nameText = this.scene.add.text(18, 15, '', { ...makeTextStyle(25), fontFamily: 'Fredoka, sans-serif' });
    this.detailsText = this.scene.add.text(18, 50, '', makeTextStyle(14, '#d7e8da'));
    this.traitsText = this.scene.add.text(18, 77, '', makeTextStyle(13, '#f6d697'));
    this.behaviorText = this.scene.add.text(18, 108, '', makeTextStyle(13, '#ffffff'));
    this.needsText = this.scene.add.text(18, 137, '', { ...makeTextStyle(13, '#d7e8da'), lineSpacing: 5 });
    this.closeText = this.scene.add.text(264, 12, 'E / Esc', makeTextStyle(11, '#a8c9b8')).setOrigin(1, 0);
    return this.scene.add.container(658, 252, [
      background,
      this.nameText,
      this.detailsText,
      this.traitsText,
      this.behaviorText,
      this.needsText,
      this.closeText,
    ]).setScrollFactor(0).setDepth(201).setVisible(false);
  }

  toggleNearest() {
    if (this.careActions.isBusy) return;
    if (this.selectedAnimal) {
      this.close();
      return;
    }
    const station = this.feedingStations.findNearestInteraction(this.player.x, this.player.y, INTERACTION_DISTANCE);
    const nearest = this.animalManager.findNearest(this.player.x, this.player.y, INTERACTION_DISTANCE);
    if (this.shouldPrioritizeStation(station, nearest) && this.careActions.fillBowl(station)) return;
    if (nearest) this.open(nearest);
  }

  shouldPrioritizeStation(station, animal) {
    if (!station || station.state.isFilled) return false;
    if (!animal) return true;
    const point = station.playerInteractionPoint;
    const stationDistance = Math.hypot(point.x - this.player.x, point.y - this.player.y);
    const animalDistance = Math.hypot(animal.x - this.player.x, animal.y - this.player.y);
    return stationDistance <= animalDistance;
  }

  open(animal) {
    this.selectedAnimal = animal;
    const data = animal.animalData;
    this.nameText.setText(`${data.name} · ${animal.species.displayName}`);
    this.detailsText.setText(`${data.breed}  ·  ${data.age.lifeStage}, age ${data.age.years}`);
    this.traitsText.setText(data.traits.join('  •  '));
    this.updatePanelValues();
    this.panel.setVisible(true);
    this.prompt.setVisible(false);
  }

  updatePanelValues() {
    if (!this.selectedAnimal) return;
    const data = this.selectedAnimal.animalData;
    this.behaviorText.setText(`Now: ${data.currentBehavior}`);
    this.needsText.setText([
      `Hunger       ${Math.round(data.needs.hunger)} / 100`,
      `Cleanliness  ${Math.round(data.needs.cleanliness)} / 100`,
      `Happiness    ${Math.round(data.needs.happiness)} / 100`,
      `Health       ${Math.round(data.needs.health)} / 100`,
      `Energy       ${Math.round(data.needs.energy)} / 100`,
      `Social       ${Math.round(data.needs.social)} / 100`,
    ]);
  }

  close() {
    this.selectedAnimal = null;
    this.panel.setVisible(false);
  }

  update() {
    const nearest = this.animalManager.findNearest(this.player.x, this.player.y, INTERACTION_DISTANCE);
    const station = this.feedingStations.findNearestInteraction(this.player.x, this.player.y, INTERACTION_DISTANCE);
    if (this.selectedAnimal) {
      const stillNearby = Math.hypot(
        this.selectedAnimal.x - this.player.x,
        this.selectedAnimal.y - this.player.y,
      ) <= OPEN_PROFILE_DISTANCE;
      if (!stillNearby) this.close();
      else this.updatePanelValues();
    }
    const canFill = this.shouldPrioritizeStation(station, nearest);
    const promptVisible = !this.careActions.isBusy && !this.selectedAnimal && (canFill || nearest);
    this.prompt.setVisible(Boolean(promptVisible));
    if (canFill && !this.selectedAnimal) this.prompt.setText(`E · Fill ${station.definition.displayName}`);
    else if (nearest && !this.selectedAnimal) this.prompt.setText(`E · Meet ${nearest.animalData.name}`);
  }
}
