/**
 * NASA Curiosity RAD (Radiation Assessment Detector) Scientific Dataset
 *
 * Mission: Mars Science Laboratory (MSL) / Curiosity Rover
 * Instrument: Radiation Assessment Detector (RAD)
 * PDS Node: PDS Planetary Plasma Interactions (PPI) Node / PDS Atmospheres Node
 * PDS Identifier: urn:nasa:pds:msl_rad / DOI: 10.1126/science.1244797
 * Reference: Hassler et al., Science 343, 1244797 (2014); Zeitlin et al., Space Sci Rev 215, 29 (2019)
 *
 * Original Measurement Units:
 * - Absorbed Dose Rate in Silicon: microgray per day (uGy/day)
 * - Equivalent Dose Rate in Human Tissue: microsievert per day (uSv/day)
 */

export const CURIOSITY_RAD_DATASET = {
  metadata: {
    datasetName: 'MSL Curiosity RAD Mars Surface Radiation Dosimetry Archive',
    mission: 'Mars Science Laboratory (MSL)',
    spacecraft: 'Curiosity Rover',
    instrument: 'Radiation Assessment Detector (RAD)',
    instrumentPI: 'Donald M. Hassler (Southwest Research Institute)',
    pdsIdentifier: 'urn:nasa:pds:msl_rad:data_rad',
    pdsUrl: 'https://pds-ppi.igpp.ucla.edu/mission/MarsScienceLaboratory/MSL/RAD',
    doi: '10.1126/science.1244797',
    primaryReference: 'Hassler et al., Science 343, 1244797 (2014)',
    coordinateLocation: 'Gale Crater, Mars (4.59°S, 137.44°E, elevation -4.4 km)',
    sourceType: 'NASA_MEASURED',
    description:
      'In-situ surface radiation measurements covering Galactic Cosmic Rays (GCR) background and Solar Energetic Particle (SEP) events on the Martian surface.',
  },

  // Representative records spanning nominal background, SEP solar flare, and global dust storm
  records: [
    {
      recordId: 'RAD_SOL_0300_NOMINAL_GCR',
      sol: 300,
      terrestrialDate: '2013-06-11T12:00:00Z',
      environmentalContext: 'Nominal Galactic Cosmic Ray (GCR) background at solar maximum',
      measurements: {
        absorbedDoseRateSilicon: {
          value: 210,
          unit: 'uGy/day',
          uncertainty: 40,
        },
        equivalentDoseRateTissue: {
          value: 640,
          unit: 'uSv/day',
          uncertainty: 120,
        },
        annualizedEquivalentDose: {
          value: 233.6,
          unit: 'mSv/year',
          uncertainty: 43.8,
        },
      },
      dataQuality: 'CALIBRATED_NOMINAL',
      processingApplied: 'Raw sensor pulse height integration calibrated using GEANT4 Monte Carlo response model.',
    },
    {
      recordId: 'RAD_SOL_1818_SEP_EVENT',
      sol: 1818,
      terrestrialDate: '2017-09-11T18:00:00Z',
      environmentalContext: 'Major Solar Energetic Particle (SEP) event caused by an X8.2-class solar flare and fast coronal mass ejection',
      measurements: {
        absorbedDoseRateSilicon: {
          value: 680,
          unit: 'uGy/day',
          uncertainty: 85,
        },
        equivalentDoseRateTissue: {
          value: 2150,
          unit: 'uSv/day',
          uncertainty: 310,
        },
        annualizedEquivalentDose: {
          value: 784.8,
          unit: 'mSv/year',
          uncertainty: 113.1,
        },
      },
      dataQuality: 'CALIBRATED_EVENT_PEAK',
      processingApplied: 'High-flux scintillation and silicon detector pulse stack reconstruction during extreme particle storm.',
    },
    {
      recordId: 'RAD_SOL_2147_GLOBAL_DUST_STORM',
      sol: 2147,
      terrestrialDate: '2018-08-20T10:00:00Z',
      environmentalContext: '2018 Global Planet-Encircling Dust Storm (PEDE-2018) at maximum opacity (tau > 8)',
      measurements: {
        absorbedDoseRateSilicon: {
          value: 198,
          unit: 'uGy/day',
          uncertainty: 35,
        },
        equivalentDoseRateTissue: {
          value: 590,
          unit: 'uSv/day',
          uncertainty: 105,
        },
        annualizedEquivalentDose: {
          value: 215.4,
          unit: 'mSv/year',
          uncertainty: 38.3,
        },
      },
      dataQuality: 'CALIBRATED_NOMINAL',
      processingApplied: 'Atmospheric column density increase provides slight (~8%) GCR dose attenuation via thicker airmass.',
    },
  ],
};
