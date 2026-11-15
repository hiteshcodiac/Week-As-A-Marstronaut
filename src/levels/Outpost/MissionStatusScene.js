import Phaser from 'phaser';
import missionTabImage from './tab.png';
import { missionStatus, subscribeMissionStatus } from '../../game/missionStatus.js';

const TEXTURE = 'mission-status-tab';

export class MissionStatusScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MissionStatusScene' });
    this.items = [];
  }

  preload() {
    if (!this.textures.exists(TEXTURE)) this.load.image(TEXTURE, missionTabImage);
  }

  create() {
    this.layout(this.scale.width, this.scale.height);
    this.unsubscribe = subscribeMissionStatus(() => this.refresh());
    this.refresh();
    this.onResize = (size) => this.layout(size.width, size.height);
    this.scale.on('resize', this.onResize, this);
    this.onKeyDown = (event) => {
      if (!event.repeat && (event.code === 'KeyT' || event.key === 't' || event.key === 'T')) {
        this.scene.stop();
        this.scene.resume('OutpostScene');
      }
    };
    this.input.keyboard?.on('keydown', this.onKeyDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.onKeyDown);
      this.scale.off('resize', this.onResize, this);
      this.unsubscribe?.();
    });
  }

  layout(width, height) {
    this.children.removeAll(true);
    this.items = [];
    const background = this.add.image(width / 2, height / 2, TEXTURE);
    background.setScale(Math.max(width / background.width, height / background.height));
    background.setDepth(0);

    const left = width * 0.105;
    const top = height * 0.105;
    const gapX = width * 0.035;
    const gapY = height * 0.035;
    const cardW = (width * 0.79 - gapX) / 2;
    const cardH = (height * 0.79 - gapY * 2) / 3;
    const entries = [
      ['SUIT BATTERY', (s) => `${s.suitBattery}%`], ['SOLAR INTENSITY', (s) => `${s.solarIntensity}%`],
      ['STORM INTENSITY', (s) => s.stormIntensity], ['POWER CONSUMPTION', (s) => `${s.powerConsumption} kW`],
      ['POWER AVAILABLE', (s) => `${s.powerAvailable} kWh`], ['EMERGENCY', (s) => s.emergency],
    ];
    entries.forEach(([label, getter], index) => {
      const x = left + (index % 2) * (cardW + gapX);
      const y = top + Math.floor(index / 2) * (cardH + gapY);
      this.add.rectangle(x, y, cardW, cardH, 0x12304a, 0.10)
        .setOrigin(0).setStrokeStyle(2, 0x43899d, 0.45).setDepth(1);
      this.add.text(x + 16, y + 12, label, {
        fontFamily: 'Segoe UI, sans-serif', fontSize: `${Math.max(16, Math.min(25, cardH * 0.15))}px`,
        color: '#315466', fontStyle: 'bold',
      }).setDepth(2);
      const value = this.add.text(x + 16, y + cardH * 0.40, '', {
        fontFamily: 'Segoe UI, sans-serif', fontSize: `${Math.max(22, Math.min(42, cardH * 0.25))}px`,
        color: '#123b50', fontStyle: 'bold', wordWrap: { width: cardW - 32 },
      }).setDepth(2);
      this.items.push({ value, getter });
    });
  }

  refresh() { this.items.forEach(({ value, getter }) => value.setText(String(getter(missionStatus)))); }
}

export default MissionStatusScene;
