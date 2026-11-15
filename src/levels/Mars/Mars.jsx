/* eslint-disable react-refresh/only-export-components */
import Phaser from 'phaser';
import marsBg from './Mars.png';
import outpostBg from '../Outpost/Outpost.png';
import roverSheet from './mars_rover_sprites_transparent.png';
import martianRocksAsset from './Martian Rocks.png';
import { SciFiButton } from '../../game/ui/SciFiButton.js';
import batteryAsset from '../../game/ui/graphHUD/battery.png';
import droneHealthAsset from '../../game/ui/graphHUD/DroneHealth.png';
import oxygenAsset from '../../game/ui/graphHUD/Oxygen.png';
import waterAsset from '../../game/ui/graphHUD/Water.png';
import temperatureAsset from '../../game/ui/graphHUD/Temperature.png';
import timerAsset from '../../game/ui/graphHUD/Timer.png';
import { BatteryHUD, BATTERY_HUD_TEXTURE_KEY } from '../../game/ui/BatteryHUD.js';
import { DroneHealthHUD, DRONE_HEALTH_HUD_TEXTURE_KEY } from '../../game/ui/DroneHealthHUD.js';
import {
  EnvironmentalStatusHUD,
  ENV_HUD_TEXTURE_KEYS,
} from '../../game/ui/EnvironmentalStatusHUD.js';
import { GameMessageBar } from '../../game/ui/GameMessageBar.js';
import { Rock } from './Rock.js';
import { PowerComponent } from './PowerComponent.js';
import { DoubleStormModal } from '../../game/ui/DoubleStormModal.js';
import { marsEnvironmentalSimulator } from '../../simulation/marsEnvironmentalSimulator.js';
import { startDoubleStormEvent } from '../../game/events/doubleStormState.js';
import {
  MARTIAN_ROCKS_TEXTURE_KEY,
  ROCK_FRAMES,
  DEFAULT_ROCK_POSITIONS,
  PROXIMITY_CONFIG,
  ROVER_COLLISION_RADIUS,
} from './rockConfig.js';
import {
  reduceBattery, regainBattery, resetBattery, subscribeBattery, currentBattery, MAX_BATTERY,
  reduceDroneHealth, regainDroneHealth, resetDroneHealth, subscribeDroneHealth, currentDroneHealth, MAX_DRONE_HEALTH,
  showGameMessage, clearGameMessage, getCurrentGameMessage,
} from '../../game/gameState.js';

/**
 * ============================================================================
 * MARS CONFIGURATION VARIABLES
 * Easily experiment with Mars gameplay, camera, and rover settings.
 * ============================================================================
 */
