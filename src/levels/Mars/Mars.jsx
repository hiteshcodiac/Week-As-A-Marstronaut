/* eslint-disable react-refresh/only-export-components */
import Phaser from 'phaser';
import marsBg from './Mars.png';
import outpostBg from '../Outpost/Outpost.png';
import { SciFiButton } from '../../game/ui/SciFiButton.js';

export class MarsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MarsScene' });
    this.bg = null;
    this.titleText = null;
    this.navButton = null;
  }

  preload() {
    // Load Mars background
    if (!this.textures.exists('mars-bg')) {
      this.load.image('mars-bg', marsBg);
    }
    // Proactively preload Outpost background for seamless transition
    if (!this.textures.exists('outpost-bg')) {
      this.load.image('outpost-bg', outpostBg);
    }
  }

  create() {
    const { width, height } = this.scale;

    // Smooth camera fade in when entering Mars
    this.cameras.main.fadeIn(450, 0, 0, 0);

    // 1. Full-screen background with aspect ratio preservation
    this.bg = this.add.image(width / 2, height / 2, 'mars-bg');
    this.bg.setOrigin(0.5, 0.5);

    // 2. Subtle location title text near top
    this.titleText = this.add.text(width / 2, Math.max(36, height * 0.07), 'MARS', {
      fontFamily: "'Rajdhani', 'Orbitron', 'Segoe UI', system-ui, sans-serif",
      fontSize: '22px',
      fontStyle: '700',
      color: '#ffc5a1',
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
      'ENTER OUTPOST →',
      {
        accentColor: 0xff7b39, // Warm Martian amber
        glowColor: 0xff4d00,
        bgColor: 0x090c13,
        bgAlpha: 0.7,
        textColor: '#ffece0',
        fontSize: '13px',
        paddingX: 24,
        paddingY: 11,
        onClick: () => this.transitionToOutpost(),
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

  transitionToOutpost() {
    // Subtle fade-out transition
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('OutpostScene');
    });
  }
}

export default MarsScene;
