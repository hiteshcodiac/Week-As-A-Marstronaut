/* eslint-disable react-refresh/only-export-components */
import Phaser from 'phaser';
import outpostBg from './Outpost.png';
import marsBg from '../Mars/Mars.png';
import astronautSheet from './Astronaut Pixel Art Walk Cycle Sheet.png';
import plantsAsset from './plants.png';
import healthAsset from '../../game/ui/graphHUD/Health.png';
import radiationAsset from '../../game/ui/graphHUD/radiation.png';
import hungerAsset from '../../game/ui/graphHUD/hunger.png';
import oxygenAsset from '../../game/ui/graphHUD/Oxygen.png';
import waterAsset from '../../game/ui/graphHUD/Water.png';
import temperatureAsset from '../../game/ui/graphHUD/Temperature.png';
import timerAsset from '../../game/ui/graphHUD/Timer.png';
import { SciFiButton } from '../../game/ui/SciFiButton.js';
import { HealthHUD, HEALTH_HUD_TEXTURE_KEY } from '../../game/ui/HealthHUD.js';
import { RadiationHUD, RADIATION_HUD_TEXTURE_KEY } from '../../game/ui/RadiationHUD.js';
import { HungerHUD, HUNGER_HUD_TEXTURE_KEY } from '../../game/ui/HungerHUD.js';
import {
  EnvironmentalStatusHUD,
  ENV_HUD_TEXTURE_KEYS,
} from '../../game/ui/EnvironmentalStatusHUD.js';
import { GameMessageBar } from '../../game/ui/GameMessageBar.js';
import { Planter, PLANTER_CONFIG } from './Planter.js';
import {
  takeDamage,
  regainHealth,
  updateHealthBar,
  currentHealth,
  MAX_HEALTH,
  subscribeHealth,
  reduceRadiation,
  regainRadiation,
  updateRadiationBar,
  currentRadiation,
  MAX_RADIATION,
  subscribeRadiation,
  reduceHunger,
  regainHunger,
  updateHungerBar,
  currentHunger,
  MAX_HUNGER,
  subscribeHunger,
  showGameMessage,
  clearGameMessage,
  getCurrentGameMessage,
} from '../../game/gameState.js';

/**
 * ============================================================================
 * CONFIGURATION VARIABLES
 * Easily experiment with Outpost gameplay, camera, and astronaut settings.
 * ============================================================================
 */
export const OUTPOST_CONFIG = {
  OUTPOST_VISIBLE_FRACTION: 0.40, // Fraction of Outpost background visible at once (zoom level)
  PLAYER_DISPLAY_HEIGHT: 200,      // Rendered on-screen height of the astronaut in pixels
  PLAYER_SPEED: 200,              // Astronaut movement speed in world pixels per second
  WALK_ANIMATION_FPS: 10,         // Frame rate for the 8-frame walking cycle animations
  PLAYER_SCREEN_X: 0.50,          // Normalized horizontal screen anchor (0.50 = center)
  PLAYER_SCREEN_Y: 0.50,          // Normalized vertical screen anchor (0.50 = center)
};

// Direction to row-idle-frame mapping:
// Row 1: Facing DOWN (frames 0-7, idle: 0)
// Row 2: Facing UP (frames 8-15, idle: 8)
// Row 3: Facing RIGHT (frames 16-23, idle: 16)
// Row 4: Facing LEFT (frames 24-31, idle: 24)
const IDLE_FRAMES = {
  down: 0,
  up: 8,
  right: 16,
  left: 24,
};

