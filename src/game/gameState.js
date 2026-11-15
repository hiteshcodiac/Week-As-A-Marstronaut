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

