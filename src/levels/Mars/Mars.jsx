/* eslint-disable react-refresh/only-export-components */
import Phaser from 'phaser';
import marsBg from './Mars.png';
import outpostBg from '../Outpost/Outpost.png';
import roverSheet from './mars_rover_sprites_transparent.png';
import { SciFiButton } from '../../game/ui/SciFiButton.js';

/**
 * ============================================================================
 * MARS CONFIGURATION VARIABLES
 * Easily experiment with Mars gameplay, camera, and rover settings.
 * ============================================================================
 */
export const MARS_CONFIG = {
  MARS_VISIBLE_FRACTION: 0.30, // Fraction of Mars background visible at once (zoom level)
  ROVER_DISPLAY_HEIGHT: 80,     // Rendered on-screen height of the rover in pixels
  ROVER_SPEED: 150,             // Rover movement speed in world pixels per second
  ROVER_ANIMATION_FPS: 8,       // Frame rate for the 3-frame movement animations
  ROVER_SCREEN_X: 0.50,         // Normalized horizontal screen anchor (0.50 = center)
  ROVER_SCREEN_Y: 0.50,         // Normalized vertical screen anchor (0.50 = center)
};

// Direction to row-idle-frame mapping:
// Row 1: Facing LEFT (frames 0-2, idle: 0)
// Row 2: Facing RIGHT (frames 3-5, idle: 3)
// Row 3: Facing UP (frames 6-8, idle: 6)
// Row 4: Facing DOWN (frames 9-11, idle: 9)
const IDLE_FRAMES = {
  left: 0,
  right: 3,
  up: 6,
  down: 9,
};

