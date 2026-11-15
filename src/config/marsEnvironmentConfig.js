/**
 * Centralized Mars Environmental Configuration
 *
 * This module is the single source of truth for all environmental conditions,
 * life support parameters, power grid balancing, and emergency event tuning in AstroTrainer.
 *
 * Architecture:
 * - Every parameter includes a documented scientific unit.
 * - Scientifically sourced baseline values (derived from NASA PDS archives: Curiosity RAD,
 *   Perseverance MEDA, Curiosity REMS, MAVEN SEP, and NASA ECLSS standards) are explicitly
 *   separated from gameplay tuning multipliers.
 * - Any parameter can be adjusted here without modifying individual event or scene scripts.
 */

import { DATA_SOURCE_MODES } from '../data/nasa/nasaDataProvider.js';

export const MARS_ENVIRONMENT_CONFIG = {
  // Global Data Source Mode: 'NASA_DATA' (PDS archived observations) or 'SIMULATION' (synthetic models)
  dataSourceMode: DATA_SOURCE_MODES.NASA_DATA,

  // ============================================================================
  // 1. RADIATION SYSTEM (NASA Curiosity RAD & MAVEN SEP)
  // ============================================================================
  radiation: {
    // Scientific baseline measurements from MSL RAD (Hassler et al., Science 2014)
    scientificBaselineEquivalentDoseTissue: 640.0, // uSv/day (tissue-equivalent GCR background)
    scientificBaselineAbsorbedDoseSilicon: 210.0,  // uGy/day (absorbed dose in silicon)
    scientificBaselineAnnualizedDose: 233.6,        // mSv/year

    // Solar Energetic Particle (SEP) event multiplier (derived from MSL RAD Sol 1818 / MAVEN SEP 2017)
    // 2150 uSv/day / 640 uSv/day ≈ 3.36x peak intensity
    sepEventRadiationMultiplier: 3.36,

    // Shielding attenuation factors (transmission fraction: lower = better protection)
    // Habitat regolith/water wall shielding attenuates ~92% of surface radiation
    habitatShieldingTransmissionFraction: 0.08, // 8% reaches crew (92% absorbed)
    // Standard astronaut EVA suit attenuates ~15% of surface radiation
    standardSuitTransmissionFraction: 0.85,     // 85% reaches crew (15% absorbed)
    // Specially reinforced / shielded exploration suit attenuates ~65% of radiation
    shieldedSuitTransmissionFraction: 0.35,     // 35% reaches crew (65% absorbed)

    // Gameplay HUD scaling & alert thresholds (0 to 100 HUD bar)
    gameplayRadiationMultiplier: 1.0,           // Master tuning scale for radiation sensitivity
    alertThreshold: 75.0,                       // % HUD bar level triggering WARNING alert
    criticalThreshold: 90.0,                    // % HUD bar level triggering CRITICAL alert
    outdoorDoseDrainPerSecond: 0.8,             // HUD points lost/sec during outdoor EVA in nominal GCR
    recoveryRatePerSecondInsideHabitat: 0.25,   // HUD points recovered/sec when in medical/safe bay
    enabled: true,
  },

  // ============================================================================
  // 2. ATMOSPHERE & METEOROLOGY (NASA Perseverance MEDA & Curiosity REMS)
  // ============================================================================
  atmosphere: {
    // Air temperature (°C) derived from MEDA Jezero Crater (Rodriguez-Manfredi et al. 2021)
    temperature: {
      scientificBaselineMean: -63.0,            // °C (annual Jezero/Gale surface mean)
      scientificBaselineMin: -84.5,             // °C (pre-dawn minimum)
      scientificBaselineMax: -21.0,             // °C (mid-afternoon maximum)
      stormRadiativeOffset: 10.2,               // °C (atmospheric dust traps thermal IR, warming aloft)
      gameplayMultiplier: 1.0,
      enabled: true,
    },

    // Atmospheric surface pressure (Pa) derived from MEDA PRS
    pressure: {
      scientificBaselineMean: 750.0,            // Pa (0.75 kPa / 7.5 mbar)
      scientificBaselineMin: 720.0,             // Pa (seasonal CO2 cap condensation low)
      scientificBaselineMax: 870.0,             // Pa (seasonal CO2 sublimation high)
      gameplayMultiplier: 1.0,
      enabled: true,
    },

    // Relative humidity (%) derived from MEDA HS
    humidity: {
      scientificBaselineMean: 3.5,              // % (mean near-surface relative humidity)
      scientificBaselineNocturnalPeak: 45.0,    // % (pre-dawn peak when temperature is at minimum)
      scientificBaselineMiddayLow: 0.1,         // % (sub-1% daytime minimum)
      gameplayMultiplier: 1.0,
      enabled: true,
    },

    // Horizontal wind velocity (m/s) derived from MEDA WS
    wind: {
      scientificBaselineMeanSpeed: 5.2,         // m/s (~18.7 km/h ambient breeze)
      stormGustMaxSpeed: 26.5,                  // m/s (~95.4 km/h dust storm gust peak)
      gameplayMultiplier: 1.0,
      enabled: true,
    },
  },

  // ============================================================================
  // 3. DUST OPACITY & SOLAR EXTINCTION (NASA Solar Research & Mastcam Tau)
  // ============================================================================
  dustAndSolar: {
    // Optical depth (tau) regimes (Lemmon et al. 2015, Applebaum & Flood 1990)
    clearSkyTau: 0.38,                          // Dimensionless optical depth in clear Martian weather
    moderateHazeTau: 0.90,                      // Seasonal background haze
    regionalStormTau: 2.45,                     // Active regional dust storm
    globalStormTau: 5.50,                       // Severe planet-encircling global dust storm (e.g. 2018 PEDE)

    // Solar constant at Mars mean orbital distance (1.524 AU)
    solarConstantMeanMars: 589.0,               // W/m^2 (versus 1361 W/m^2 at Earth)
    nominalZenithAngleDeg: 45.0,                // Average midday solar inclination angle

    // Solar array engineering parameters
    nominalClearSkySolarIntensityPercent: 76.0, // Matches Mission Status HUD initial baseline (76%)
    habitatSolarArrayAreaM2: 100.0,             // m^2 total habitat photovoltaic array
    photovoltaicEfficiency: 0.20,               // 20% triple-junction space PV conversion efficiency
    nominalPeakPowerGenerationKW: 8.7,          // kW peak under nominal clear sky (matches HUD: 8.7 kWh)

    // Storm solar power loss
    stormSolarPowerReductionPercent: 65.0,      // % reduction during severe storm (76% -> 26%)
    stormTauRampRatePerSecond: 0.04,            // Tau growth rate per second during storm development
    enabled: true,
  },

  // ============================================================================
  // 4. POWER GRID & BATTERY SYSTEMS
  // ============================================================================
  powerGrid: {
    habitatBaseLoadConsumptionKW: 2.4,          // kW continuous life-support & thermal baseline load
    habitatBatteryCapacityKWh: 100.0,           // kWh total storage capacity (represented on 0-100 HUD)
    criticalBatteryThresholdPercent: 20.0,       // % remaining battery that triggers HIDDEN CRITICAL ALERT
    nominalBatteryDrainRatePerSecond: 0.25,     // % per second battery drain rate during power deficit
    criticalPenaltyDrainRatePerSecond: 0.50,    // % per second accelerated drain once critical threshold breached
    batteryRecoveryRatePerSecond: 0.40,         // % per second recharge rate when solar exceeds base load
    suitBatteryCapacityHours: 8.0,              // Nominal 8-hour EVA suit battery endurance
    suitBatteryDepletionRatePerMinute: 0.21,    // % suit battery used per minute during EVA
    enabled: true,
  },

  // ============================================================================
  // 5. LIFE SUPPORT & ECLSS CONSUMPTION (NASA Human Integration Design Handbook)
  // ============================================================================
  lifeSupport: {
    // Oxygen parameters (NASA-STD-3001 metabolic consumption: 0.84 kg O2 / person / day)
    oxygen: {
      scientificConsumptionKgPerDay: 0.84,      // kg/person/day
      nominalPurityPercent: 98.0,               // % oxygen concentration (matches HUD: 98%)
      nominalDepletionRatePerMinute: 0.02,      // % per minute normal ECLSS variance
      criticalFailureDepletionRatePerSec: 0.15, // % per second rapid loss if life support loses power
      enabled: true,
    },

    // Water parameters (NASA-STD-3001 baseline: 2.5 - 3.5 L / person / day)
    water: {
      scientificConsumptionLitersPerDay: 3.0,   // L/person/day
      habitatReserveInitialLiters: 120.0,       // L (matches HUD: 120 L)
      consumptionRateLitersPerMinute: 0.05,     // L/min usage during active operations
      enabled: true,
    },

    // Caloric / food consumption (NASA-STD-3001: 2800 kcal / person / day)
    food: {
      scientificCaloricIntakeKcalPerDay: 2800,  // kcal/person/day
      hungerDrainRatePerSecond: 0.05,           // % hunger drain per second during astronaut exertion
      regainPerRationPack: 20.0,                // % hunger restored per emergency ration pack
      enabled: true,
    },

    // Astronaut health & hazard impact
    health: {
      maxHealth: 100,
      criticalPowerHealthDamagePerTick: 1.0,    // HP damage/sec when life support power is depleted
      extremeRadiationHealthDamagePerTick: 0.8, // HP damage/sec when radiation bar drops to 0
      enabled: true,
    },
  },

  // ============================================================================
  // 6. EMERGENCY EVENTS: THE DOUBLE STORM CONFIGURATION
  // ============================================================================
  theDoubleStorm: {
    stormDurationSeconds: 120,                  // 2 minutes total event duration
    stormSeverityLabel: 'SEVERE DUST + SEP EVENT',
    targetDustOpticalDepthTau: 2.45,            // Elevated atmospheric tau from MEDA Sol 313
    solarIntensityDropPercent: 50.0,            // Drops solar intensity from 76% down to 26%
    sepRadiationMultiplier: 3.36,               // Peak MSL RAD Sol 1818 SEP event multiplier
    criticalBatteryThreshold: 20.0,             // Battery % triggering hidden emergency consequence
    criticalMessageAlert: 'CRITICAL ALERT: Habitat power reserves approaching minimum operational capacity.',

    // Option A: Wait for conditions to improve
    waitOption: {
      durationSeconds: 40,                      // 40-second shelter countdown
      habitatBatteryDrainMultiplier: 1.6,       // Heating and life support draw on batteries
      crewRadiationExposureRate: 0.0,           // 100% protected inside sealed habitat
      narrativeStatus: 'Crew sheltered inside Outpost. Waiting for solar storm peak to pass.',
    },

    // Option B: Immediate EVA
    immediateEVA: {
      suitBatteryCost: 15.0,                    // Instant battery deduction for EVA startup
      outdoorRadiationMultiplier: 1.0,          // Full unfiltered SEP particle exposure
      outdoorRadiationDrainPerSecond: 1.2,      // Heavy radiation drain outside
      narrativeStatus: 'Immediate EVA initiated. Retrieve replacement power component on Mars.',
    },

    // Option C: Use specially shielded exploration suit
    shieldedEVA: {
      preparationTimeSeconds: 25,               // 25-second preparation timer
      additionalPowerCost: 12.0,                // Power consumed by high-energy shield coils
      radiationReductionFactor: 0.35,           // Absorbs only 35% radiation (65% protection)
      outdoorRadiationDrainPerSecond: 0.42,      // Significantly reduced radiation drain outside
      narrativeStatus: 'Enhancing suit radiation shielding. Preparation underway.',
    },

    // Component retrieval reward
    retrievalReward: {
      batteryGain: 30.0,                        // Restores 30% battery reserves
      solarIntensityRestore: 75.0,              // Restores solar generation to 75%
      powerAvailableRestoreKW: 8.5,             // Restores generation to 8.5 kW
      emergencyLabel: 'POWER RESTORED — STORM SUBSIDING',
    },

    // World coordinates of power component on Mars
    powerComponentLocation: {
      x: 1850,
      y: 820,
      interactionDistance: 130,
    },
  },
};

/**
 * Helper to update a specific environmental config value dynamically.
 * @param {string} category - e.g. 'radiation', 'atmosphere', 'theDoubleStorm'
 * @param {string} key - e.g. 'alertThreshold', 'gameplayMultiplier'
 * @param {any} value - New value to set
 */
export function setEnvironmentConfig(category, key, value) {
  if (MARS_ENVIRONMENT_CONFIG[category] && key in MARS_ENVIRONMENT_CONFIG[category]) {
    MARS_ENVIRONMENT_CONFIG[category][key] = value;
    return true;
  }
  return false;
}
