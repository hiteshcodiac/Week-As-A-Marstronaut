/**
 * NASA MAVEN SEP (Solar Energetic Particle) Scientific Dataset
 *
 * Mission: Mars Atmosphere and Volatile EvolutioN (MAVEN)
 * Instrument: Solar Energetic Particle (SEP) instrument
 * PDS Node: PDS Planetary Plasma Interactions (PPI) Node
 * PDS Identifier: urn:nasa:pds:maven.sep / DOI: 10.1007/s11214-015-0218-z
 * Reference: Larson et al., Space Sci Rev 200, 219–253 (2015); Lee et al., JGR Space Physics 123 (2018)
 *
 * Original Measurement Units:
 * - Energetic Proton Flux: particles / (cm^2 * s * sr * MeV)
 * - Integral Proton Flux (E > 10 MeV): proton flux units (pfu = protons / (cm^2 * s * sr))
 * - Electron Flux (20 keV - 1 MeV): electrons / (cm^2 * s * sr * keV)
 */

export const MAVEN_SEP_DATASET = {
  metadata: {
    datasetName: 'MAVEN SEP Energetic Charged Particle Environment Archive',
    mission: 'Mars Atmosphere and Volatile EvolutioN (MAVEN)',
    spacecraft: 'MAVEN Orbiter',
    instrument: 'Solar Energetic Particle (SEP) instrument',
    instrumentPI: 'Davin E. Larson (Space Sciences Laboratory, UC Berkeley)',
    pdsIdentifier: 'urn:nasa:pds:maven.sep:data_calibrated',
    pdsUrl: 'https://pds-ppi.igpp.ucla.edu/mission/MAVEN/MAVEN/SEP',
    doi: '10.1007/s11214-015-0218-z',
    primaryReference: 'Larson et al., Space Sci Rev 200, 219–253 (2015)',
    orbitLocation: 'Mars exosphere / orbit periapsis 150 km to apoapsis 6200 km',
    sourceType: 'NASA_MEASURED',
    description:
      'In-situ energetic ion (20 keV to 12 MeV) and electron (20 keV to 1 MeV) spectra upstream of and interacting with the Martian magnetosphere and upper atmosphere.',
  },

  records: [
    {
      recordId: 'MAVEN_SEP_QUIET_BASELINE',
      terrestrialDate: '2016-04-10T00:00:00Z',
      environmentalContext: 'Nominal solar wind quiet interplanetary background at 1.52 AU',
      measurements: {
        integralProtonFluxAbove10MeV: {
          value: 0.08,
          unit: 'pfu',
          uncertainty: 0.02,
          note: 'Protons / (cm^2 * s * sr). Quiet solar background before event.',
        },
        differentialProtonFlux20To100keV: {
          value: 12.5,
          unit: 'particles/(cm^2*s*sr*MeV)',
        },
        solarWindActivityLevel: 'QUIET',
        stormCategory: 'NONE',
      },
      dataQuality: 'CALIBRATED_NOMINAL',
      processingApplied: 'Geometrical factor and background anticoincidence corrections applied.',
    },
    {
      recordId: 'MAVEN_SEP_2017_SEPTEMBER_EVENT',
      terrestrialDate: '2017-09-11T16:00:00Z',
      environmentalContext: 'Extreme Solar Energetic Particle (SEP) event associated with AR 12673 X8.2 solar flare and fast CME at Mars',
      measurements: {
        integralProtonFluxAbove10MeV: {
          value: 480.0,
          unit: 'pfu',
          uncertainty: 45.0,
          note: 'Flux increased by a factor of >6000x over quiet background, triggering intense Martian global aurora and high ionization.',
        },
        differentialProtonFlux20To100keV: {
          value: 85000.0,
          unit: 'particles/(cm^2*s*sr*MeV)',
        },
        solarWindActivityLevel: 'EXTREME_SEP_STORM',
        stormCategory: 'S3_STRONG_SEP',
      },
      dataQuality: 'CALIBRATED_EVENT_PEAK',
      processingApplied: 'High-rate buffer pile-up correction and multi-angle flux deconvolution.',
    },
  ],
};
