import { StatusBarHUD } from './StatusBarHUD.js';

export const HUNGER_HUD_TEXTURE_KEY = 'hunger-hud';
export const HUNGER_HUD_DYNAMIC_KEY = 'hunger-hud-dynamic';

/**
 * HungerHUD
 * Displays the independent Hunger status bar immediately below Radiation.
 */
export class HungerHUD extends StatusBarHUD {
  constructor(scene) {
    super(scene, {
      textureKey: HUNGER_HUD_TEXTURE_KEY,
      dynamicKey: HUNGER_HUD_DYNAMIC_KEY,
      sampleFilledIndex: 0,
      sampleEmptyIndex: 9,
      barIndex: 2,
    });
  }
}

export default HungerHUD;
