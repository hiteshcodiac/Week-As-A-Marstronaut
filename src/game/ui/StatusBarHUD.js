import Phaser from 'phaser';

/**
 * Pixel coordinates measured directly from the HUD assets (800x177):
 * 10 segments total, each ~38px wide with 4-5px gaps.
 * Pitch = ~42.1px between segment starts.
 * Segment 1 starts at x=304, Segment 10 ends at x=720.
 */
export const SLOT_X_COORDS = [304, 346, 388, 430, 472, 515, 557, 599, 641, 683];
export const SLOT_WIDTH = 38;
export const SLOT_HEIGHT = 55;
export const SLOT_Y = 70;

// Cutoff X positions for 0 to 10 active segments (disappearing RIGHT to LEFT)
export const SLOT_CUTOFFS = [0, 344, 386, 428, 470, 513, 555, 597, 639, 681, 722];

/**
 * StatusBarHUD
 * Generalized dynamic screen-space status bar component with smooth reduction animations.
 * Preserves original design, colors, proportions, and alpha transparency from the source PNG asset.
 * Employs template canvases to show 100% full bar initially, and smoothly reveals dark empty
 * slots from right to left as the status value depletes.
 */
export class StatusBarHUD extends Phaser.GameObjects.Image {
  constructor(scene, options = {}) {
    const {
      textureKey,
      dynamicKey,
      initialValue = 100,
      initialMax = 100,
      sampleFilledIndex = 0,
      sampleEmptyIndex = 9,
      barIndex = 1,
    } = options;

    const canvasTexture = StatusBarHUD.initTextures(
      scene,
      textureKey,
      dynamicKey,
      sampleFilledIndex,
      sampleEmptyIndex
    );

    super(scene, 0, 0, canvasTexture.key);

    this.sceneRef = scene;
    this.canvasTexture = canvasTexture;
    this.bgCanvas = canvasTexture.bgCanvas;
    this.fillCanvas = canvasTexture.fillCanvas;
    this.barIndex = barIndex;

    this.currentValue = initialValue;
    this.visualValue = initialValue;
    this.maxValue = initialMax;
    this.tween = null;

    this.setOrigin(0, 0);
    this.setScrollFactor(0);

    // Initial render without animation
    this.renderBar(this.visualValue, this.maxValue);

    scene.add.existing(this);
  }

  /**
   * Initializes the dynamic canvas texture and offscreen templates for a status bar:
   * - bgCanvas: Full HUD with all 10 slots rendered in dark empty state.
   * - fillCanvas: All 10 slots rendered in full vibrant segment fills.
   *
   * @param {Phaser.Scene} scene
   * @param {string} textureKey
   * @param {string} dynamicKey
   * @param {number} sampleFilledIndex
   * @param {number} sampleEmptyIndex
   * @returns {Phaser.Textures.CanvasTexture}
   */
  static initTextures(scene, textureKey, dynamicKey, sampleFilledIndex, sampleEmptyIndex) {
    const textures = scene.textures;

    if (!textures.exists(dynamicKey)) {
      textures.createCanvas(dynamicKey, 800, 177);
    }

    const dynamicTexture = textures.get(dynamicKey);
    const sourceImage = textures.get(textureKey).getSourceImage();

    // Cache template canvases on the dynamicTexture object so they persist cleanly
    if (!dynamicTexture.bgCanvas || !dynamicTexture.fillCanvas) {
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = 800;
      bgCanvas.height = 177;
      const bgCtx = bgCanvas.getContext('2d');

      // Draw the full graphic (frame, icon, borders) from the source PNG
      bgCtx.drawImage(sourceImage, 0, 0);

      // Stamp the empty slot across all 10 slots to create the empty background base
      const emptySx = SLOT_X_COORDS[sampleEmptyIndex];
      for (let i = 0; i < 10; i++) {
        bgCtx.drawImage(
          sourceImage,
          emptySx,
          SLOT_Y,
          SLOT_WIDTH,
          SLOT_HEIGHT,
          SLOT_X_COORDS[i],
          SLOT_Y,
          SLOT_WIDTH,
          SLOT_HEIGHT
        );
      }

      const fillCanvas = document.createElement('canvas');
      fillCanvas.width = 800;
      fillCanvas.height = 177;
      const fillCtx = fillCanvas.getContext('2d');

      // Stamp the filled segment across all 10 slots to ensure 100% full fill at max value
      const filledSx = SLOT_X_COORDS[sampleFilledIndex];
      for (let i = 0; i < 10; i++) {
        fillCtx.drawImage(
          sourceImage,
          filledSx,
          SLOT_Y,
          SLOT_WIDTH,
          SLOT_HEIGHT,
          SLOT_X_COORDS[i],
          SLOT_Y,
          SLOT_WIDTH,
          SLOT_HEIGHT
        );
      }

      dynamicTexture.bgCanvas = bgCanvas;
      dynamicTexture.fillCanvas = fillCanvas;
    }

    return dynamicTexture;
  }

