import { StatusBarHUD } from './StatusBarHUD.js';

export const BATTERY_HUD_TEXTURE_KEY = 'battery-hud';
export const BATTERY_HUD_DYNAMIC_KEY = 'battery-hud-dynamic';

export class BatteryHUD extends StatusBarHUD {
  constructor(scene) {
    super(scene, {
      textureKey: BATTERY_HUD_TEXTURE_KEY,
      dynamicKey: BATTERY_HUD_DYNAMIC_KEY,
      initialValue: 100,
      initialMax: 100,
      sampleFilledIndex: 0,
      sampleEmptyIndex: 9,
      barIndex: 3,
    });
  }
}

export default BatteryHUD;
