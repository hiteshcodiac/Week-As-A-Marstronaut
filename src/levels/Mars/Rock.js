import Phaser from 'phaser';
import {
  MARTIAN_ROCKS_TEXTURE_KEY,
  ROCK_FRAMES,
  PROXIMITY_CONFIG,
  ROVER_COLLISION_RADIUS,
} from './rockConfig.js';

/**
 * Rock
 * Reusable environmental Martian rock GameObject.
 * Anchored to Mars world coordinates, blocks the rover with solid physical collision,
 * and maintains independent proximity state for nearby events.
 */
export class Rock extends Phaser.GameObjects.Sprite {
  constructor(scene, config) {
    super(scene, config.x, config.y, MARTIAN_ROCKS_TEXTURE_KEY, config.sprite);

    this.id = config.id;
    this.section = config.section;
    this.variantKey = config.sprite;
    this.rockScale = config.scale || 0.40;
    this.isNearby = false;

    this.setScale(this.rockScale);
    this.setOrigin(0.5, 0.5);

    // Pixel-art friendly nearest-neighbour filtering
    if (this.texture) {
      this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // Depth sorting based on world Y position
    this.setDepth(config.y);

    scene.add.existing(this);
  }

  /**
   * Returns world-coordinate boundaries of the rock's solid collision hitbox.
   * Tightened hitbox specifically matching the solid base of the rock.
   * @returns {{ left: number, right: number, top: number, bottom: number }}
   */
  getHitbox() {
    const frameDef = ROCK_FRAMES[this.variantKey] || {
      width: this.width,
      height: this.height,
      hitboxWidthFactor: 0.58,
      hitboxHeightFactor: 0.42,
      offsetY: 0,
    };

    const w = frameDef.width * this.rockScale * (frameDef.hitboxWidthFactor || 0.58);
    const h = frameDef.height * this.rockScale * (frameDef.hitboxHeightFactor || 0.42);
    const offsetY = (frameDef.offsetY || 0) * this.rockScale;

    const cx = this.x;
    const cy = this.y + offsetY;
    const hw = w / 2;
    const hh = h / 2;

    return {
      left: cx - hw,
      right: cx + hw,
      top: cy - hh,
      bottom: cy + hh,
    };
  }

  /**
   * Checks whether the rover collides with this rock's solid base hitbox.
   *
   * @param {number} roverX
   * @param {number} roverY
   * @param {number} roverRadius
   * @returns {boolean}
   */
  checkCollision(roverX, roverY, roverRadius = ROVER_COLLISION_RADIUS) {
    const hb = this.getHitbox();
    const closestX = Phaser.Math.Clamp(roverX, hb.left, hb.right);
    const closestY = Phaser.Math.Clamp(roverY, hb.top, hb.bottom);
    const dx = roverX - closestX;
    const dy = roverY - closestY;
    return dx * dx + dy * dy < roverRadius * roverRadius;
  }

  /**
   * Checks if rover is within this rock's proximity detection boundary.
   * Triggers directly relative to the rock's solid hitbox edges rather than center,
   * allowing proximity to trigger naturally close to the rock surface.
   *
   * @param {number} roverX
   * @param {number} roverY
   * @param {number} margin
   * @returns {boolean}
   */
  checkProximity(roverX, roverY, margin = PROXIMITY_CONFIG.hitboxMargin) {
    const hb = this.getHitbox();
    const closestX = Phaser.Math.Clamp(roverX, hb.left, hb.right);
    const closestY = Phaser.Math.Clamp(roverY, hb.top, hb.bottom);
    const dx = roverX - closestX;
    const dy = roverY - closestY;
    return dx * dx + dy * dy <= margin * margin;
  }
}

export default Rock;