export class MarsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MarsScene' });
    this.bg = null;
    this.rover = null;
    this.titleText = null;
    this.navButton = null;
    this.uiCamera = null;
    this.currentDirection = 'down';
    this.cursors = null;
    this.keys = null;
    this.minX = 0;
    this.maxX = 0;
    this.minY = 0;
    this.maxY = 0;
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
    // Programmatically extract rover 362x362 frames (4 rows x 3 cols = 12 frames)
    if (!this.textures.exists('mars-rover')) {
      this.load.spritesheet('mars-rover', roverSheet, {
        frameWidth: 362,
        frameHeight: 362,
      });
    }
  }

  create() {
    const { width, height } = this.scale;

    // 1. Register 3-frame movement animations for all 4 directions
    this.createAnimations();

    // 2. Add Background at world origin (0, 0) preserving original proportions
    this.bg = this.add.image(0, 0, 'mars-bg');
    this.bg.setOrigin(0, 0);
    this.bg.setScale(1);

    const bgWidth = this.bg.width;
    const bgHeight = this.bg.height;

    // 3. Create rover sprite centered in the Mars environment
    const startX = bgWidth * MARS_CONFIG.ROVER_SCREEN_X;
    const startY = bgHeight * MARS_CONFIG.ROVER_SCREEN_Y;
    this.currentDirection = 'down';

    // Initially use frame 0 of Row 4 (facing down, frame 9)
    this.rover = this.add.sprite(startX, startY, 'mars-rover', IDLE_FRAMES.down);
    this.rover.setOrigin(0.5, 0.5);

    // Pixel-art-friendly nearest-neighbour scaling
    if (this.rover.texture) {
      this.rover.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // 4. Setup keyboard controls (Arrow keys + WASD, case-insensitive)
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
      });
    }

    // 5. Create UI overlay (Title and Navigation Button)
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

    // 6. Setup dedicated 1:1 UI camera so buttons/text remain fixed on screen and crisp
    this.uiCamera = this.cameras.add(0, 0, width, height);
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.setZoom(1);

    // Main camera only renders game world; UI camera only renders UI elements
    this.cameras.main.ignore([this.titleText, this.navButton]);
    this.uiCamera.ignore([this.bg, this.rover]);

    // 7. Configure camera zoom, follow target, and boundary clamps
    this.updateCameraAndBounds(width, height);

    // 8. Fade in both cameras smoothly
    this.cameras.main.fadeIn(450, 0, 0, 0);
    this.uiCamera.fadeIn(450, 0, 0, 0);

    // Responsive resize handler
    this.onResize = (gameSize) => {
      this.updateCameraAndBounds(gameSize.width, gameSize.height);
    };
    this.scale.on('resize', this.onResize, this);

    // Cleanup when leaving Mars
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
      if (this.input.keyboard) {
        this.input.keyboard.removeAllKeys(true);
      }
      if (this.rover && this.rover.anims) {
        this.rover.anims.stop();
      }
    });
  }

  createAnimations() {
    // Row 1: Facing LEFT (frames 0-2)
    if (!this.anims.exists('rover-left')) {
      this.anims.create({
        key: 'rover-left',
        frames: this.anims.generateFrameNumbers('mars-rover', { start: 0, end: 2 }),
        frameRate: MARS_CONFIG.ROVER_ANIMATION_FPS,
        repeat: -1,
      });
    }

    // Row 2: Facing RIGHT (frames 3-5)
    if (!this.anims.exists('rover-right')) {
      this.anims.create({
        key: 'rover-right',
        frames: this.anims.generateFrameNumbers('mars-rover', { start: 3, end: 5 }),
        frameRate: MARS_CONFIG.ROVER_ANIMATION_FPS,
        repeat: -1,
      });
    }

    // Row 3: Facing UP (frames 6-8)
    if (!this.anims.exists('rover-up')) {
      this.anims.create({
        key: 'rover-up',
        frames: this.anims.generateFrameNumbers('mars-rover', { start: 6, end: 8 }),
        frameRate: MARS_CONFIG.ROVER_ANIMATION_FPS,
        repeat: -1,
      });
    }

    // Row 4: Facing DOWN (frames 9-11)
    if (!this.anims.exists('rover-down')) {
      this.anims.create({
        key: 'rover-down',
        frames: this.anims.generateFrameNumbers('mars-rover', { start: 9, end: 11 }),
        frameRate: MARS_CONFIG.ROVER_ANIMATION_FPS,
        repeat: -1,
      });
    }
  }

  updateCameraAndBounds(width, height) {
    if (!this.bg) return;

    const bgWidth = this.bg.width;
    const bgHeight = this.bg.height;

    // Calculate zoom from MARS_VISIBLE_FRACTION (ensuring aspect ratio is preserved)
    const fraction = Math.max(0.05, Math.min(1.0, MARS_CONFIG.MARS_VISIBLE_FRACTION));
    const targetZoomX = width / (bgWidth * fraction);
    const targetZoomY = height / (bgHeight * fraction);
    const zoom = Math.max(targetZoomX, targetZoomY);

    // Guarantee that no empty space outside the background is ever exposed
    const minZoom = Math.max(width / bgWidth, height / bgHeight);
    const effectiveZoom = Math.max(zoom, minZoom);

    this.cameras.main.setZoom(effectiveZoom);

    // Render rover at constant on-screen ROVER_DISPLAY_HEIGHT
    if (this.rover) {
      const roverScale = (MARS_CONFIG.ROVER_DISPLAY_HEIGHT / effectiveZoom) / 362;
      this.rover.setScale(roverScale);
    }

    // Calculate visible viewport dimensions in world coordinate units
    const visibleWorldW = width / effectiveZoom;
    const visibleWorldH = height / effectiveZoom;

    // Camera follow offset based on ROVER_SCREEN_X and ROVER_SCREEN_Y
    const screenAnchorX = MARS_CONFIG.ROVER_SCREEN_X;
    const screenAnchorY = MARS_CONFIG.ROVER_SCREEN_Y;
    const offsetX = (0.5 - screenAnchorX) * visibleWorldW;
    const offsetY = (0.5 - screenAnchorY) * visibleWorldH;

    this.cameras.main.startFollow(this.rover, true);
    this.cameras.main.setFollowOffset(offsetX, offsetY);

    // Precise boundaries: rover stops moving when background edge reaches screen edge
    this.minX = screenAnchorX * visibleWorldW;
    this.maxX = bgWidth - (1 - screenAnchorX) * visibleWorldW;
    this.minY = screenAnchorY * visibleWorldH;
    this.maxY = bgHeight - (1 - screenAnchorY) * visibleWorldH;

    // Re-clamp rover inside boundaries if window resized
    if (this.rover) {
      this.rover.x = Phaser.Math.Clamp(this.rover.x, this.minX, this.maxX);
      this.rover.y = Phaser.Math.Clamp(this.rover.y, this.minY, this.maxY);
    }

    // Update UI overlay positions
    if (this.uiCamera) {
      this.uiCamera.setSize(width, height);
    }
    if (this.titleText) {
      this.titleText.setPosition(width / 2, Math.max(36, height * 0.07));
    }
    if (this.navButton) {
      this.navButton.setPosition(width / 2, height - Math.max(54, height * 0.09));
    }
  }

  update(time, delta) {
    if (!this.rover) return;

    // Check keyboard movement keys (Arrow keys + WASD)
    const isUp = (this.keys && this.keys.W.isDown) || (this.cursors && this.cursors.up.isDown);
    const isDown = (this.keys && this.keys.S.isDown) || (this.cursors && this.cursors.down.isDown);
    const isLeft = (this.keys && this.keys.A.isDown) || (this.cursors && this.cursors.left.isDown);
    const isRight = (this.keys && this.keys.D.isDown) || (this.cursors && this.cursors.right.isDown);

    let vx = 0;
    let vy = 0;

    if (isUp) vy -= 1;
    if (isDown) vy += 1;
    if (isLeft) vx -= 1;
    if (isRight) vx += 1;

    if (vx !== 0 || vy !== 0) {
      // Determine dominant direction for animation
      let newDir = this.currentDirection;
      if (vy < 0) newDir = 'up';
      else if (vy > 0) newDir = 'down';
      else if (vx < 0) newDir = 'left';
      else if (vx > 0) newDir = 'right';

      this.currentDirection = newDir;
      this.rover.anims.play('rover-' + newDir, true);

      // Normalise diagonal speed
      let speed = MARS_CONFIG.ROVER_SPEED * (delta / 1000);
      if (vx !== 0 && vy !== 0) {
        speed *= Math.SQRT1_2;
      }

      // Move rover in world space (camera follows, so environment scrolls in opposite direction)
      // Clamped to background boundaries so empty space is never exposed
      const nextX = this.rover.x + vx * speed;
      const nextY = this.rover.y + vy * speed;

      this.rover.x = Phaser.Math.Clamp(nextX, this.minX, this.maxX);
      this.rover.y = Phaser.Math.Clamp(nextY, this.minY, this.maxY);
    } else {
      // When movement key is released: stop animation and stay on frame 0 of current direction
      if (this.rover.anims.isPlaying) {
        this.rover.anims.stop();
        this.rover.setFrame(IDLE_FRAMES[this.currentDirection]);
      }
    }
  }

  transitionToOutpost() {
    // Subtle fade-out transition
    this.cameras.main.fadeOut(400, 0, 0, 0);
    if (this.uiCamera) {
      this.uiCamera.fadeOut(400, 0, 0, 0);
    }
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('OutpostScene');
    });
  }
}

export default MarsScene;
