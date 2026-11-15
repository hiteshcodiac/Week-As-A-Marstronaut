/* eslint-disable react-refresh/only-export-components */
import Phaser from 'phaser';
import outpostBg from './Outpost.png';
import marsBg from '../Mars/Mars.png';
import { SciFiButton } from '../../game/ui/SciFiButton.js';

export class OutpostScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OutpostScene' });
    this.bg = null;
    this.titleText = null;
    this.navButton = null;
  }

  preload() {
    // Load Outpost background
    if (!this.textures.exists('outpost-bg')) {
      this.load.image('outpost-bg', outpostBg);
    }
    // Proactively preload Mars background
    if (!this.textures.exists('mars-bg')) {
      this.load.image('mars-bg', marsBg);
    }
  }

  create() {
    const { width, height } = this.scale;

    // Smooth camera fade in when entering Outpost
    this.cameras.main.fadeIn(450, 0, 0, 0);

    // 1. Full-screen background with aspect ratio preservation
    this.bg = this.add.image(width / 2, height / 2, 'outpost-bg');
    this.bg.setOrigin(0.5, 0.5);

    // 2. Subtle location title text near top
    this.titleText = this.add.text(width / 2, Math.max(36, height * 0.07), 'OUTPOST', {
      fontFamily: "'Rajdhani', 'Orbitron', 'Segoe UI', system-ui, sans-serif",
      fontSize: '22px',
      fontStyle: '700',
      color: '#c2f1ff',
      align: 'center',
    });
    this.titleText.setOrigin(0.5, 0.5);
    this.titleText.setAlpha(0.72);
    this.titleText.setShadow(0, 2, 'rgba(0, 0, 0, 0.8)', 6, false, true);

    // 3. Small interactive navigation button near bottom-centre
    this.navButton = new SciFiButton(
      this,
      width / 2,
      height - Math.max(54, height * 0.09),
      '← RETURN TO MARS',
      {
        accentColor: 0x4deeea, // Futuristic Outpost cyan
        glowColor: 0x0099ff,
        bgColor: 0x060f17,
        bgAlpha: 0.7,
        textColor: '#e8fbff',
        fontSize: '13px',
        paddingX: 24,
        paddingY: 11,
        onClick: () => this.transitionToMars(),
      }
    );

    // Initial scale calculation to ensure cover fit without stretching
    this.updateLayout(width, height);

    // Responsive resize handler
    this.onResize = (gameSize) => {
      this.updateLayout(gameSize.width, gameSize.height);
    };
    this.scale.on('resize', this.onResize, this);

    // Clean up event listener when shutting down
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
    });
  }

  updateLayout(width, height) {
    if (this.bg && this.bg.width && this.bg.height) {
      // Cover viewport while strictly preserving natural aspect ratio
      const scale = Math.max(width / this.bg.width, height / this.bg.height);
      this.bg.setPosition(width / 2, height / 2);
      this.bg.setScale(scale);
    }

    if (this.titleText) {
      this.titleText.setPosition(width / 2, Math.max(36, height * 0.07));
    }

    if (this.navButton) {
      this.navButton.setPosition(width / 2, height - Math.max(54, height * 0.09));
    }
  }

  transitionToMars() {
    // Subtle fade-out transition
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('MarsScene');
    });
  }
}

export default OutpostScene;