  /**
   * Sets the status value.
   * Keeps numerical value immediately updated, and smoothly animates the visual reduction.
   *
   * @param {number} targetValue - Immediate numerical value
   * @param {number} max - Maximum capacity (default: 100)
   * @param {boolean} animate - Whether to animate smoothly
   */
  setValue(targetValue, max = 100, animate = true) {
    this.currentValue = Math.max(0, Math.min(max, targetValue));
    this.maxValue = max;

    if (!animate || !this.sceneRef || !this.sceneRef.tweens) {
      if (this.tween) {
        this.tween.stop();
        this.tween = null;
      }
      this.visualValue = this.currentValue;
      this.renderBar(this.visualValue, this.maxValue);
      return;
    }

    if (this.tween) {
      this.tween.stop();
    }

    this.tween = this.sceneRef.tweens.add({
      targets: this,
      visualValue: this.currentValue,
      duration: 320,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        this.renderBar(this.visualValue, this.maxValue);
      },
      onComplete: () => {
        this.visualValue = this.currentValue;
        this.renderBar(this.visualValue, this.maxValue);
        this.tween = null;
      },
    });
  }

  /**
   * Renders the bar onto the dynamic canvas:
   * 1. Draws the base HUD with dark empty slots.
   * 2. Calculates cutX position from visualValue.
   * 3. Draws active segments up to cutX so segments disappear strictly from right to left.
   *
   * @param {number} val
   * @param {number} max
   */
  renderBar(val, max = 100) {
    if (!this.bgCanvas || !this.fillCanvas || !this.canvasTexture) return;

    const ctx = this.canvasTexture.context;
    ctx.clearRect(0, 0, 800, 177);

    // 1. Draw base HUD (frame, icon, and all 10 dark empty slots)
    ctx.drawImage(this.bgCanvas, 0, 0);

    // 2. Smoothly interpolate cutX position
    const ratio = Math.max(0, Math.min(1, val / max));
    const segVal = ratio * 10;
    const lowerIdx = Math.min(9, Math.floor(segVal));
    const frac = segVal - lowerIdx;
    const cutX = SLOT_CUTOFFS[lowerIdx] + frac * (SLOT_CUTOFFS[lowerIdx + 1] - SLOT_CUTOFFS[lowerIdx]);

    // 3. Draw active segments up to cutX from left to right
    if (cutX > 0) {
      ctx.drawImage(this.fillCanvas, 0, 0, cutX, 177, 0, 0, cutX, 177);
    }

    this.canvasTexture.refresh();
  }

  /**
   * Updates position and scale responsively according to current screen dimensions.
   * Arranges bars vertically immediately below the preceding bar with consistent spacing.
   *
   * @param {number} screenWidth - Game canvas width
   * @param {number} screenHeight - Game canvas height
   * @param {number} barIndex - 0 for Health, 1 for Radiation, 2 for Hunger
   */
  updateLayout(screenWidth, screenHeight, barIndex = this.barIndex) {
    this.barIndex = barIndex;
    const marginX = Math.max(16, Math.min(28, screenWidth * 0.025));
    const marginY = Math.max(16, Math.min(24, screenHeight * 0.03));
    const targetWidth = Math.min(260, Math.max(170, screenWidth * 0.22));
    const scale = targetWidth / 800;

    const gap = Math.max(4, Math.round(6 * (scale / 0.28)));
    const yPos = marginY + barIndex * (177 * scale + gap);

    this.setScale(scale);
    this.setPosition(marginX, yPos);
  }

  destroy(fromScene) {
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }
    super.destroy(fromScene);
  }
}

export default StatusBarHUD;
