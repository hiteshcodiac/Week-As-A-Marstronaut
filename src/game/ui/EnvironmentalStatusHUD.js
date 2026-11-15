import Phaser from 'phaser';
import { getEnvironmentalStats, subscribeEnvironmental } from '../gameState.js';

export const ENV_HUD_TEXTURE_KEYS = {
  OXYGEN: 'env-hud-oxygen',
  WATER: 'env-hud-water',
  TEMPERATURE: 'env-hud-temperature',
  TIMER: 'env-hud-timer',
};

/**
 * ============================================================================
 * ENVIRONMENTAL HUD CONFIGURATION
 * Easily adjust right margin, top margin, element spacing, overall scale,
 * and individual text offsets, font size, and colors.
 * ============================================================================
 */
export const ENV_HUD_CONFIG = {
  // Margin from top-right corner of screen (in pixels)
  marginRight: 20,
  marginTop: 18,

  // Vertical spacing between consecutive HUD elements (in pixels)
  verticalSpacing: 10,

  // Overall rendered width of each HUD item in screen pixels
  baseWidth: 200,

  // Individual element visual configurations
  elements: {
    oxygen: {
      textureKey: ENV_HUD_TEXTURE_KEYS.OXYGEN,
      naturalWidth: 350,
      naturalHeight: 133,
      // Target blank number area to the left of "%" (x: 148..254, cx ≈ 201; y: 56..90, cy ≈ 74)
      boxRatioX: 201 / 350,
      boxRatioY: 74 / 133,
      format: (val) => `${val}`,
      fontSize: 32,
      color: '#fff3e6',
      fontWeight: '700',
      letterSpacing: '1px',
    },
    water: {
      textureKey: ENV_HUD_TEXTURE_KEYS.WATER,
      naturalWidth: 322,
      naturalHeight: 137,
      // Target blank number area to the left of "L" (x: 126..241, cx ≈ 184; y: 56..99, cy ≈ 77)
      boxRatioX: 184 / 322,
      boxRatioY: 77 / 137,
      format: (val) => `${val}`,
      fontSize: 32,
      color: '#fff3e6',
      fontWeight: '700',
      letterSpacing: '1px',
    },
    temperature: {
      textureKey: ENV_HUD_TEXTURE_KEYS.TEMPERATURE,
      naturalWidth: 353,
      naturalHeight: 110,
      // Target blank number area to the left of "°C" (x: 125..230, cx ≈ 178; y: 52..84, cy ≈ 68)
      boxRatioX: 178 / 353,
      boxRatioY: 68 / 110,
      format: (val) => `${val}`,
      fontSize: 32,
      color: '#fff3e6',
      fontWeight: '700',
      letterSpacing: '1px',
    },
    timer: {
      textureKey: ENV_HUD_TEXTURE_KEYS.TIMER,
      naturalWidth: 333,
      naturalHeight: 118,
      // Target blank timer area across lower box (x: 140..305, cx ≈ 223; y: 48..88, cy ≈ 68)
      boxRatioX: 223 / 333,
      boxRatioY: 68 / 118,
      format: (val) => `${val}`,
      fontSize: 32,
      color: '#fff3e6',
      fontWeight: '700',
      letterSpacing: '1px',
    },
  },
};

/**
 * EnvironmentalStatusHUD
 * Reusable composite HUD component containing Oxygen, Water, Temperature, and Timer.
 * Fixed to the top-right corner of the screen, completely immune to camera movement,
 * and maintains accurate text layering over the designated blank area.
 */
