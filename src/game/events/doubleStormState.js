/**
 * The Double Storm Event State Controller
 *
 * Manages the multi-system Mars emergency event:
 * - Systems: Power, Radiation, Health, Time
 * - Decision cards: Option A (Wait), Option B (Immediate EVA), Option C (Shielded Suit)
 * - Hidden consequence: Critical battery depletion monitoring
 * - Integrates with marsEnvironmentConfig.js and marsEnvironmentalSimulator.js
 * - Seamlessly persists across Outpost and Mars scene transitions
 */

import {
  reduceBattery,
  regainBattery,
  updateTimer,
  showGameMessage,
} from '../gameState.js';
import {
  updateSolarIntensity,
  updateStormIntensity,
  updateEmergency,
} from '../missionStatus.js';
import { MARS_ENVIRONMENT_CONFIG } from '../../config/marsEnvironmentConfig.js';
import { marsEnvironmentalSimulator } from '../../simulation/marsEnvironmentalSimulator.js';

export const STORM_STATUS = {
  IDLE: 'IDLE',
  DECISION_PENDING: 'DECISION_PENDING',
  WAITING: 'WAITING',
  PREPARING_SUIT: 'PREPARING_SUIT',
  EVA_ACTIVE: 'EVA_ACTIVE',
  COMPLETED: 'COMPLETED',
};

class DoubleStormEventManager {
  constructor() {
    this.status = STORM_STATUS.IDLE;
    this.selectedOption = null; // 'wait' | 'immediate' | 'shielded'
    this.elapsedSeconds = 0;
    this.phaseRemainingSeconds = 0;
    this.componentRetrieved = false;
    this.modalVisible = false;
    this.listeners = new Set();
    this.intervalId = null;
  }

  getConfig() {
    return MARS_ENVIRONMENT_CONFIG.theDoubleStorm;
  }