export const MARS_CONFIG = {
  MARS_VISIBLE_FRACTION: 0.20, // Fraction of Mars background visible at once (zoom level)
  ROVER_DISPLAY_HEIGHT: 100,     // Rendered on-screen height of the rover in pixels
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
    this.batteryHud = null;
    this.droneHealthHud = null;
    this.environmentalHud = null;
    this.gameMessageBar = null;
    this.uiCamera = null;
    this.rocks = [];
    this.proximityDebugContainer = null;
    this.proximityDebugText = null;
    this.proximityDebugTimer = null;
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
    if (!this.textures.exists(BATTERY_HUD_TEXTURE_KEY)) {
      this.load.image(BATTERY_HUD_TEXTURE_KEY, batteryAsset);
    }
    if (!this.textures.exists(DRONE_HEALTH_HUD_TEXTURE_KEY)) {
      this.load.image(DRONE_HEALTH_HUD_TEXTURE_KEY, droneHealthAsset);
    }
    // Load Martian Rocks sprite sheet
    if (!this.textures.exists(MARTIAN_ROCKS_TEXTURE_KEY)) {
      this.load.image(MARTIAN_ROCKS_TEXTURE_KEY, martianRocksAsset);
    }
    // Load Environmental Status HUD assets (Oxygen, Water, Temperature, Timer)
    if (!this.textures.exists(ENV_HUD_TEXTURE_KEYS.OXYGEN)) {
      this.load.image(ENV_HUD_TEXTURE_KEYS.OXYGEN, oxygenAsset);
    }
    if (!this.textures.exists(ENV_HUD_TEXTURE_KEYS.WATER)) {
      this.load.image(ENV_HUD_TEXTURE_KEYS.WATER, waterAsset);
    }
    if (!this.textures.exists(ENV_HUD_TEXTURE_KEYS.TEMPERATURE)) {
      this.load.image(ENV_HUD_TEXTURE_KEYS.TEMPERATURE, temperatureAsset);
    }
    if (!this.textures.exists(ENV_HUD_TEXTURE_KEYS.TIMER)) {
      this.load.image(ENV_HUD_TEXTURE_KEYS.TIMER, timerAsset);
    }
  }

  create() {
    const { width, height } = this.scale;

    // Mars scene starts with full resources whenever returning from the Outpost.
    resetBattery();
    resetDroneHealth();

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

    // 3b. Register rock sprite frames & generate world-anchored rocks
    const rocksTexture = this.textures.get(MARTIAN_ROCKS_TEXTURE_KEY);
    if (rocksTexture) {
      for (const [key, def] of Object.entries(ROCK_FRAMES)) {
        if (!rocksTexture.has(key)) {
          rocksTexture.add(key, 0, def.x, def.y, def.width, def.height);
        }
      }
    }
    this.rocks = DEFAULT_ROCK_POSITIONS.map((pos) => new Rock(this, pos));

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

    this.batteryHud = new BatteryHUD(this);
    this.batteryHud.setValue(currentBattery, MAX_BATTERY, false);
    this.droneHealthHud = new DroneHealthHUD(this);
    this.droneHealthHud.setValue(currentDroneHealth, MAX_DRONE_HEALTH, false);

    // Environmental Status HUD (Top-Right: Oxygen, Water, Temperature, Timer)
    this.environmentalHud = new EnvironmentalStatusHUD(this);

    // Global Gameplay Message Bar (underneath scene title)
    this.gameMessageBar = new GameMessageBar(this);
    this.unsubscribeBattery = subscribeBattery((value, max) => {
      if (this.batteryHud) this.batteryHud.setValue(value, max, true);
    });
    this.unsubscribeDroneHealth = subscribeDroneHealth((value, max) => {
      if (this.droneHealthHud) this.droneHealthHud.setValue(value, max, true);
    });

    // Mars-only resource controls. Ignore key repeat so holding a key counts once.
    this.onResourceKeyDown = (event) => {
      if (event.repeat) return;
      if (event.code === 'KeyO' || event.key === 'o' || event.key === 'O') {
        this.reduceBattery(10);
      } else if (event.code === 'Digit9' || event.key === '9') {
        this.regainBattery(10);
      } else if (event.code === 'KeyP' || event.key === 'p' || event.key === 'P') {
        this.reduceDroneHealth(10);
      } else if (event.code === 'Digit0' || event.key === '0') {
        this.regainDroneHealth(10);
      } else if (event.code === 'KeyK' || event.key === 'k' || event.key === 'K') {
        startDoubleStormEvent();
      }
    };
    if (this.input.keyboard) this.input.keyboard.on('keydown', this.onResourceKeyDown);

    // Initialize environmental simulation layer
    marsEnvironmentalSimulator.start();
    marsEnvironmentalSimulator.setSceneContext('Mars', true);

    // Outdoor physical Power Component for EVA retrieval objective
    this.powerComponent = new PowerComponent(this);

    // Double Storm decision interface modal
    this.doubleStormModal = new DoubleStormModal(this);

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

    // 6b. Setup temporary proximity event debug badge on UI overlay
    this.createProximityDebugBadge(width, height);

    // Main camera only renders game world; UI camera only renders UI elements
    this.cameras.main.ignore([
      this.titleText,
      this.navButton,
      this.batteryHud,
      this.droneHealthHud,
      this.proximityDebugContainer,
      this.environmentalHud,
      this.gameMessageBar,
      this.doubleStormModal,
    ]);
    this.uiCamera.ignore([this.bg, this.rover, ...this.rocks, this.powerComponent]);

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
        this.input.keyboard.off('keydown', this.onResourceKeyDown);
        this.input.keyboard.removeAllKeys(true);
      }
      if (this.unsubscribeBattery) {
        this.unsubscribeBattery();
        this.unsubscribeBattery = null;
      }
      if (this.unsubscribeDroneHealth) {
        this.unsubscribeDroneHealth();
        this.unsubscribeDroneHealth = null;
      }
      if (this.proximityDebugTimer) {
        this.proximityDebugTimer.remove(false);
        this.proximityDebugTimer = null;
      }
      this.batteryHud = null;
      this.droneHealthHud = null;
      if (this.environmentalHud) {
        this.environmentalHud.destroy();
        this.environmentalHud = null;
      }
      if (this.gameMessageBar) {
        this.gameMessageBar.destroy();
        this.gameMessageBar = null;
      }
      if (this.powerComponent) {
        this.powerComponent.destroy();
        this.powerComponent = null;
      }
      if (this.doubleStormModal) {
        this.doubleStormModal.destroy();
        this.doubleStormModal = null;
      }
      this.rocks = [];
      this.proximityDebugContainer = null;
      this.proximityDebugText = null;
      if (this.rover && this.rover.anims) {
        this.rover.anims.stop();
      }
    });
  }

  reduceBattery(amount) {
    return reduceBattery(amount);
  }

  regainBattery(amount) {
    return regainBattery(amount);
  }

  reduceDroneHealth(amount) {
    return reduceDroneHealth(amount);
  }

  regainDroneHealth(amount) {
    return regainDroneHealth(amount);
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
    if (this.batteryHud) this.batteryHud.updateLayout(width, height, 0);
    if (this.droneHealthHud) this.droneHealthHud.updateLayout(width, height, 1);
    if (this.environmentalHud) this.environmentalHud.updateLayout(width, height);
    if (this.gameMessageBar) {
      this.gameMessageBar.updateLayout(width, height, this.titleText.y);
    }
    if (this.proximityDebugContainer) {
      this.proximityDebugContainer.setPosition(width / 2, Math.max(116, height * 0.17));
    }
  }

  createProximityDebugBadge(width, height) {
    const container = this.add.container(width / 2, Math.max(116, height * 0.17));
    container.setDepth(1000);

    const bg = this.add.graphics();
    const w = 150;
    const h = 28;
    const r = 6;

    bg.lineStyle(2, 0xff7b39, 0.4);
    bg.strokeRoundedRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2, r);

    bg.fillStyle(0x090c13, 0.85);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    bg.lineStyle(1, 0xff9452, 0.9);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    const text = this.add.text(0, 0, '', {
      fontFamily: "'Rajdhani', 'Orbitron', 'Segoe UI', system-ui, sans-serif",
      fontSize: '13px',
      fontStyle: '700',
      color: '#ffece0',
      align: 'center',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);
    container.setVisible(false);
    container.setAlpha(0);

    this.proximityDebugContainer = container;
    this.proximityDebugText = text;
  }

  showProximityDebug(message) {
    if (!this.proximityDebugContainer || !this.proximityDebugText) return;
    this.proximityDebugText.setText(message);
    this.proximityDebugContainer.setAlpha(1);
    this.proximityDebugContainer.setVisible(true);

    if (this.proximityDebugTimer) {
      this.proximityDebugTimer.remove(false);
      this.proximityDebugTimer = null;
    }

    this.proximityDebugTimer = this.time.delayedCall(PROXIMITY_CONFIG.debugDuration, () => {
      if (!this.proximityDebugContainer) return;
      this.tweens.add({
        targets: this.proximityDebugContainer,
        alpha: 0,
        duration: 250,
        onComplete: () => {
          if (this.proximityDebugContainer) {
            this.proximityDebugContainer.setVisible(false);
          }
        },
      });
    });
  }

  showGameMessage(msg) {
    return showGameMessage(msg);
  }

  clearGameMessage() {
    return clearGameMessage();
  }

  getCurrentGameMessage() {
    return getCurrentGameMessage();
  }

  onRockNearby(rock) {
    // Reusable proximity event hook: called once when rover approaches a rock
    // Active while rover remains inside proximity zone
    // Left empty for now as requested
    void rock;
  }

  onRockNearbyEnd(rock) {
    // Reusable proximity event hook: called once when rover leaves a rock's proximity zone
    // Left empty for now as requested
    void rock;
  }

  checkRockCollision(roverX, roverY) {
    for (let i = 0; i < this.rocks.length; i++) {
      if (this.rocks[i].checkCollision(roverX, roverY, ROVER_COLLISION_RADIUS)) {
        return true;
      }
    }
    return false;
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

      // Move rover in world space with axis-independent collision checking
      // Clamped to background boundaries so empty space is never exposed
      let nextX = this.rover.x;
      let nextY = this.rover.y;

      if (vx !== 0) {
        const candidateX = Phaser.Math.Clamp(this.rover.x + vx * speed, this.minX, this.maxX);
        if (!this.checkRockCollision(candidateX, this.rover.y)) {
          nextX = candidateX;
        }
      }

      if (vy !== 0) {
        const candidateY = Phaser.Math.Clamp(this.rover.y + vy * speed, this.minY, this.maxY);
        if (!this.checkRockCollision(nextX, candidateY)) {
          nextY = candidateY;
        }
      }

      this.rover.x = nextX;
      this.rover.y = nextY;
    } else {
      // When movement key is released: stop animation and stay on frame 0 of current direction
      if (this.rover.anims.isPlaying) {
        this.rover.anims.stop();
        this.rover.setFrame(IDLE_FRAMES[this.currentDirection]);
      }
    }

    // Dynamic depth sorting based on Y position so rover renders behind or in front of rocks
    this.rover.setDepth(this.rover.y);

    // Power component proximity check
    if (this.powerComponent) {
      this.powerComponent.checkProximity(this.rover.x, this.rover.y);
    }

    // Proximity event detection for every rock (relative to solid hitbox)
    for (let i = 0; i < this.rocks.length; i++) {
      const rock = this.rocks[i];
      const inRange = rock.checkProximity(this.rover.x, this.rover.y, PROXIMITY_CONFIG.hitboxMargin);

      if (inRange) {
        if (!rock.isNearby) {
          rock.isNearby = true;
          this.onRockNearby(rock);
          this.showProximityDebug('ROCK NEARBY');
        }
      } else {
        if (rock.isNearby) {
          rock.isNearby = false;
          this.onRockNearbyEnd(rock);
          this.showProximityDebug('ROCK LEFT');
        }
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