export class OutpostScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OutpostScene' });
    this.bg = null;
    this.player = null;
    this.titleText = null;
    this.navButton = null;
    this.healthHud = null;
    this.radiationHud = null;
    this.hungerHud = null;
    this.environmentalHud = null;
    this.gameMessageBar = null;
    this.uiCamera = null;
    this.leftPlanter = null;
    this.rightPlanter = null;
    this.interactionPopup = null;
    this.currentDirection = 'down';
    this.cursors = null;
    this.keys = null;
    this.minX = 0;
    this.maxX = 0;
    this.minY = 0;
    this.maxY = 0;
  }

  preload() {
    // Load Outpost background
    if (!this.textures.exists('outpost-bg')) {
      this.load.image('outpost-bg', outpostBg);
    }
    // Proactively preload Mars background for return transition
    if (!this.textures.exists('mars-bg')) {
      this.load.image('mars-bg', marsBg);
    }
    // Load Health HUD asset
    if (!this.textures.exists(HEALTH_HUD_TEXTURE_KEY)) {
      this.load.image(HEALTH_HUD_TEXTURE_KEY, healthAsset);
    }
    // Load Radiation HUD asset
    if (!this.textures.exists(RADIATION_HUD_TEXTURE_KEY)) {
      this.load.image(RADIATION_HUD_TEXTURE_KEY, radiationAsset);
    }
    // Load Hunger HUD asset
    if (!this.textures.exists(HUNGER_HUD_TEXTURE_KEY)) {
      this.load.image(HUNGER_HUD_TEXTURE_KEY, hungerAsset);
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
    // Load Planter (plants.png) asset
    if (!this.textures.exists(PLANTER_CONFIG.TEXTURE_KEY)) {
      this.load.image(PLANTER_CONFIG.TEXTURE_KEY, plantsAsset);
    }
    // Programmatically extract astronaut 192x256 frames (4 rows x 8 cols = 32 frames)
    if (!this.textures.exists('astronaut')) {
      this.load.spritesheet('astronaut', astronautSheet, {
        frameWidth: 192,
        frameHeight: 256,
      });
    }
  }

  create() {
    const { width, height } = this.scale;

    // 1. Register 8-frame walking animations for all 4 directions
    this.createAnimations();

    // 2. Add Background at world origin (0, 0) preserving original proportions
    this.bg = this.add.image(0, 0, 'outpost-bg');
    this.bg.setOrigin(0, 0);
    this.bg.setScale(1);

    const bgWidth = this.bg.width;
    const bgHeight = this.bg.height;

    // 3. Create astronaut sprite centered in the Outpost environment
    const startX = bgWidth * OUTPOST_CONFIG.PLAYER_SCREEN_X;
    const startY = bgHeight * OUTPOST_CONFIG.PLAYER_SCREEN_Y;
    this.currentDirection = 'down';

    this.player = this.add.sprite(startX, startY, 'astronaut', IDLE_FRAMES.down);
    this.player.setOrigin(0.5, 0.5);

    // Pixel-art-friendly nearest-neighbour scaling
    if (this.player.texture) {
      this.player.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // 3b. Create Environmental Planter Objects (Left & Right) and Proximity Popup
    this.leftPlanter = new Planter(this, PLANTER_CONFIG.LEFT);
    this.rightPlanter = new Planter(this, PLANTER_CONFIG.RIGHT);
    this.interactionPopup = this.createInteractionPopup();

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

    // 5. Create UI overlay (Title, Health HUD, and Navigation Button)
    this.titleText = this.add.text(width / 2, Math.max(36, height * 0.07), 'OUTPOST', {
      fontFamily: "'Rajdhani', 'Orbitron', 'Segoe UI', system-ui, sans-serif",
      fontSize: '22px',
      fontStyle: '700',
      color: '#c2f1ff',
      align: 'center',
    });
    this.titleText.setOrigin(0.5, 0.5);
    this.titleText.setAlpha(0.72);
    this.titleText.setShadow(0, 2, 'rgba(0, 0, 0, 0.8)', 6, false, true);

    this.healthHud = new HealthHUD(this);
    this.healthHud.setHealth(currentHealth, MAX_HEALTH);

    this.radiationHud = new RadiationHUD(this);
    this.radiationHud.setValue(currentRadiation, MAX_RADIATION, false);

    this.hungerHud = new HungerHUD(this);
    this.hungerHud.setValue(currentHunger, MAX_HUNGER, false);

    // Environmental Status HUD (Top-Right: Oxygen, Water, Temperature, Timer)
    this.environmentalHud = new EnvironmentalStatusHUD(this);

    // Global Gameplay Message Bar (underneath scene title)
    this.gameMessageBar = new GameMessageBar(this);

    // Subscribe to health changes
    this.unsubscribeHealth = subscribeHealth((hp, max) => {
      if (this.healthHud) {
        this.healthHud.setHealth(hp, max);
      }
    });

    // Subscribe to radiation changes
    this.unsubscribeRadiation = subscribeRadiation((val, max) => {
      if (this.radiationHud) {
        this.radiationHud.setValue(val, max, true);
      }
    });

    // Subscribe to hunger changes
    this.unsubscribeHunger = subscribeHunger((val, max) => {
      if (this.hungerHud) {
        this.hungerHud.setValue(val, max, true);
      }
    });

    // Temporary keyboard testing:
    // Health: Y (damage 10), 6 (regain 10)
    // Hunger: I (reduce 10), 7 (regain 10)
    // Radiation: U (reduce 10), 8 (regain 10)
    this.onKeyDown = (event) => {
      if (event.repeat) return; // Prevent repeated triggers while held down

      if (event.code === 'KeyT' || event.key === 't' || event.key === 'T') {
        this.scene.pause();
        this.scene.launch('MissionStatusScene');
        return;
      }

      if (event.code === 'KeyY' || event.key === 'y' || event.key === 'Y') {
        this.takeDamage(10);
      } else if (event.code === 'Digit6' || event.key === '6') {
        this.regainHealth(10);
      } else if (event.code === 'KeyU' || event.key === 'u' || event.key === 'U') {
        this.reduceRadiation(10);
      } else if (event.code === 'Digit8' || event.key === '8') {
        this.regainRadiation(10);
      } else if (event.code === 'KeyI' || event.key === 'i' || event.key === 'I') {
        this.reduceHunger(10);
      } else if (event.code === 'Digit7' || event.key === '7') {
        this.regainHunger(10);
      }
    };
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', this.onKeyDown);
    }

    this.navButton = new SciFiButton(
      this,
      width / 2,
      height - Math.max(54, height * 0.09),
      '← RETURN TO MARS',
      {
        accentColor: 0x4deeea,
        glowColor: 0x0099ff,
        bgColor: 0x060f17,
        bgAlpha: 0.7,
        textColor: '#e8fbff',
        fontSize: '13px',
        paddingX: 24,
        paddingY: 11,
        onClick: () => this.transitionToMars(),
      }
    );

    // 6. Setup dedicated 1:1 UI camera so buttons/text remain fixed on screen and crisp
    this.uiCamera = this.cameras.add(0, 0, width, height);
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.setZoom(1);

    // Main camera only renders game world; UI camera only renders UI elements
    this.cameras.main.ignore([
      this.titleText,
      this.navButton,
      this.healthHud,
      this.radiationHud,
      this.hungerHud,
      this.environmentalHud,
      this.gameMessageBar,
    ]);
    this.uiCamera.ignore([
      this.bg,
      this.player,
      this.leftPlanter,
      this.rightPlanter,
      this.interactionPopup,
    ]);

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

    // Cleanup when leaving Outpost
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
      if (this.input.keyboard) {
        this.input.keyboard.off('keydown', this.onKeyDown);
        this.input.keyboard.removeAllKeys(true);
      }
      if (this.unsubscribeHealth) {
        this.unsubscribeHealth();
        this.unsubscribeHealth = null;
      }
      if (this.unsubscribeRadiation) {
        this.unsubscribeRadiation();
        this.unsubscribeRadiation = null;
      }
      if (this.unsubscribeHunger) {
        this.unsubscribeHunger();
        this.unsubscribeHunger = null;
      }
      if (this.player && this.player.anims) {
        this.player.anims.stop();
      }
      if (this.environmentalHud) {
        this.environmentalHud.destroy();
        this.environmentalHud = null;
      }
      if (this.gameMessageBar) {
        this.gameMessageBar.destroy();
        this.gameMessageBar = null;
      }
      this.leftPlanter = null;
      this.rightPlanter = null;
      this.interactionPopup = null;
    });
  }

  createInteractionPopup() {
    const cfg = PLANTER_CONFIG.POPUP;
    const container = this.add.container(0, 0);
    container.setDepth(2000); // Above player and environmental objects

    // Sci-fi styled popup panel
    const bg = this.add.graphics();
    const w = cfg.width;
    const h = cfg.height;
    const r = 4;

    // Glow border
    bg.lineStyle(2, cfg.glowColor, 0.4);
    bg.strokeRoundedRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2, r);

    // Crisp border & dark background
    bg.fillStyle(cfg.bgColor, cfg.bgAlpha);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    bg.lineStyle(1, cfg.borderColor, 0.9);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    // Empty text label for future interactive prompt/action
    const label = this.add.text(0, 0, '', {
      fontFamily: "'Rajdhani', 'Orbitron', 'Segoe UI', system-ui, sans-serif",
      fontSize: '11px',
      fontStyle: '700',
      color: '#4deeea',
      align: 'center',
    });
    label.setOrigin(0.5, 0.5);

    container.add([bg, label]);
    container.setVisible(false);
    return container;
  }

  checkPlanterCollision(testFeetX, testFeetY) {
    const radius = PLANTER_CONFIG.PLAYER_COLLISION.radius;
    if (this.leftPlanter && this.leftPlanter.checkCollision(testFeetX, testFeetY, radius)) {
      return true;
    }
    if (this.rightPlanter && this.rightPlanter.checkCollision(testFeetX, testFeetY, radius)) {
      return true;
    }
    return false;
  }

  takeDamage(amount) {
    return takeDamage(amount);
  }

  regainHealth(amount) {
    return regainHealth(amount);
  }

  updateHealthBar() {
    updateHealthBar();
  }

  reduceRadiation(amount) {
    return reduceRadiation(amount);
  }

  regainRadiation(amount) {
    return regainRadiation(amount);
  }

  updateRadiationBar() {
    updateRadiationBar();
  }

  reduceHunger(amount) {
    return reduceHunger(amount);
  }

  regainHunger(amount) {
    return regainHunger(amount);
  }

  updateHungerBar() {
    updateHungerBar();
  }

  createAnimations() {
    // Row 1: Facing DOWN / front-facing (frames 0-7)
    if (!this.anims.exists('walk-down')) {
      this.anims.create({
        key: 'walk-down',
        frames: this.anims.generateFrameNumbers('astronaut', { start: 0, end: 7 }),
        frameRate: OUTPOST_CONFIG.WALK_ANIMATION_FPS,
        repeat: -1,
      });
    }

    // Row 2: Facing UP / back-facing (frames 8-15)
    if (!this.anims.exists('walk-up')) {
      this.anims.create({
        key: 'walk-up',
        frames: this.anims.generateFrameNumbers('astronaut', { start: 8, end: 15 }),
        frameRate: OUTPOST_CONFIG.WALK_ANIMATION_FPS,
        repeat: -1,
      });
    }

    // Row 3: Facing RIGHT (frames 16-23)
    if (!this.anims.exists('walk-right')) {
      this.anims.create({
        key: 'walk-right',
        frames: this.anims.generateFrameNumbers('astronaut', { start: 16, end: 23 }),
        frameRate: OUTPOST_CONFIG.WALK_ANIMATION_FPS,
        repeat: -1,
      });
    }

    // Row 4: Facing LEFT (frames 24-31)
    if (!this.anims.exists('walk-left')) {
      this.anims.create({
        key: 'walk-left',
        frames: this.anims.generateFrameNumbers('astronaut', { start: 24, end: 31 }),
        frameRate: OUTPOST_CONFIG.WALK_ANIMATION_FPS,
        repeat: -1,
      });
    }
  }

  updateCameraAndBounds(width, height) {
    if (!this.bg) return;

    const bgWidth = this.bg.width;
    const bgHeight = this.bg.height;

    // Calculate zoom from OUTPOST_VISIBLE_FRACTION (ensuring aspect ratio is preserved)
    const fraction = Math.max(0.05, Math.min(1.0, OUTPOST_CONFIG.OUTPOST_VISIBLE_FRACTION));
    const targetZoomX = width / (bgWidth * fraction);
    const targetZoomY = height / (bgHeight * fraction);
    const zoom = Math.max(targetZoomX, targetZoomY);

    // Guarantee that no empty space outside the background is ever exposed
    const minZoom = Math.max(width / bgWidth, height / bgHeight);
    const effectiveZoom = Math.max(zoom, minZoom);

    this.cameras.main.setZoom(effectiveZoom);

    // Render astronaut at constant on-screen PLAYER_DISPLAY_HEIGHT
    if (this.player) {
      const charScale = (OUTPOST_CONFIG.PLAYER_DISPLAY_HEIGHT / effectiveZoom) / 256;
      this.player.setScale(charScale);
    }

    // Calculate visible viewport dimensions in world coordinate units
    const visibleWorldW = width / effectiveZoom;
    const visibleWorldH = height / effectiveZoom;

    // Camera follow offset based on PLAYER_SCREEN_X and PLAYER_SCREEN_Y
    const screenAnchorX = OUTPOST_CONFIG.PLAYER_SCREEN_X;
    const screenAnchorY = OUTPOST_CONFIG.PLAYER_SCREEN_Y;
    const offsetX = (0.5 - screenAnchorX) * visibleWorldW;
    const offsetY = (0.5 - screenAnchorY) * visibleWorldH;

    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setFollowOffset(offsetX, offsetY);

    // Precise boundaries: player stops moving when background edge reaches screen edge
    this.minX = screenAnchorX * visibleWorldW;
    this.maxX = bgWidth - (1 - screenAnchorX) * visibleWorldW;
    this.minY = screenAnchorY * visibleWorldH;
    this.maxY = bgHeight - (1 - screenAnchorY) * visibleWorldH;

    // Re-clamp player inside boundaries if window resized
    if (this.player) {
      this.player.x = Phaser.Math.Clamp(this.player.x, this.minX, this.maxX);
      this.player.y = Phaser.Math.Clamp(this.player.y, this.minY, this.maxY);
    }

    // Update UI overlay positions
    if (this.uiCamera) {
      this.uiCamera.setSize(width, height);
    }
    if (this.titleText) {
      this.titleText.setPosition(width / 2, Math.max(36, height * 0.07));
    }
    if (this.healthHud) {
      this.healthHud.updateLayout(width, height);
    }
    if (this.radiationHud) {
      this.radiationHud.updateLayout(width, height, 1);
    }
    if (this.hungerHud) {
      this.hungerHud.updateLayout(width, height, 2);
    }
    if (this.environmentalHud) {
      this.environmentalHud.updateLayout(width, height);
    }
    if (this.gameMessageBar) {
      this.gameMessageBar.updateLayout(width, height, this.titleText.y);
    }
    if (this.navButton) {
      this.navButton.setPosition(width / 2, height - Math.max(54, height * 0.09));
    }
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

  update(time, delta) {
    if (!this.player) return;

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
      this.player.anims.play('walk-' + newDir, true);

      // Normalise diagonal speed
      let speed = OUTPOST_CONFIG.PLAYER_SPEED * (delta / 1000);
      if (vx !== 0 && vy !== 0) {
        speed *= Math.SQRT1_2;
      }

      const feetOffset = PLANTER_CONFIG.PLAYER_COLLISION.offsetY;
      let nextX = this.player.x;
      let nextY = this.player.y;

      // Axis-independent collision checking so player can slide along planter edges smoothly
      if (vx !== 0) {
        const candidateX = Phaser.Math.Clamp(this.player.x + vx * speed, this.minX, this.maxX);
        if (!this.checkPlanterCollision(candidateX, this.player.y + feetOffset)) {
          nextX = candidateX;
        }
      }

      if (vy !== 0) {
        const candidateY = Phaser.Math.Clamp(this.player.y + vy * speed, this.minY, this.maxY);
        if (!this.checkPlanterCollision(nextX, candidateY + feetOffset)) {
          nextY = candidateY;
        }
      }

      this.player.x = nextX;
      this.player.y = nextY;
    } else {
      // When movement key is released: stop animation and stay on frame 0 of current direction
      if (this.player.anims.isPlaying) {
        this.player.anims.stop();
        this.player.setFrame(IDLE_FRAMES[this.currentDirection]);
      }
    }

    // Dynamic depth sorting based on Y position so player renders behind or in front of planters
    this.player.setDepth(this.player.y + PLANTER_CONFIG.PLAYER_COLLISION.offsetY);

    // Proximity interaction popup detection (works independently for both planters)
    const nearLeft = this.leftPlanter && this.leftPlanter.checkProximity(this.player.x, this.player.y);
    const nearRight = this.rightPlanter && this.rightPlanter.checkProximity(this.player.x, this.player.y);

    if (this.interactionPopup) {
      if (nearLeft || nearRight) {
        this.interactionPopup.setPosition(
          this.player.x,
          this.player.y + PLANTER_CONFIG.POPUP.offsetY
        );
        this.interactionPopup.setVisible(true);
      } else {
        this.interactionPopup.setVisible(false);
      }
    }
  }

  transitionToMars() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    if (this.uiCamera) {
      this.uiCamera.fadeOut(400, 0, 0, 0);
    }
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MarsScene');
    });
  }
}

export default OutpostScene;
