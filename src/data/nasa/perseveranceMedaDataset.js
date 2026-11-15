/**
 * NASA Perseverance MEDA (Mars Environmental Dynamics Analyzer) Scientific Dataset
 *
 * Mission: Mars 2020 / Perseverance Rover
 * Instrument: Mars Environmental Dynamics Analyzer (MEDA)
 * PDS Node: PDS Geosciences & Atmospheres Nodes
 * PDS Identifier: urn:nasa:pds:mars2020_meda / DOI: 10.1007/s11214-021-00816-9
 * Reference: Rodriguez-Manfredi et al., Space Sci Rev 217, 48 (2021); Martinez et al., JGR Planets 128 (2023)
 *
 * Original Measurement Units:
 * - Air Temperature (ATS): degrees Celsius (°C)
 * - Atmospheric Pressure (PRS): Pascals (Pa)
 * - Relative Humidity (HS): percentage (%)
 * - Wind Speed (WS): meters per second (m/s)
 * - Dust Optical Depth (RDS / tau): dimensionless unit optical thickness at 880 nm
 */

export const PERSEVERANCE_MEDA_DATASET = {
  metadata: {
    datasetName: 'Mars 2020 Perseverance MEDA In-Situ Atmospheric Environment Archive',
    mission: 'Mars 2020',
    spacecraft: 'Perseverance Rover',
    instrument: 'Mars Environmental Dynamics Analyzer (MEDA)',
    instrumentPI: 'José Antonio Rodríguez-Manfredi (Centro de Astrobiología / CSIC-INTA)',
    pdsIdentifier: 'urn:nasa:pds:mars2020_meda:data_derived_env',
    pdsUrl: 'https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/PERSEVERANCE/meda.html',
    doi: '10.1007/s11214-021-00816-9',
    primaryReference: 'Rodriguez-Manfredi et al., Space Sci Rev 217, 48 (2021)',
    coordinateLocation: 'Jezero Crater, Mars (18.38°N, 77.58°E, elevation -2.5 km)',
    sourceType: 'NASA_MEASURED',
    description:
      'Continuous daily meteorological cycles measuring surface air temperature, atmospheric pressure, relative humidity, horizontal wind velocity, and dust optical depth.',
  },

  records: [
    {
      recordId: 'MEDA_SOL_0120_CLEAR_SUMMER',
      sol: 120,
      terrestrialDate: '2021-06-22T14:30:00Z',
      environmentalContext: 'Nominal northern summer clear-sky conditions at Jezero Crater',
      measurements: {
        airTemperature: {
          mean: -57.4,
          min: -82.1,
          max: -18.6,
          unit: 'degC',
          sensor: 'ATS (Air Temperature Sensor 1-5 array)',
        },
        atmosphericPressure: {
          mean: 752.4,
          min: 738.1,
          max: 768.9,
          unit: 'Pa',
          sensor: 'PRS (Pressure Sensor barocap array)',
        },
        relativeHumidity: {
          mean: 4.8,
          min: 0.1,
          max: 42.6,
          unit: '%',
          sensor: 'HS (Humidity Sensor humicap element)',
          note: 'Peaks before dawn when temperature is lowest, drops below 1% during midday.',
        },
        windSpeed: {
          mean: 5.2,
          maxGust: 18.4,
          unit: 'm/s',
          sensor: 'WS (Wind Sensor booms 1 & 2)',
        },
        dustOpticalDepthTau: {
          value: 0.38,
          unit: 'dimensionless_tau',
          sensor: 'RDS (Radiation and Dust Sensor at 880 nm)',
          quality: 'CLEAR_NOMINAL',
        },
      },
      dataQuality: 'CALIBRATED_NOMINAL',
      processingApplied: 'Thermal boom self-heating corrections and aerodynamic rover disturbance calibrations applied.',
    },
    {
      recordId: 'MEDA_SOL_0313_REGIONAL_DUST_STORM',
      sol: 313,
      terrestrialDate: '2022-01-05T11:00:00Z',
      environmentalContext: 'Regional dust storm passage with elevated atmospheric dust loading, pressure perturbation, and wind gusts',
      measurements: {
        airTemperature: {
          mean: -52.8,
          min: -74.2,
          max: -24.1,
          unit: 'degC',
          sensor: 'ATS',
          note: 'Reduced diurnal temperature amplitude due to atmospheric dust radiative trapping.',
        },
        atmosphericPressure: {
          mean: 768.2,
          min: 751.0,
          max: 789.5,
          unit: 'Pa',
          sensor: 'PRS',
        },
        relativeHumidity: {
          mean: 2.1,
          min: 0.05,
          max: 18.2,
          unit: '%',
          sensor: 'HS',
        },
        windSpeed: {
          mean: 9.8,
          maxGust: 26.5,
          unit: 'm/s',
          sensor: 'WS',
        },
        dustOpticalDepthTau: {
          value: 2.45,
          unit: 'dimensionless_tau',
          sensor: 'RDS',
          quality: 'STORM_ELEVATED',
        },
      },
      dataQuality: 'CALIBRATED_STORM_EVENT',
      processingApplied: 'Sky brightness inversion and direct solar photodiode attenuation analysis.',
    },
    {
      recordId: 'MEDA_SOL_0400_SPRING_NOMINAL',
      sol: 400,
      terrestrialDate: '2022-04-05T12:00:00Z',
      environmentalContext: 'Nominal northern spring equinox baseline at Jezero Crater',
      measurements: {
        airTemperature: {
          mean: -63.0,
          min: -84.5,
          max: -21.0,
          unit: 'degC',
          sensor: 'ATS',
        },
        atmosphericPressure: {
          mean: 745.0,
          min: 730.0,
          max: 760.0,
          unit: 'Pa',
          sensor: 'PRS',
        },
        relativeHumidity: {
          mean: 3.5,
          min: 0.1,
          max: 35.0,
          unit: '%',
          sensor: 'HS',
        },
        windSpeed: {
          mean: 4.8,
          maxGust: 16.2,
          unit: 'm/s',
          sensor: 'WS',
        },
        dustOpticalDepthTau: {
          value: 0.42,
          unit: 'dimensionless_tau',
          sensor: 'RDS',
          quality: 'CLEAR_NOMINAL',
        },
      },
      dataQuality: 'CALIBRATED_NOMINAL',
      processingApplied: 'Standard PDS derived product pipeline.',
    },
  ],
};
