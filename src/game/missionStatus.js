export const missionStatus = {
  suitBattery: 87,
  solarIntensity: 76,
  stormIntensity: 'MODERATE',
  powerConsumption: 2.4,
  powerAvailable: 8.7,
  emergency: 'NO ACTIVE EMERGENCY',
};

const listeners = new Set();
function publish() { listeners.forEach((listener) => listener(missionStatus)); }
export function subscribeMissionStatus(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function updateSuitBattery(value) { missionStatus.suitBattery = value; publish(); }
export function updateSolarIntensity(value) { missionStatus.solarIntensity = value; publish(); }
export function updateStormIntensity(value) { missionStatus.stormIntensity = value; publish(); }
export function updatePowerConsumption(value) { missionStatus.powerConsumption = value; publish(); }
export function updatePowerAvailable(value) { missionStatus.powerAvailable = value; publish(); }
export function updateEmergency(value) { missionStatus.emergency = value; publish(); }
