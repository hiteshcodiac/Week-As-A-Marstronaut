/**
 * Mars Power Component World Object
 *
 * Physical environmental interactable placed in Mars world coordinates.
 * Represents the external replacement power component that must be retrieved
 * during an active EVA (Option B, Option C, or after Option A waiting phase).
 */

import Phaser from 'phaser';
import {
  doubleStormManager,
  completePowerComponentRetrieval,
  STORM_STATUS,
} from '../../game/events/doubleStormState.js';
import { MARS_ENVIRONMENT_CONFIG } from '../../config/marsEnvironmentConfig.js';

export class PowerComponent extends Phaser.GameObjects.Container {
  constructor(scene) {
    const loc = MARS_ENVIRONMENT_CONFIG.theDoubleStorm.powerComponentLocation;
    super(scene, loc.x, loc.y);

    this.sceneRef = scene;
    this.interactionDist = loc.interactionDistance;
    this.isNear = false;
    this.isRetrieved = false;

    this.buildVisuals();
    this.setupInteraction();

    scene.add.existing(this);
    this.setDepth(600); // Renders above Martian terrain

    // State subscription
    this.unsubscribe = doubleStormManager.subscribe((state) => {
      this.updateVisibility(state);
    });
    this.updateVisibility(doubleStormManager.getState());
  }

  buildVisuals() {
    // 1. Tech base pad
    this.basePad = this.sceneRef.add.graphics();
    this.basePad.fillStyle(0x1a2634, 0.9);
    this.basePad.fillCircle(0, 0, 22);
    this.basePad.lineStyle(2, 0x3da9fc, 0.8);
    this.basePad.strokeCircle(0, 0, 22);

    // 2. Glowing Power Cell Core
    this.core = this.sceneRef.add.graphics();
    this.core.fillStyle(0x00ffff, 0.95);
    this.core.fillRoundedRect(-10, -14, 20, 28, 4);
    this.core.lineStyle(2, 0xffffff, 1);
    this.core.strokeRoundedRect(-10, -14, 20, 28, 4);

    // 3. Floating Prompt Badge
    this.promptContainer = this.sceneRef.add.container(0, -42);
    const promptBg = this.sceneRef.add.graphics();
    promptBg.fillStyle(0x0a1420, 0.9);
    promptBg.fillRoundedRect(-95, -14, 190, 28, 4);
    promptBg.lineStyle(1.5, 0x00ffff, 0.9);
    promptBg.strokeRoundedRect(-95, -14, 190, 28, 4);

    this.promptText = this.sceneRef.add.text(0, 0, '[E] RETRIEVE POWER COMPONENT', {
      fontFamily: 'Segoe UI, monospace',
      fontSize: '10px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.promptContainer.add([promptBg, this.promptText]);
    this.promptContainer.setVisible(false);

    this.add([this.basePad, this.core, this.promptContainer]);

    // Idle core pulsing animation
    this.pulseTween = this.sceneRef.tweens.add({
      targets: this.core,
      scaleX: 1.15,
      scaleY: 1.15,
      yoyo: true,
      repeat: -1,
      duration: 800,
      ease: 'Sine.easeInOut',
    });
  }

  setupInteraction() {
    this.onKeyDown = (e) => {
      if (e.repeat) return;
      if ((e.code === 'KeyE' || e.key === 'e' || e.key === 'E') && this.isNear && !this.isRetrieved) {
        this.retrieve();
      }
    };
    if (this.sceneRef.input?.keyboard) {
      this.sceneRef.input.keyboard.on('keydown', this.onKeyDown);
    }
  }

  updateVisibility(state) {
    this.isRetrieved = state.componentRetrieved;
    const shouldBeVisible = (state.status === STORM_STATUS.EVA_ACTIVE) && !this.isRetrieved;
    this.setVisible(shouldBeVisible);
    if (!shouldBeVisible) {
      this.promptContainer.setVisible(false);
      this.isNear = false;
    }
  }

  /**
   * Called in scene update() to check distance to rover.
   */
  checkProximity(roverX, roverY) {
    if (!this.visible || this.isRetrieved) {
      this.promptContainer.setVisible(false);
      this.isNear = false;
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, roverX, roverY);
    if (dist <= this.interactionDist) {
      if (!this.isNear) {
        this.isNear = true;
        this.promptContainer.setVisible(true);
      }
    } else {
      if (this.isNear) {
        this.isNear = false;
        this.promptContainer.setVisible(false);
      }
    }
  }

  retrieve() {
    this.isRetrieved = true;
    this.promptContainer.setVisible(false);

    // Sparkle pickup effect
    this.sceneRef.tweens.add({
      targets: [this.basePad, this.core],
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.setVisible(false);
        completePowerComponentRetrieval();
      },
    });
  }

  destroy(fromScene) {
    if (this.sceneRef.input?.keyboard) {
      this.sceneRef.input.keyboard.off('keydown', this.onKeyDown);
    }
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
    }
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    super.destroy(fromScene);
  }
}
