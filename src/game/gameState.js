/**
 * Game State Management
 * Centralized, reusable state store for AstroTrainer.
 * Accessible across Outpost, Mars, and future hazard systems (e.g. radiation, extreme temperatures).
 */

export const MAX_HEALTH = 100;
export let currentHealth = 100;

const healthListeners = new Set();

/**
 * Returns current health value.
 * @returns {number}
 */
export function getHealth() {
  return currentHealth;
}

/**
 * Subscribes a callback to receive health updates whenever health changes.
 * @param {Function} callback - Function(currentHealth, maxHealth)
 * @returns {Function} Unsubscribe function
 */
export function subscribeHealth(callback) {
  healthListeners.add(callback);
  return () => {
    healthListeners.delete(callback);
  };
}

/**
 * Notifies all subscribed listeners (e.g. Health HUD) to update their visual state.
 */
export function updateHealthBar() {
  for (const callback of healthListeners) {
    try {
      callback(currentHealth, MAX_HEALTH);
    } catch (err) {
      console.error('Error in health listener:', err);
    }
  }
}

/**
 * Decreases player health by the specified amount and updates the health bar.
 * Reusable across any hazard (keyboard test, Outpost events, Mars radiation, extreme heat/cold).
 *
 * @param {number} amount - Amount of damage to apply
 * @returns {number} New health value
 */
export function takeDamage(amount) {
  currentHealth = Math.max(0, currentHealth - amount);
  updateHealthBar();
  return currentHealth;
}

/**
 * Increases player health by the specified amount up to MAX_HEALTH.
 * @param {number} amount
 * @returns {number} New health value
 */
export function regainHealth(amount) {
  currentHealth = Math.max(0, Math.min(MAX_HEALTH, currentHealth + amount));
  updateHealthBar();
  return currentHealth;
}

/**
 * Sets health to an exact value clamped between 0 and MAX_HEALTH.
 * @param {number} hp
 * @returns {number}
 */
export function setHealth(hp) {
  currentHealth = Math.max(0, Math.min(MAX_HEALTH, hp));
  updateHealthBar();
  return currentHealth;
}

/**
 * Resets player health back to MAX_HEALTH (100).
 * @returns {number}
 */
export function resetHealth() {
  currentHealth = MAX_HEALTH;
  updateHealthBar();
  return currentHealth;
}

// ============================================================================
// RADIATION SYSTEM
// ============================================================================
export const MAX_RADIATION = 100;
export let currentRadiation = 100;

const radiationListeners = new Set();

export function getRadiation() {
  return currentRadiation;
}

export function subscribeRadiation(callback) {
  radiationListeners.add(callback);
  return () => {
    radiationListeners.delete(callback);
  };
}

export function updateRadiationBar() {
  for (const callback of radiationListeners) {
    try {
      callback(currentRadiation, MAX_RADIATION);
    } catch (err) {
      console.error('Error in radiation listener:', err);
    }
  }
}

export function reduceRadiation(amount) {
  currentRadiation = Math.max(0, currentRadiation - amount);
  updateRadiationBar();
  return currentRadiation;
}

export function regainRadiation(amount) {
  currentRadiation = Math.max(0, Math.min(MAX_RADIATION, currentRadiation + amount));
  updateRadiationBar();
  return currentRadiation;
}

export function setRadiation(val) {
  currentRadiation = Math.max(0, Math.min(MAX_RADIATION, val));
  updateRadiationBar();
  return currentRadiation;
}

export function resetRadiation() {
  currentRadiation = MAX_RADIATION;
  updateRadiationBar();
  return currentRadiation;
}

// ============================================================================
// HUNGER SYSTEM
// ============================================================================
export const MAX_HUNGER = 100;
export let currentHunger = 100;

const hungerListeners = new Set();

export function getHunger() {
  return currentHunger;
}

export function subscribeHunger(callback) {
  hungerListeners.add(callback);
  return () => {
    hungerListeners.delete(callback);
  };
}

export function updateHungerBar() {
  for (const callback of hungerListeners) {
    try {
      callback(currentHunger, MAX_HUNGER);
    } catch (err) {
      console.error('Error in hunger listener:', err);
    }
  }
}

export function reduceHunger(amount) {
  currentHunger = Math.max(0, currentHunger - amount);
  updateHungerBar();
  return currentHunger;
}

export function regainHunger(amount) {
  currentHunger = Math.max(0, Math.min(MAX_HUNGER, currentHunger + amount));
  updateHungerBar();
  return currentHunger;
}

export function setHunger(val) {
  currentHunger = Math.max(0, Math.min(MAX_HUNGER, val));
  updateHungerBar();
  return currentHunger;
}

export function resetHunger() {
  currentHunger = MAX_HUNGER;
  updateHungerBar();
  return currentHunger;
}

// ============================================================================
// MARS BATTERY SYSTEM
// ============================================================================
export const MAX_BATTERY = 100;
export let currentBattery = 100;

const batteryListeners = new Set();

export function getBattery() { return currentBattery; }
export function subscribeBattery(callback) {
  batteryListeners.add(callback);
  return () => batteryListeners.delete(callback);
}
export function updateBatteryBar() {
  for (const callback of batteryListeners) callback(currentBattery, MAX_BATTERY);
}
export function reduceBattery(amount) {
  currentBattery = Math.max(0, Math.min(MAX_BATTERY, currentBattery - amount));
  updateBatteryBar();
  return currentBattery;
}
export function regainBattery(amount) {
  currentBattery = Math.max(0, Math.min(MAX_BATTERY, currentBattery + amount));
  updateBatteryBar();
  return currentBattery;
}
export const addBattery = regainBattery;
export function setBattery(val) {
  currentBattery = Math.max(0, Math.min(MAX_BATTERY, val));
  updateBatteryBar();
  return currentBattery;
}
export function resetBattery() {
  currentBattery = MAX_BATTERY;
  updateBatteryBar();
  return currentBattery;
}

