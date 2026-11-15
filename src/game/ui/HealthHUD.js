import Phaser from 'phaser';

export const HEALTH_HUD_TEXTURE_KEY = 'health-hud';
export const HEALTH_HUD_DYNAMIC_KEY = 'health-hud-dynamic';

/**
 * Pixel coordinates measured directly from Health.png (800x177):
 * 10 segments total, each ~38px wide with 4-5px gaps.
 * Pitch = ~42.1px between segment starts.
 * Segment 1 starts at x=304, Segment 10 ends at x=720.
 */
const SLOT_X_COORDS = [304, 346, 388, 430, 472, 515, 557, 599, 641, 683];
const SLOT_WIDTH = 38;
const SLOT_HEIGHT = 55;
const SLOT_Y = 70;

// Cutoff X positions for 0 to 10 active segments (disappearing RIGHT to LEFT)
const SLOT_CUTOFFS = [0, 344, 386, 428, 470, 513, 555, 597, 639, 681, 722];

/**
 * HealthHUD
 * Dynamic screen-space Health HUD element for displaying the segmented health bar graphic.
 * Preserves original design, colors, proportions, and alpha transparency from Health.png.
 * Displays dark empty segments underneath as red segments deplete from right to left.
 */
export class HealthHUD extends Phaser.GameObjects.Image {
  constructor(scene, x = 0, y = 0) {
    const canvasTexture = HealthHUD.initTextures(scene);
    super(scene, x, y, canvasTexture.key);

    this.sceneRef = scene;
    this.canvasTexture = canvasTexture;
    this.setOrigin(0, 0);
    this.setScrollFactor(0);

    // Initial render at 100% health
    this.setHealth(100, 100);

    scene.add.existing(this);
  }

  /**
   * Generates offscreen template canvases from Health.png:
   * - bgCanvas: Full HUD with all 10 slots rendered in dark empty state.
   * - fillCanvas: All 10 slots rendered with vibrant red segment fills.
   *
   * @param {Phaser.Scene} scene
   * @returns {Phaser.Textures.CanvasTexture}
   */
  static initTextures(scene) {
    const textures = scene.textures;

    if (!textures.exists(HEALTH_HUD_DYNAMIC_KEY)) {
      textures.createCanvas(HEALTH_HUD_DYNAMIC_KEY, 800, 177);
    }

    const dynamicTexture = textures.get(HEALTH_HUD_DYNAMIC_KEY);
    const sourceImage = textures.get(HEALTH_HUD_TEXTURE_KEY).getSourceImage();

    // Prepare bgCanvas (empty slots backing) and fillCanvas (red segments overlay)
    if (!HealthHUD.bgCanvas || !HealthHUD.fillCanvas) {
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = 800;
      bgCanvas.height = 177;
      const bgCtx = bgCanvas.getContext('2d');

      // Draw the complete frame & graphics from original Health.png
      bgCtx.drawImage(sourceImage, 0, 0);

      // In Health.png, Slot 10 (at x=683) is the native dark empty slot.
      // Stamp Slot 10's dark empty graphic across slots 1 to 9 (indices 0 to 8).
      for (let i = 0; i < 9; i++) {
        bgCtx.drawImage(
          sourceImage,
          SLOT_X_COORDS[9],
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

      // Slots 1 through 9 are native red segments in Health.png
      for (let i = 0; i < 9; i++) {
        fillCtx.drawImage(
          sourceImage,
          SLOT_X_COORDS[i],
          SLOT_Y,
          SLOT_WIDTH,
          SLOT_HEIGHT,
          SLOT_X_COORDS[i],
          SLOT_Y,
          SLOT_WIDTH,
          SLOT_HEIGHT
        );
      }

      // Slot 10 gets the red segment copied from Slot 9 so 100 HP is completely full
      fillCtx.drawImage(
        sourceImage,
        SLOT_X_COORDS[8],
        SLOT_Y,
        SLOT_WIDTH,
        SLOT_HEIGHT,
        SLOT_X_COORDS[9],
        SLOT_Y,
        SLOT_WIDTH,
        SLOT_HEIGHT
      );

      HealthHUD.bgCanvas = bgCanvas;
      HealthHUD.fillCanvas = fillCanvas;
    }

    return dynamicTexture;
  }

  /**
   * Updates the visual health bar according to current HP / max HP.
   * Red segments disappear from right to left, revealing dark empty slots.
   *
   * @param {number} currentHp
   * @param {number} maxHp
   */
  setHealth(currentHp, maxHp = 100) {
    if (!HealthHUD.bgCanvas || !HealthHUD.fillCanvas || !this.canvasTexture) return;

    const ctx = this.canvasTexture.context;
    ctx.clearRect(0, 0, 800, 177);

    // 1. Draw base HUD (frame, health icon, and all 10 dark empty slots)
    ctx.drawImage(HealthHUD.bgCanvas, 0, 0);

    // 2. Calculate active red segments (0 to 10)
    const ratio = Math.max(0, Math.min(1, currentHp / maxHp));
    const activeSegments = Math.round(ratio * 10);
    const cutX = SLOT_CUTOFFS[activeSegments];

    // 3. Draw active red segments from left to right (so rightmost segments disappear first)
    if (cutX > 0) {
      ctx.drawImage(HealthHUD.fillCanvas, 0, 0, cutX, 177, 0, 0, cutX, 177);
    }

    this.canvasTexture.refresh();
  }

  /**
   * Updates position and scale responsively according to current screen dimensions.
   * Keeps the health bar near the top-left corner with comfortable margins
   * while strictly preserving its exact aspect ratio.
   *
   * @param {number} screenWidth - Game canvas width
   * @param {number} screenHeight - Game canvas height
   */
  updateLayout(screenWidth, screenHeight) {
    const marginX = Math.max(16, Math.min(28, screenWidth * 0.025));
    const marginY = Math.max(16, Math.min(24, screenHeight * 0.03));
    const targetWidth = Math.min(260, Math.max(170, screenWidth * 0.22));
    const scale = targetWidth / 800;

    this.setScale(scale);
    this.setPosition(marginX, marginY);
  }
}

export default HealthHUD;
