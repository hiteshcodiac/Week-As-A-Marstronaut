import Phaser from 'phaser';
import { getCurrentGameMessage, subscribeGameMessage } from '../gameState.js';
import { ENV_HUD_CONFIG } from './EnvironmentalStatusHUD.js';

/**
 * ============================================================================
 * GLOBAL GAMEPLAY MESSAGE BAR CONFIGURATION
 * ============================================================================
 * Easily adjust height, vertical offset, margins, colors, and typography.
 */
export const MESSAGE_BAR_CONFIG = {
  // Height of the horizontal rectangular message box (in screen pixels)
  height: 30,

  // Vertical offset below the scene title center (in screen pixels)
  offsetBelowTitle: 28,

  // Minimum vertical Y position on screen
  minY: 68,

  // Left margin / clearance to ensure no overlap with left HUDs (Health, Hunger, Radiation, Battery, Drone Health)
  leftMargin: 250,

  // Clearance margin to the left of the top-right Environmental Status HUD
  rightMarginFromEnvHUD: 20,

  // Fallback right margin if no right HUD is present
  fallbackRightMargin: 24,

  // Minimum width constraint
  minWidth: 160,

  // Translucent background visual styling
  bgColor: 0x090f18, // Deep space charcoal / translucent dark grey
  bgAlpha: 0.72,     // Partially transparent so game world is visible behind it
  borderColor: 0x3d5a73, // Subtle, soft futuristic outline
  borderAlpha: 0.80,
  borderWidth: 1,
  borderRadius: 5,   // Soft rounded corners

  // Text styling
  textColor: '#fff5ea', // Light cream / white
  fontSize: 13,
  fontFamily: "'Rajdhani', 'Orbitron', 'Segoe UI', system-ui, sans-serif",
  fontWeight: '600',
  paddingX: 14,
};

/**
 * GameMessageBar
 * Reusable screen-space horizontal gameplay message bar displayed directly below
 * the Mars or Outpost scene title. Extends horizontally without overlapping
 * existing top-left or top-right HUD elements, and dynamically displays messages
 * broadcasted via showGameMessage().
 */
export class GameMessageBar extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);

    this.sceneRef = scene;
    this.currentWidth = 400;
    this.currentHeight = MESSAGE_BAR_CONFIG.height;

    this.setScrollFactor(0);
    this.setDepth(1400); // Fixed screen space, above world background

    // Background graphics for the translucent box & subtle futuristic outline
    this.bgGraphics = scene.add.graphics();
    this.add(this.bgGraphics);

    // Text display element inside the message bar
    this.messageText = scene.add.text(0, 0, '', {
      fontFamily: MESSAGE_BAR_CONFIG.fontFamily,
      fontSize: `${MESSAGE_BAR_CONFIG.fontSize}px`,
      fontStyle: MESSAGE_BAR_CONFIG.fontWeight,
      color: MESSAGE_BAR_CONFIG.textColor,
      align: 'center',
    });
    this.messageText.setOrigin(0.5, 0.5);
    this.messageText.setShadow(0, 1, 'rgba(0, 0, 0, 0.85)', 3, false, true);
    this.add(this.messageText);

    // Subscribe to centralized message changes
    this.unsubscribe = subscribeGameMessage((msg) => {
      this.setMessage(msg);
    });

    // Populate current persistent message (or empty string if none)
    this.setMessage(getCurrentGameMessage());

    scene.add.existing(this);
  }

  /**
   * Sets the displayed message text.
   * If text is empty, the translucent rectangular box remains fully visible.
   *
   * @param {string} text
   */
  setMessage(text) {
    const content = typeof text === 'string' ? text : String(text ?? '');
    this.messageText.setText(content);
  }

  /**
   * Redraws the translucent rectangular box and border to match the target dimensions.
   *
   * @param {number} width
   * @param {number} height
   */
  drawBox(width, height) {
    this.currentWidth = width;
    this.currentHeight = height;

    this.bgGraphics.clear();

    const w = width;
    const h = height;
    const r = MESSAGE_BAR_CONFIG.borderRadius;

    // Outer subtle outline
    this.bgGraphics.lineStyle(
      MESSAGE_BAR_CONFIG.borderWidth,
      MESSAGE_BAR_CONFIG.borderColor,
      MESSAGE_BAR_CONFIG.borderAlpha
    );
    this.bgGraphics.fillStyle(MESSAGE_BAR_CONFIG.bgColor, MESSAGE_BAR_CONFIG.bgAlpha);
    this.bgGraphics.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    this.bgGraphics.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    // Subtle edge highlight at top border for high-tech finish
    this.bgGraphics.lineStyle(1, 0x8cb4d6, 0.25);
    this.bgGraphics.beginPath();
    this.bgGraphics.moveTo(-w / 2 + r, -h / 2);
    this.bgGraphics.lineTo(w / 2 - r, -h / 2);
    this.bgGraphics.strokePath();

    // Adjust word wrapping
    const maxTextW = Math.max(80, w - MESSAGE_BAR_CONFIG.paddingX * 2);
    this.messageText.setWordWrapWidth(maxTextW, true);
  }

  /**
   * Updates position and width dynamically to accommodate different screen sizes.
   * Guarantees that the bar sits directly below the title and never overlaps
   * the Environmental Status HUD in the top-right corner.
   *
   * @param {number} screenWidth
   * @param {number} screenHeight
   * @param {number} [titleY]
   */
  updateLayout(screenWidth, screenHeight, titleY) {
    const tY = titleY !== undefined ? titleY : Math.max(36, screenHeight * 0.07);
    const barY = Math.max(MESSAGE_BAR_CONFIG.minY, tY + MESSAGE_BAR_CONFIG.offsetBelowTitle);

    // 1. Left boundary: clear left-side status HUDs
    const leftBound = Math.max(
      MESSAGE_BAR_CONFIG.leftMargin,
      screenWidth * 0.22 + 30
    );

    // 2. Right boundary: strictly avoid overlapping top-right Environmental HUD
    const envMarginRight = Math.max(12, Math.min(ENV_HUD_CONFIG.marginRight, screenWidth * 0.025));
    const envItemWidth = Math.min(
      ENV_HUD_CONFIG.baseWidth,
      Math.max(120, screenWidth * 0.17)
    );
    const envHudLeft = screenWidth - envMarginRight - envItemWidth;
    const rightBound = envHudLeft - MESSAGE_BAR_CONFIG.rightMarginFromEnvHUD;

    // 3. Compute available horizontal span
    const barWidth = Math.max(MESSAGE_BAR_CONFIG.minWidth, rightBound - leftBound);
    const barCenterX = leftBound + barWidth / 2;

    this.setPosition(barCenterX, barY);
    this.drawBox(barWidth, MESSAGE_BAR_CONFIG.height);
  }

  /**
   * Cleans up subscriptions and resources when destroyed.
   */
  destroy(fromScene) {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    super.destroy(fromScene);
  }
}

export default GameMessageBar;
