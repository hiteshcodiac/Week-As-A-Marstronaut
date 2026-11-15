import { StatusBarHUD } from './StatusBarHUD.js';

export const DRONE_HEALTH_HUD_TEXTURE_KEY = 'drone-health-hud';
export const DRONE_HEALTH_HUD_DYNAMIC_KEY = 'drone-health-hud-dynamic';

export class DroneHealthHUD extends StatusBarHUD {
  constructor(scene) {
    super(scene, {
      textureKey: DRONE_HEALTH_HUD_TEXTURE_KEY,
      dynamicKey: DRONE_HEALTH_HUD_DYNAMIC_KEY,
      initialValue: 100,
      initialMax: 100,
      sampleFilledIndex: 0,
      sampleEmptyIndex: 9,
      barIndex: 4,
    });
  }
}

export default DroneHealthHUD;
