import Phaser from 'phaser';
import { VIEWPORT } from '../config/constants.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    const { width, height } = VIEWPORT;
    this.cameras.main.setBackgroundColor('#173832');
    const bg = this.add.graphics();
    bg.fillStyle(0x315e4d).fillRect(0, height * .57, width, height * .43);
    bg.fillStyle(0x244a40).fillCircle(110, 390, 150).fillCircle(835, 375, 190);
    bg.fillStyle(0xf3cf8c).fillCircle(width / 2, 115, 58);
    this.add.text(width / 2, 165, 'WILLOWMERE', { fontFamily: 'Fredoka, sans-serif', fontSize: '62px', color: '#fff5da', stroke: '#6d4933', strokeThickness: 8 }).setOrigin(.5);
    this.add.text(width / 2, 225, 'ANIMAL CENTER', { fontFamily: 'Fredoka, sans-serif', fontSize: '31px', color: '#f6d697', letterSpacing: 8 }).setOrigin(.5);
    this.add.text(width / 2, 272, 'A cozy shelter management game', { fontFamily: 'DM Sans, sans-serif', fontSize: '18px', color: '#d7e8da' }).setOrigin(.5);
    const button = this.add.rectangle(width / 2, 360, 250, 70, 0xf2ca78).setStrokeStyle(4, 0x734d32).setInteractive({ useHandCursor: true });
    const label = this.add.text(width / 2, 360, 'START GAME', { fontFamily: 'Fredoka, sans-serif', fontSize: '25px', color: '#293a31' }).setOrigin(.5);
    button.on('pointerover', () => button.setFillStyle(0xffe1a1));
    button.on('pointerout', () => button.setFillStyle(0xf2ca78));
    button.on('pointerdown', () => this.scene.start('WorldScene', { mapId: 'shelter_grounds', entranceId: 'center_start' }));
    this.input.keyboard.once('keydown-ENTER', () => button.emit('pointerdown'));
    this.add.text(width / 2, 422, 'Enter or click to begin', { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#c6d9cf' }).setOrigin(.5);
  }
}
