/**
 * Mars Environmental Simulator Layer (Layer 2)
 *
 * Converts scientific observations (from Layer 1: NASA Data Provider) into dynamic
 * gameplay conditions, applying configurable adjustments from marsEnvironmentConfig.js,
 * and propagating them into existing game systems (Layer 3: gameState.js & missionStatus.js).
 *
 * Distinctly classifies every parameter as either:
 * - NASA_MEASURED: Direct surface measurement (RAD, MEDA, REMS, SEP)
 * - SIMULATED: Radiative transfer / physics models (Beer-Lambert dust extinction)
 * - ESTIMATED: Life-support engineering models (NASA Human Integration Design Handbook / ECLSS)
 */

import { nasaDataProvider, PROVENANCE_TYPES } from '../data/nasa/nasaDataProvider.js';
import { MARS_ENVIRONMENT_CONFIG } from '../config/marsEnvironmentConfig.js';
import {
  currentBattery, reduceBattery, regainBattery,
  currentRadiation, reduceRadiation, regainRadiation,
  takeDamage,
  updateTemperature,
  showGameMessage,
} from '../game/gameState.js';
import {
  updateSolarIntensity,
  updatePowerConsumption,
  updatePowerAvailable,
} from '../game/missionStatus.js';

class MarsEnvironmentalSimulator {
  constructor() {
    this.config = MARS_ENVIRONMENT_CONFIG;
    this.activeScene = 'Outpost'; // 'Outpost' | 'Mars'
    this.isOutsideMars = false;
    this.suitType = 'standard'; // 'standard' | 'shielded'
    this.tickerInterval = null;
    this.eventOverrides = null;

    // Current live simulation state
    this.liveState = {
      tau: 0.38,
      solarIntensityPercent: 76,
      powerGenerationKW: 8.7,
      surfaceDoseRateUSvPerDay: 640,
      airTemperatureDegC: -63,
      atmosphericPressurePa: 750,
      relativeHumidityPercent: 3.5,
      windSpeedMPerS: 5.2,
      criticalBatteryAlertIssued: false,
    };
  }

  /**
   * Initializes simulator with initial NASA baseline readings and starts real-time tick.
   */
  start() {
    this.refreshReadingsFromDataSource();
    if (!this.tickerInterval) {
      this.tickerInterval = setInterval(() => this.tick(), 1000);
    }
  }

