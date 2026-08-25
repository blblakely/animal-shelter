const INTERACTION_DISTANCE = 88;

const makeTextStyle = (size, color = '#fff4d5') => ({
  fontFamily: 'DM Sans, sans-serif',
  fontSize: `${size}px`,
  color,
});

export class AnimalInteractionSystem {
  constructor(scene, player, animalManager) {
    this.scene = scene;
    this.player = player;
    this.animalManager = animalManager;
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
    const background = this.scene.add.rectangle(0, 0, 282, 218, 0x173832, 0.96)
      .setOrigin(0)
      .setStrokeStyle(3, 0xf2ca78);
    this.nameText = this.scene.add.text(18, 15, '', { ...makeTextStyle(25), fontFamily: 'Fredoka, sans-serif' });
    this.detailsText = this.scene.add.text(18, 50, '', makeTextStyle(14, '#d7e8da'));
    this.traitsText = this.scene.add.text(18, 77, '', makeTextStyle(13, '#f6d697'));
    this.behaviorText = this.scene.add.text(18, 108, '', makeTextStyle(13, '#ffffff'));
    this.needsText = this.scene.add.text(18, 137, '', { ...makeTextStyle(13, '#d7e8da'), lineSpacing: 5 });
    this.closeText = this.scene.add.text(264, 12, 'E / Esc', makeTextStyle(11, '#a8c9b8')).setOrigin(1, 0);
    return this.scene.add.container(658, 286, [
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
    if (this.selectedAnimal) {
      this.close();
      return;
    }
    const nearest = this.animalManager.findNearest(this.player.x, this.player.y, INTERACTION_DISTANCE);
    if (nearest) this.open(nearest);
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
      `Health ${data.needs.health}   Happiness ${data.needs.happiness}`,
      `Energy ${data.needs.energy}   Social ${data.needs.social}`,
      'Care actions arrive in a later milestone.',
    ]);
  }

  close() {
    this.selectedAnimal = null;
    this.panel.setVisible(false);
  }

  update() {
    const nearest = this.animalManager.findNearest(this.player.x, this.player.y, INTERACTION_DISTANCE);
    if (this.selectedAnimal) {
      const stillNearby = nearest === this.selectedAnimal;
      if (!stillNearby) this.close();
      else this.updatePanelValues();
    }
    this.prompt.setVisible(Boolean(nearest) && !this.selectedAnimal);
    if (nearest && !this.selectedAnimal) this.prompt.setText(`E · Meet ${nearest.animalData.name}`);
  }
}