  getState() {
    return {
      status: this.status,
      selectedOption: this.selectedOption,
      elapsedSeconds: this.elapsedSeconds,
      phaseRemainingSeconds: this.phaseRemainingSeconds,
      componentRetrieved: this.componentRetrieved,
      modalVisible: this.modalVisible,
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach((callback) => {
      try {
        callback(state);
      } catch (err) {
        console.error('Error in double storm listener:', err);
      }
    });
  }

  setModalVisible(visible) {
    this.modalVisible = Boolean(visible);
    this.notify();
  }

  toggleModalVisible() {
    this.modalVisible = !this.modalVisible;
    this.notify();
  }

  startDoubleStormEvent() {
    if (this.status !== STORM_STATUS.IDLE) return;

    const cfg = this.getConfig();
    this.status = STORM_STATUS.DECISION_PENDING;
    this.selectedOption = null;
    this.elapsedSeconds = 0;
    this.phaseRemainingSeconds = 0;
    this.componentRetrieved = false;
    this.modalVisible = true;

    // Apply environmental overrides via simulation layer
    marsEnvironmentalSimulator.setEventOverrides({
      context: 'SEP_EVENT',
      tau: cfg.targetDustOpticalDepthTau,
      solarIntensityDropPercent: cfg.solarIntensityDropPercent,
      sepMultiplier: cfg.sepRadiationMultiplier,
      batteryDrainRate: MARS_ENVIRONMENT_CONFIG.powerGrid.nominalBatteryDrainRatePerSecond * 1.5,
    });

    updateStormIntensity(cfg.stormSeverityLabel);
    updateEmergency('THE DOUBLE STORM: Dust storm & SEP solar event');
    showGameMessage('ALERT: The Double Storm detected. Solar generation falling. Review emergency protocol.');

    this.startTicker();
    this.notify();
  }

  chooseDoubleStormOption(option) {
    if (this.status !== STORM_STATUS.DECISION_PENDING) return;
    const cfg = this.getConfig();

    this.selectedOption = option;

    if (option === 'wait') {
      this.status = STORM_STATUS.WAITING;
      this.phaseRemainingSeconds = cfg.waitOption.durationSeconds;
      this.modalVisible = false;
      showGameMessage(`PROTOCOL A: ${cfg.waitOption.narrativeStatus}`);
    } else if (option === 'immediate') {
      this.status = STORM_STATUS.EVA_ACTIVE;
      reduceBattery(cfg.immediateEVA.suitBatteryCost);
      marsEnvironmentalSimulator.setSuitType('standard');
      this.modalVisible = false;
      showGameMessage(`PROTOCOL B: ${cfg.immediateEVA.narrativeStatus}`);
    } else if (option === 'shielded') {
      this.status = STORM_STATUS.PREPARING_SUIT;
      this.phaseRemainingSeconds = cfg.shieldedEVA.preparationTimeSeconds;
      reduceBattery(cfg.shieldedEVA.additionalPowerCost);
      this.modalVisible = false;
      showGameMessage(`PROTOCOL C: ${cfg.shieldedEVA.narrativeStatus}`);
    }

    this.notify();
  }

  completePowerComponentRetrieval() {
    if (this.componentRetrieved || this.status === STORM_STATUS.IDLE) return;
    const cfg = this.getConfig();

    this.componentRetrieved = true;
    this.status = STORM_STATUS.COMPLETED;

    // Restore power grid and atmospheric baseline
    regainBattery(cfg.retrievalReward.batteryGain);
    updateSolarIntensity(cfg.retrievalReward.solarIntensityRestore);
    updateStormIntensity('SUBSIDING');
    updateEmergency(cfg.retrievalReward.emergencyLabel);
    showGameMessage('SUCCESS: Power component secured & installed! Grid reserves stabilized.');

    marsEnvironmentalSimulator.clearEventOverrides();
    this.notify();
  }

  endDoubleStormEvent() {
    this.stopTicker();
    this.status = STORM_STATUS.IDLE;
    this.selectedOption = null;
    this.modalVisible = false;
    this.componentRetrieved = false;
    marsEnvironmentalSimulator.clearEventOverrides();
    updateTimer('12:45');
    this.notify();
  }

  startTicker() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  stopTicker() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  tick() {
    if (this.status === STORM_STATUS.IDLE || this.status === STORM_STATUS.COMPLETED) return;
    const cfg = this.getConfig();
    this.elapsedSeconds++;

    // Format event countdown on Environmental Status HUD Timer
    const totalRemaining = Math.max(0, cfg.stormDurationSeconds - this.elapsedSeconds);
    const mins = String(Math.floor(totalRemaining / 60)).padStart(2, '0');
    const secs = String(totalRemaining % 60).padStart(2, '0');
    updateTimer(`${mins}:${secs}`);

    // Manage phase countdowns for Option A (Wait) and Option C (Suit Prep)
    if (this.status === STORM_STATUS.WAITING) {
      this.phaseRemainingSeconds--;
      if (this.phaseRemainingSeconds <= 0) {
        this.status = STORM_STATUS.EVA_ACTIVE;
        marsEnvironmentalSimulator.setSuitType('standard');
        showGameMessage('CONDITIONS IMPROVED: Surface storm peak passed. Retrieve power component outside now.');
      }
    } else if (this.status === STORM_STATUS.PREPARING_SUIT) {
      this.phaseRemainingSeconds--;
      if (this.phaseRemainingSeconds <= 0) {
        this.status = STORM_STATUS.EVA_ACTIVE;
        marsEnvironmentalSimulator.setSuitType('shielded');
        showGameMessage('SHIELDING READY: Enhanced suit prepared. Proceed outside to retrieve component.');
      }
    }

    this.notify();
  }
}

export const doubleStormManager = new DoubleStormEventManager();

export function startDoubleStormEvent() {
  return doubleStormManager.startDoubleStormEvent();
}

export function chooseDoubleStormOption(option) {
  return doubleStormManager.chooseDoubleStormOption(option);
}

export function completePowerComponentRetrieval() {
  return doubleStormManager.completePowerComponentRetrieval();
}

export function endDoubleStormEvent() {
  return doubleStormManager.endDoubleStormEvent();
}

export function getDoubleStormState() {
  return doubleStormManager.getState();
}

export function subscribeDoubleStormState(callback) {
  return doubleStormManager.subscribe(callback);
}

// Global browser window attachment for developer console testing
if (typeof window !== 'undefined') {
  window.startDoubleStormEvent = startDoubleStormEvent;
  window.chooseDoubleStormOption = chooseDoubleStormOption;
  window.completePowerComponentRetrieval = completePowerComponentRetrieval;
  window.endDoubleStormEvent = endDoubleStormEvent;
}
