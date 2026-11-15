import Phaser from 'phaser';

/**
 * ============================================================================
 * PLANTER CONFIGURATION
 * Easily adjust positions, scales, hitboxes, and proximity radii for both planters.
 * ============================================================================
 */
export const PLANTER_CONFIG = {
  TEXTURE_KEY: 'planter-plants',

  // Left Planter: Positioned at the extreme left of the Outpost environment
  LEFT: {
    x: 120,
    y: 420,
    scale: 0.22,
    hitbox: {
      width: 140,
      height: 62,
      offsetX: 0,
      offsetY: 12,
    },
    proximityRadius: 95,
  },

  // Right Planter: Positioned at the extreme right of the Outpost environment
  RIGHT: {
    x: 904,
    y: 420,
    scale: 0.22,
    hitbox: {
      width: 140,
      height: 62,
      offsetX: 0,
      offsetY: 12,
    },
    proximityRadius: 95,
  },

  // Astronaut collision hitbox settings for obstacle resolution
  PLAYER_COLLISION: {
    radius: 14,
    offsetY: 18, // Feet offset relative to player center
  },

  // Proximity interaction popup visual settings
  POPUP: {
    width: 36,
    height: 22,
    offsetY: -48, // Offset above player head in world units
    bgColor: 0x060f18,
    bgAlpha: 0.85,
    borderColor: 0x4deeea,
    glowColor: 0x0099ff,
  },
};

/**
 * Planter
 * Reusable environmental hydroponic planter obstacle.
 * Exists in world space, scrolls naturally with the camera, blocks player movement,
 * and detects proximity for interaction popups.
 */
export class Planter extends Phaser.GameObjects.Container {
  constructor(scene, config) {
    super(scene, config.x, config.y);

    this.config = config;
    this.sprite = scene.add.image(0, 0, PLANTER_CONFIG.TEXTURE_KEY);
    this.sprite.setScale(config.scale || 0.22);
    this.sprite.setOrigin(0.5, 0.5);

    // Pixel-art friendly filtering
    if (this.sprite.texture) {
      this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    this.add(this.sprite);

    // Depth sorting based on world Y coordinate so player renders properly around it
    this.setDepth(config.y);

    scene.add.existing(this);
  }

  /**
   * Returns world-coordinate boundaries of the collision hitbox.
   * @returns {{ left: number, right: number, top: number, bottom: number }}
   */
  getHitbox() {
    const hb = this.config.hitbox;
    const cx = this.x + (hb.offsetX || 0);
    const cy = this.y + (hb.offsetY || 0);
    const hw = hb.width / 2;
    const hh = hb.height / 2;
    return {
      left: cx - hw,
      right: cx + hw,
      top: cy - hh,
      bottom: cy + hh,
    };
  }

  /**
   * Checks whether a circle (e.g. player base) collides with the planter's solid hitbox.
   *
   * @param {number} playerX
   * @param {number} playerY
   * @param {number} radius
   * @returns {boolean}
   */
  checkCollision(playerX, playerY, radius = 14) {
    const hb = this.getHitbox();
    const closestX = Phaser.Math.Clamp(playerX, hb.left, hb.right);
    const closestY = Phaser.Math.Clamp(playerY, hb.top, hb.bottom);
    const dx = playerX - closestX;
    const dy = playerY - closestY;
    return dx * dx + dy * dy < radius * radius;
  }

  /**
   * Checks if player is within the proximity interaction radius.
   *
   * @param {number} playerX
   * @param {number} playerY
   * @returns {boolean}
   */
  checkProximity(playerX, playerY) {
    const radius = this.config.proximityRadius || 95;
    const dist = Phaser.Math.Distance.Between(playerX, playerY, this.x, this.y);
    return dist <= radius;
  }
}

export default Planter;
