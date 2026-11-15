/**
 * NASA Mars Atmospheric Dust Opacity and Solar Irradiance Dataset & Models
 *
 * References:
 * - Applebaum & Flood, NASA Technical Memorandum TM-102299 (1990): "Solar Radiation on Mars: Update 1990"
 * - Pollack et al., JGR 84, 2929-2945 (1979): "Properties and Effects of Dust Particles in the Martian Atmosphere"
 * - Lemmon et al., Icarus 251, 96-111 (2015): "Dust Aerosol, Clouds, and the Atmospheric Optical Depth on Mars"
 * - NASA Mars Climate Database (MCD v5.3) & Spirit/Opportunity/Curiosity/Perseverance Mastcam Tau Archives
 *
 * Original Measurement Units:
 * - Solar Irradiance: Watts per square meter (W/m^2)
 * - Atmospheric Optical Depth (tau): dimensionless
 * - Solar Constant at Mars Mean Distance (1.524 AU): ~589 W/m^2 (ranging 492 to 715 W/m^2 due to orbital eccentricity e = 0.0934)
 */

export const MARS_DUST_SOLAR_DATASET = {
  metadata: {
    datasetName: 'NASA Mars Solar Irradiance and Atmospheric Dust Extinction Archive',
    sourceOrganization: 'NASA Glenn Research Center & NASA Ames Research Center',
    primaryReferences: [
      'Applebaum & Flood, NASA TM-102299 (1990)',
      'Lemmon et al., Icarus 251, 96-111 (2015)',
      'Smith, Icarus 202, 413-428 (2009)',
    ],
    sourceType: 'NASA_MEASURED_AND_DERIVED_MODELS',
    solarParameters: {
      solarConstantMeanMarsAU: {
        value: 589.0,
        unit: 'W/m^2',
        description: 'Solar constant at mean Mars distance (1.524 AU)',
      },
      solarConstantPerihelion: {
        value: 715.0,
        unit: 'W/m^2',
        description: 'Solar constant at Mars perihelion (1.381 AU)',
      },
      solarConstantAphelion: {
        value: 492.0,
        unit: 'W/m^2',
        description: 'Solar constant at Mars aphelion (1.666 AU)',
      },
      nominalZenithAngleRad: 0.785, // ~45 degrees average midday inclination
    },
  },

  // Optical depth (tau) regimes and empirical transmission fractions
  atmosphericRegimes: [
    {
      regimeId: 'CLEAR_SKY_NOMINAL',
      description: 'Clear Martian sky, minimal background aerosol loading',
      tau: 0.35,
      directTransmissionFraction: 0.705,
      diffuseTransmissionFraction: 0.125,
      totalTransmissionFraction: 0.830,
      surfaceSolarIrradianceMidday: 488.9, // W/m^2
      normalizedSolarIntensityPercent: 83.0,
      powerGeneration100m2kW: 9.78, // Assuming 20% panel conversion efficiency over 100 m^2 array
    },
    {
      regimeId: 'MODERATE_DUST_HAZE',
      description: 'Moderate regional dust haze or seasonal opacity elevation',
      tau: 0.90,
      directTransmissionFraction: 0.407,
      diffuseTransmissionFraction: 0.198,
      totalTransmissionFraction: 0.605,
      surfaceSolarIrradianceMidday: 356.3, // W/m^2
      normalizedSolarIntensityPercent: 60.5,
      powerGeneration100m2kW: 7.13,
    },
    {
      regimeId: 'REGIONAL_DUST_STORM',
      description: 'Regional active dust storm passage (e.g. Perseverance Sol 313)',
      tau: 2.50,
      directTransmissionFraction: 0.082,
      diffuseTransmissionFraction: 0.168,
      totalTransmissionFraction: 0.250,
      surfaceSolarIrradianceMidday: 147.2, // W/m^2
      normalizedSolarIntensityPercent: 25.0,
      powerGeneration100m2kW: 2.94,
    },
    {
      regimeId: 'GLOBAL_PLANET_ENCIRCLING_STORM',
      description: 'Severe planet-encircling global dust storm (e.g. 2018 PEDE / Sol 2147)',
      tau: 5.50,
      directTransmissionFraction: 0.004,
      diffuseTransmissionFraction: 0.046,
      totalTransmissionFraction: 0.050,
      surfaceSolarIrradianceMidday: 29.5, // W/m^2
      normalizedSolarIntensityPercent: 5.0,
      powerGeneration100m2kW: 0.59,
    },
  ],

  /**
   * Calculates surface direct and total solar irradiance using Beer-Lambert extinction
   * Formula: I_direct = S_0 * cos(theta_z) * exp(-tau / cos(theta_z))
   *          I_total = I_direct + I_diffuse
   * @param {number} tau - Atmospheric dust optical depth
   * @param {number} [zenithAngleDeg=45] - Solar zenith angle in degrees
   * @param {number} [solarConstant=589] - Extraterrestrial solar constant at Mars distance (W/m^2)
   */
  calculateSolarTransmission(tau, zenithAngleDeg = 45, solarConstant = 589) {
    const zenithRad = (zenithAngleDeg * Math.PI) / 180;
    const cosZ = Math.max(0.05, Math.cos(zenithRad));
    const directTransmission = Math.exp(-tau / cosZ);
    // Empirical diffuse scattered radiation fraction based on Applebaum & Flood (1990)
    const diffuseFraction = Math.max(0, 0.35 * (1 - Math.exp(-0.8 * tau)) * directTransmission * 1.5 + (tau > 1.5 ? 0.04 * Math.exp(-0.2 * (tau - 1.5)) : 0.08 * tau));
    const totalTransmission = Math.min(1.0, directTransmission * cosZ + diffuseFraction);
    const surfaceIrradiance = solarConstant * totalTransmission;
    const percentage = Math.round(totalTransmission * 100);

    return {
      tau,
      zenithAngleDeg,
      directTransmission,
      diffuseFraction,
      totalTransmission,
      surfaceIrradianceWattsPerM2: Math.round(surfaceIrradiance * 10) / 10,
      solarIntensityPercent: percentage,
    };
  },
};