export class EnvironmentalStatusHUD extends Phaser.GameObjects.Container {
  constructor(scene, x = 0, y = 0) {
    super(scene, x, y);
    this.sceneRef = scene;
    this.setScrollFactor(0);
    this.setDepth(1500);

    // Create item containers for each status metric
    this.items = {};
    const order = ['oxygen', 'water', 'temperature', 'timer'];

    for (const key of order) {
      const cfg = ENV_HUD_CONFIG.elements[key];
      const itemContainer = scene.add.container(0, 0);

      // Background PNG image
      const sprite = scene.add.image(0, 0, cfg.textureKey);
      sprite.setOrigin(0, 0);

      // Pixel-art friendly / sharp filtering
      if (sprite.texture) {
        sprite.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }

      // Transparent dynamic text element layered over the blank area
      const text = scene.add.text(
        cfg.naturalWidth * cfg.boxRatioX,
        cfg.naturalHeight * cfg.boxRatioY,
        '',
        {
          fontFamily: "'Rajdhani', 'Orbitron', 'Segoe UI', system-ui, sans-serif",
          fontSize: `${cfg.fontSize}px`,
          fontStyle: cfg.fontWeight || '700',
          color: cfg.color || '#fff3e6',
          align: 'center',
        }
      );
      text.setOrigin(0.5, 0.5);
      text.setShadow(0, 1, 'rgba(0, 0, 0, 0.9)', 3, false, true);

      itemContainer.add([sprite, text]);
      this.add(itemContainer);

      this.items[key] = {
        container: itemContainer,
        sprite,
        text,
        config: cfg,
      };
    }

    // Subscribe to centralized environmental updates
    this.unsubscribe = subscribeEnvironmental((stats) => {
      this.updateValues(stats);
    });

    // Populate initial values
    this.updateValues(getEnvironmentalStats());

    scene.add.existing(this);
  }

  /**
   * Updates the displayed text for all 4 environmental metrics.
   * @param {object} stats - { oxygen, water, temperature, timer }
   */
  updateValues(stats) {
    if (!stats) return;

    if (this.items.oxygen && stats.oxygen !== undefined) {
      this.items.oxygen.text.setText(this.items.oxygen.config.format(stats.oxygen));
    }
    if (this.items.water && stats.water !== undefined) {
      this.items.water.text.setText(this.items.water.config.format(stats.water));
    }
    if (this.items.temperature && stats.temperature !== undefined) {
      this.items.temperature.text.setText(this.items.temperature.config.format(stats.temperature));
    }
    if (this.items.timer && stats.timer !== undefined) {
      this.items.timer.text.setText(this.items.timer.config.format(stats.timer));
    }
  }

  /**
   * Positions and scales the HUD in the top-right corner responsively.
   *
   * @param {number} screenWidth
   * @param {number} screenHeight
   */
  updateLayout(screenWidth, screenHeight) {
    void screenHeight;

    // Responsive scaling based on viewport width
    const targetItemWidth = Math.min(
      ENV_HUD_CONFIG.baseWidth,
      Math.max(120, screenWidth * 0.17)
    );

    const marginRight = Math.max(12, Math.min(ENV_HUD_CONFIG.marginRight, screenWidth * 0.025));
    const marginTop = Math.max(12, Math.min(ENV_HUD_CONFIG.marginTop, screenHeight * 0.03));
    const spacing = ENV_HUD_CONFIG.verticalSpacing;

    // Anchor entire HUD to top-right
    const originX = screenWidth - marginRight - targetItemWidth;
    let currentY = marginTop;

    const order = ['oxygen', 'water', 'temperature', 'timer'];
    for (const key of order) {
      const item = this.items[key];
      if (!item) continue;

      const scale = targetItemWidth / item.config.naturalWidth;
      item.container.setScale(scale);
      item.container.setPosition(0, currentY - marginTop);

      const itemRenderedHeight = item.config.naturalHeight * scale;
      currentY += itemRenderedHeight + spacing;
    }

    this.setPosition(originX, marginTop);
  }

  /**
   * Cleans up listener subscriptions when the HUD is destroyed or scene shuts down.
   */
  destroy(fromScene) {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    super.destroy(fromScene);
  }
}

export default EnvironmentalStatusHUD;