// ============================================================================
// MARS DRONE HEALTH SYSTEM
// ============================================================================
export const MAX_DRONE_HEALTH = 100;
export let currentDroneHealth = 100;

const droneHealthListeners = new Set();

export function getDroneHealth() { return currentDroneHealth; }
export function subscribeDroneHealth(callback) {
  droneHealthListeners.add(callback);
  return () => droneHealthListeners.delete(callback);
}
export function updateDroneHealthBar() {
  for (const callback of droneHealthListeners) callback(currentDroneHealth, MAX_DRONE_HEALTH);
}
export function reduceDroneHealth(amount) {
  currentDroneHealth = Math.max(0, Math.min(MAX_DRONE_HEALTH, currentDroneHealth - amount));
  updateDroneHealthBar();
  return currentDroneHealth;
}
export function regainDroneHealth(amount) {
  currentDroneHealth = Math.max(0, Math.min(MAX_DRONE_HEALTH, currentDroneHealth + amount));
  updateDroneHealthBar();
  return currentDroneHealth;
}
export const addDroneHealth = regainDroneHealth;
export function setDroneHealth(val) {
  currentDroneHealth = Math.max(0, Math.min(MAX_DRONE_HEALTH, val));
  updateDroneHealthBar();
  return currentDroneHealth;
}
export function resetDroneHealth() {
  currentDroneHealth = MAX_DRONE_HEALTH;
  updateDroneHealthBar();
  return currentDroneHealth;
}

// ============================================================================
// ENVIRONMENTAL STATUS HUD SYSTEM (OXYGEN, WATER, TEMPERATURE, TIMER)
// ============================================================================
export const environmentalStats = {
  oxygen: 98,
  water: 120,
  temperature: -63,
  timer: '12:45',
};

const environmentalListeners = new Set();

/**
 * Returns a copy of the current environmental stats.
 * @returns {{ oxygen: number, water: number, temperature: number, timer: string }}
 */
export function getEnvironmentalStats() {
  return { ...environmentalStats };
}

/**
 * Subscribes a listener to receive environmental updates.
 * @param {Function} callback - Function(environmentalStats)
 * @returns {Function} Unsubscribe function
 */
export function subscribeEnvironmental(callback) {
  environmentalListeners.add(callback);
  return () => environmentalListeners.delete(callback);
}

/**
 * Notifies all subscribed listeners to update the Environmental HUD.
 */
export function notifyEnvironmental() {
  const current = getEnvironmentalStats();
  for (const callback of environmentalListeners) {
    try {
      callback(current);
    } catch (err) {
      console.error('Error in environmental listener:', err);
    }
  }
}

/**
 * Updates Oxygen percentage value and updates HUD.
 * @param {number|string} value
 */
export function updateOxygen(value) {
  environmentalStats.oxygen = value;
  notifyEnvironmental();
  return environmentalStats.oxygen;
}

/**
 * Updates Water volume value (in Liters) and updates HUD.
 * @param {number|string} value
 */
export function updateWater(value) {
  environmentalStats.water = value;
  notifyEnvironmental();
  return environmentalStats.water;
}

/**
 * Updates Temperature value (in °C) and updates HUD.
 * @param {number|string} value
 */
export function updateTemperature(value) {
  environmentalStats.temperature = value;
  notifyEnvironmental();
  return environmentalStats.temperature;
}

/**
 * Updates remaining event Timer string (e.g. "12:45") and updates HUD.
 * @param {string} value
 */
export function updateTimer(value) {
  environmentalStats.timer = value;
  notifyEnvironmental();
  return environmentalStats.timer;
}

// ============================================================================
// GLOBAL GAMEPLAY MESSAGE BAR SYSTEM
// ============================================================================
export let currentGameMessage = '';

const gameMessageListeners = new Set();

/**
 * Returns the currently displayed gameplay message.
 * @returns {string}
 */
export function getCurrentGameMessage() {
  return currentGameMessage;
}

/**
 * Subscribes a listener to receive gameplay message updates.
 * @param {Function} callback - Function(message)
 * @returns {Function} Unsubscribe function
 */
export function subscribeGameMessage(callback) {
  gameMessageListeners.add(callback);
  return () => gameMessageListeners.delete(callback);
}

/**
 * Displays a new global gameplay message in the message bar across Mars & Outpost.
 * Replaces any existing message immediately. Accessible from anywhere in the game.
 *
 * @param {string} message
 * @returns {string}
 */
export function showGameMessage(message) {
  currentGameMessage = typeof message === 'string' ? message : String(message ?? '');
  for (const callback of gameMessageListeners) {
    try {
      callback(currentGameMessage);
    } catch (err) {
      console.error('Error in game message listener:', err);
    }
  }
  return currentGameMessage;
}

/**
 * Clears the current gameplay message while keeping the message bar itself visible.
 * @returns {string}
 */
export function clearGameMessage() {
  return showGameMessage('');
}

// Global browser window attachment for easy accessibility from developer console or external scripts
if (typeof window !== 'undefined') {
  window.showGameMessage = showGameMessage;
  window.clearGameMessage = clearGameMessage;
  window.getCurrentGameMessage = getCurrentGameMessage;
}


