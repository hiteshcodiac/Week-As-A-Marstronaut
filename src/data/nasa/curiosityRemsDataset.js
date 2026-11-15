/**
 * NASA Curiosity REMS (Rover Environmental Monitoring Station) Scientific Dataset
 *
 * Mission: Mars Science Laboratory (MSL) / Curiosity Rover
 * Instrument: Rover Environmental Monitoring Station (REMS)
 * PDS Node: PDS Atmospheres Node
 * PDS Identifier: urn:nasa:pds:msl_rems / DOI: 10.1007/s11214-012-9921-1
 * Reference: Gómez-Elvira et al., Space Sci Rev 170, 583–640 (2012)
 *
 * Original Measurement Units:
 * - Air Temperature: °C
 * - Ground Temperature: °C
 * - Pressure: Pascals (Pa)
 * - UV Flux: W/m^2 across multiple UV bands (UVA, UVB, UVC)
 * - Dust Opacity (tau): dimensionless
 */

export const CURIOSITY_REMS_DATASET = {
  metadata: {
    datasetName: 'MSL Curiosity REMS Gale Crater Meteorological Archive',
    mission: 'Mars Science Laboratory (MSL)',
    spacecraft: 'Curiosity Rover',
    instrument: 'Rover Environmental Monitoring Station (REMS)',
    instrumentPI: 'Javier Gómez-Elvira (Centro de Astrobiología / INTA-CSIC)',
    pdsIdentifier: 'urn:nasa:pds:msl_rems:data_derived',
    pdsUrl: 'https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/Curiosity/rems.html',
    doi: '10.1007/s11214-012-9921-1',
    primaryReference: 'Gómez-Elvira et al., Space Sci Rev 170, 583–640 (2012)',
    coordinateLocation: 'Gale Crater, Mars (4.59°S, 137.44°E, elevation -4.4 km)',
    sourceType: 'NASA_MEASURED',
    description:
      'Multi-year surface weather time series measuring diurnal thermal variations, atmospheric pressure tide cycles, relative humidity, and UV flux in Gale Crater.',
  },

  records: [
    {
      recordId: 'REMS_SOL_0600_NOMINAL',
      sol: 600,
      terrestrialDate: '2014-04-15T13:00:00Z',
      environmentalContext: 'Nominal mid-mission Gale Crater autumn diurnal cycle',
      measurements: {
        airTemperature: {
          mean: -64.2,
          min: -78.4,
          max: -8.5,
          unit: 'degC',
        },
        groundTemperature: {
          mean: -51.3,
          min: -89.2,
          max: 2.1,
          unit: 'degC',
          note: 'Ground temperature exceeds 0°C briefly near local noon during summer/autumn.',
        },
        atmosphericPressure: {
          mean: 840.5,
          min: 815.0,
          max: 868.0,
          unit: 'Pa',
          note: 'Higher pressure due to lower elevation inside Gale Crater basin.',
        },
        relativeHumidity: {
          mean: 6.2,
          min: 0.1,
          max: 55.0,
          unit: '%',
        },
        uvFluxMean: {
          value: 18.4,
          unit: 'W/m^2',
          sensor: 'UV photodiode array (200-380 nm)',
        },
        dustOpticalDepthTau: {
          value: 0.45,
          unit: 'dimensionless_tau',
        },
      },
      dataQuality: 'CALIBRATED_NOMINAL',
      processingApplied: 'Thermal inertia deconvolution and Mastcam cross-calibration applied.',
    },
    {
      recordId: 'REMS_SOL_2147_GLOBAL_DUST_STORM',
      sol: 2147,
      terrestrialDate: '2018-08-20T12:00:00Z',
      environmentalContext: '2018 Planet-Encircling Dust Storm (PEDE-2018) at maximum opacity',
      measurements: {
        airTemperature: {
          mean: -50.1,
          min: -68.3,
          max: -31.4,
          unit: 'degC',
          note: 'Strong radiative warming aloft and muted diurnal amplitude.',
        },
        groundTemperature: {
          mean: -48.6,
          min: -62.0,
          max: -35.2,
          unit: 'degC',
          note: 'Ground never warms above freezing due to dense dust veil blocking solar flux.',
        },
        atmosphericPressure: {
          mean: 865.0,
          min: 835.0,
          max: 895.0,
          unit: 'Pa',
        },
        relativeHumidity: {
          mean: 1.8,
          min: 0.05,
          max: 12.0,
          unit: '%',
        },
        uvFluxMean: {
          value: 0.8,
          unit: 'W/m^2',
          note: 'UV flux attenuated by over 95% by atmospheric dust.',
        },
        dustOpticalDepthTau: {
          value: 8.5,
          unit: 'dimensionless_tau',
          note: 'Extreme dust optical thickness measured by Mastcam and REMS solar attenuation.',
        },
      },
      dataQuality: 'CALIBRATED_STORM_EXTREME',
      processingApplied: 'Off-axis scattered irradiance modeling during near-total direct beam extinction.',
    },
  ],
};