  stop() {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  setSceneContext(sceneName, isOutside = false) {
    this.activeScene = sceneName;
    this.isOutsideMars = isOutside;
  }

  setSuitType(type) {
    if (type === 'standard' || type === 'shielded') {
      this.suitType = type;
    }
  }

  setEventOverrides(overrides) {
    this.eventOverrides = overrides;
    this.refreshReadingsFromDataSource();
  }

  clearEventOverrides() {
    this.eventOverrides = null;
    this.refreshReadingsFromDataSource();
  }

  /**
   * Fetches latest values from NASA Data Provider and applies environmental conversions.
   */
  refreshReadingsFromDataSource() {
    const context = this.eventOverrides ? this.eventOverrides.context || 'DUST_STORM' : 'NOMINAL';
    nasaDataProvider.setEnvironmentalContext(context);

    // 1. Atmospheric readings (Perseverance MEDA / Curiosity REMS)
    const atmo = nasaDataProvider.getAtmosphericReading();
    let currentTau = this.eventOverrides?.tau ?? atmo.dustOpticalDepthTau;
    this.liveState.tau = currentTau;
    this.liveState.airTemperatureDegC = this.eventOverrides?.temperature ?? atmo.airTemperature;
    this.liveState.atmosphericPressurePa = atmo.pressure;
    this.liveState.relativeHumidityPercent = atmo.humidity;
    this.liveState.windSpeedMPerS = atmo.windSpeed;

    // 2. Solar extinction calculation (NASA Beer-Lambert model)
    const solarCalc = nasaDataProvider.getSolarIrradianceReading(currentTau);
    let solarPercent = solarCalc.solarIntensityPercent;
    if (this.eventOverrides && this.eventOverrides.solarIntensityDropPercent) {
      solarPercent = Math.max(5, this.config.dustAndSolar.nominalClearSkySolarIntensityPercent - this.eventOverrides.solarIntensityDropPercent);
    }
    this.liveState.solarIntensityPercent = solarPercent;

    // Power generation calculation: P = Area * Irradiance * Efficiency
    const arrayArea = this.config.dustAndSolar.habitatSolarArrayAreaM2;
    const eff = this.config.dustAndSolar.photovoltaicEfficiency;
    const generationKW = Math.round((arrayArea * solarCalc.surfaceIrradianceWattsPerM2 * eff / 1000) * 10) / 10;
    this.liveState.powerGenerationKW = this.eventOverrides?.powerGenerationKW ?? Math.max(0.6, generationKW);

    // 3. Radiation readings (Curiosity RAD & MAVEN SEP)
    const rad = nasaDataProvider.getRadiationReading(context);
    let doseRate = rad.value;
    if (this.eventOverrides?.sepMultiplier) {
      doseRate = Math.round(doseRate * this.eventOverrides.sepMultiplier);
    }
    this.liveState.surfaceDoseRateUSvPerDay = doseRate;

    // Push primary environmental updates to existing HUD state
    updateTemperature(Math.round(this.liveState.airTemperatureDegC));
    updateSolarIntensity(this.liveState.solarIntensityPercent);
    updatePowerAvailable(this.liveState.powerGenerationKW);
    updatePowerConsumption(this.config.powerGrid.habitatBaseLoadConsumptionKW);
  }

  /**
   * 1-second simulation step.
   * Connects physical conditions to existing HUD and game state.
   */
  tick() {
    // 1. Radiation simulation
    this.simulateRadiation();

    // 2. Power & Battery balance simulation
    this.simulatePower();

    // 3. ECLSS Life Support simulation
    this.simulateLifeSupport();
  }

  simulateRadiation() {
    if (!this.config.radiation.enabled) return;

    if (this.isOutsideMars) {
      // Outdoor EVA: Astronaut exposed to surface radiation modulated by suit shielding
      const transmission = this.suitType === 'shielded'
        ? this.config.radiation.shieldedSuitTransmissionFraction
        : this.config.radiation.standardSuitTransmissionFraction;

      const baseDrain = this.config.radiation.outdoorDoseDrainPerSecond;
      const sepMult = this.eventOverrides?.sepMultiplier || 1.0;
      const effectiveDrain = baseDrain * transmission * sepMult * this.config.radiation.gameplayRadiationMultiplier;

      reduceRadiation(effectiveDrain);

      // Check radiation warning thresholds
      if (currentRadiation <= (100 - this.config.radiation.criticalThreshold)) {
        showGameMessage('CRITICAL RADIATION WARNING: Crew cumulative dose exceeding safe exposure limits.');
      } else if (currentRadiation <= (100 - this.config.radiation.alertThreshold)) {
        showGameMessage('RADIATION ALERT: Elevated particle flux detected on surface.');
      }
    } else {
      // Sheltered inside Outpost: Regolith and habitat shielding absorb ~92%
      // Crew receives negligible ambient dose; slow recovery if resting
      if (currentRadiation < 100) {
        regainRadiation(this.config.radiation.recoveryRatePerSecondInsideHabitat);
      }
    }
  }

  simulatePower() {
    if (!this.config.powerGrid.enabled) return;

    // Net power balance: Generation - Consumption
    const generation = this.liveState.powerGenerationKW;
    const consumption = this.config.powerGrid.habitatBaseLoadConsumptionKW;
    const powerDeficit = consumption > generation;

    if (powerDeficit) {
      // Drawing from habitat battery reserves
      const drainRate = this.eventOverrides?.batteryDrainRate
        ?? this.config.powerGrid.nominalBatteryDrainRatePerSecond;
      reduceBattery(drainRate);
    } else {
      // Surplus solar energy recharges battery
      if (currentBattery < 100) {
        regainBattery(this.config.powerGrid.batteryRecoveryRatePerSecond);
      }
    }

    // Monitor Hidden Consequence: Critical Battery Depletion
    const critThreshold = this.config.powerGrid.criticalBatteryThresholdPercent;
    if (currentBattery <= critThreshold) {
      if (!this.liveState.criticalBatteryAlertIssued) {
        this.liveState.criticalBatteryAlertIssued = true;
        showGameMessage('CRITICAL ALERT: Habitat power reserves approaching minimum operational capacity.');
      }
      // Apply critical penalty: extra battery drain and life support strain
      reduceBattery(this.config.powerGrid.criticalPenaltyDrainRatePerSecond);
      takeDamage(this.config.lifeSupport.health.criticalPowerHealthDamagePerTick);
    } else if (currentBattery > critThreshold + 5) {
      this.liveState.criticalBatteryAlertIssued = false;
    }
  }

  simulateLifeSupport() {
    if (!this.config.lifeSupport.oxygen.enabled) return;

    // If habitat power is critical or dead, oxygen generation systems degrade
    if (currentBattery <= 0) {
      showGameMessage('EMERGENCY: Life-support power loss. Atmospheric scrubbing offline.');
      takeDamage(2);
    }
  }

  /**
   * Returns complete live environmental report with scientific provenance.
   */
  getLiveReport() {
    return {
      mode: nasaDataProvider.getMode(),
      context: nasaDataProvider.getEnvironmentalContext(),
      measurements: {
        radiation: {
          surfaceDoseRate: this.liveState.surfaceDoseRateUSvPerDay,
          unit: 'uSv/day',
          provenance: PROVENANCE_TYPES.NASA_MEASURED,
          mission: 'MSL Curiosity',
          instrument: 'RAD',
        },
        dustOpacity: {
          tau: this.liveState.tau,
          unit: 'dimensionless_tau',
          provenance: PROVENANCE_TYPES.NASA_MEASURED,
          mission: 'Mars 2020 Perseverance',
          instrument: 'MEDA (RDS)',
        },
        solarIrradiance: {
          intensityPercent: this.liveState.solarIntensityPercent,
          powerGenerationKW: this.liveState.powerGenerationKW,
          unit: 'kW / %',
          provenance: PROVENANCE_TYPES.SIMULATED,
          model: 'NASA Glenn Beer-Lambert Extinction (TM-102299)',
        },
        meteorology: {
          airTemperatureDegC: this.liveState.airTemperatureDegC,
          pressurePa: this.liveState.atmosphericPressurePa,
          humidityPercent: this.liveState.relativeHumidityPercent,
          windSpeedMPerS: this.liveState.windSpeedMPerS,
          provenance: PROVENANCE_TYPES.NASA_MEASURED,
          mission: 'Mars 2020 Perseverance & MSL Curiosity',
          instrument: 'MEDA (ATS/PRS/HS/WS) & REMS',
        },
        lifeSupport: {
          oxygenPurity: 98,
          waterReserves: 120,
          provenance: PROVENANCE_TYPES.ESTIMATED,
          standard: 'NASA Human Integration Design Handbook (NASA/SP-2010-3407)',
        },
      },
    };
  }
}

export const marsEnvironmentalSimulator = new MarsEnvironmentalSimulator();
