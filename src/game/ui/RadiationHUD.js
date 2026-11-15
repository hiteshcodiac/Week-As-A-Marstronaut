import { StatusBarHUD } from './StatusBarHUD.js';

export const RADIATION_HUD_TEXTURE_KEY = 'radiation-hud';
export const RADIATION_HUD_DYNAMIC_KEY = 'radiation-hud-dynamic';

/**
 * RadiationHUD
 * Displays the independent Radiation status bar immediately below Health.
 */
export class RadiationHUD extends StatusBarHUD {
  constructor(scene) {
    super(scene, {
      textureKey: RADIATION_HUD_TEXTURE_KEY,
      dynamicKey: RADIATION_HUD_DYNAMIC_KEY,
      sampleFilledIndex: 0,
      sampleEmptyIndex: 9,
      barIndex: 1,
    });
  }
}

export default RadiationHUD;
