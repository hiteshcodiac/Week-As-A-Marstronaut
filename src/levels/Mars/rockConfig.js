/**
 * ============================================================================
 * MARS ROCK CONFIGURATION & CENTRALIZED COORDINATES
 * ============================================================================
 * All rock coordinates, sprite frames, hitboxes, and proximity radii are
 * defined here. You can manually adjust the coordinates, scale, or sprite
 * of ANY individual rock directly in DEFAULT_ROCK_POSITIONS below.
 */

export const MARTIAN_ROCKS_TEXTURE_KEY = 'martian-rocks';

// Proximity detection configuration
// Triggers closer to the solid hitbox of each rock (e.g. 24px clearance from hitbox edge)
export const PROXIMITY_CONFIG = {
  hitboxMargin: 24, // Distance from the rock's solid collision boundary to trigger proximity
  debugDuration: 1200, // Milliseconds to display the temporary debug message
};

// Rover physical collision radius in world coordinate units
export const ROVER_COLLISION_RADIUS = 14;

/**
 * 27 Individual Rock Sprite Frame Definitions from "Martian Rocks.png" (666 x 375).
 * Hitbox factors are reduced to focus specifically on the tight solid base of each rock.
 */
export const ROCK_FRAMES = {
  rock_1: { x: 11, y: 11, width: 110, height: 72, hitboxWidthFactor: 0.60, hitboxHeightFactor: 0.42, offsetY: 4 },
  rock_2: { x: 141, y: 23, width: 89, height: 51, hitboxWidthFactor: 0.58, hitboxHeightFactor: 0.40, offsetY: 3 },
  rock_3: { x: 253, y: 31, width: 66, height: 40, hitboxWidthFactor: 0.56, hitboxHeightFactor: 0.40, offsetY: 2 },
  rock_4: { x: 350, y: 20, width: 55, height: 58, hitboxWidthFactor: 0.54, hitboxHeightFactor: 0.45, offsetY: 3 },
  rock_5: { x: 434, y: 20, width: 55, height: 56, hitboxWidthFactor: 0.54, hitboxHeightFactor: 0.45, offsetY: 3 },
  rock_6: { x: 521, y: 20, width: 42, height: 57, hitboxWidthFactor: 0.54, hitboxHeightFactor: 0.45, offsetY: 3 },
  rock_7: { x: 595, y: 19, width: 64, height: 57, hitboxWidthFactor: 0.58, hitboxHeightFactor: 0.42, offsetY: 3 },
  rock_8: { x: 10, y: 102, width: 83, height: 59, hitboxWidthFactor: 0.60, hitboxHeightFactor: 0.42, offsetY: 3 },
  rock_9: { x: 121, y: 114, width: 57, height: 39, hitboxWidthFactor: 0.58, hitboxHeightFactor: 0.42, offsetY: 2 },
  rock_10: { x: 351, y: 103, width: 52, height: 53, hitboxWidthFactor: 0.56, hitboxHeightFactor: 0.45, offsetY: 3 },
  rock_11: { x: 427, y: 101, width: 61, height: 59, hitboxWidthFactor: 0.58, hitboxHeightFactor: 0.42, offsetY: 3 },
  rock_12: { x: 571, y: 105, width: 95, height: 59, hitboxWidthFactor: 0.62, hitboxHeightFactor: 0.42, offsetY: 3 },
  rock_13: { x: 202, y: 120, width: 38, height: 28, hitboxWidthFactor: 0.54, hitboxHeightFactor: 0.40, offsetY: 1 },
  rock_14: { x: 271, y: 121, width: 42, height: 26, hitboxWidthFactor: 0.54, hitboxHeightFactor: 0.40, offsetY: 1 },
  rock_15: { x: 509, y: 121, width: 41, height: 21, hitboxWidthFactor: 0.54, hitboxHeightFactor: 0.40, offsetY: 1 },
  rock_16: { x: 204, y: 208, width: 22, height: 14, hitboxWidthFactor: 0.52, hitboxHeightFactor: 0.38, offsetY: 1 },
  rock_17: { x: 266, y: 192, width: 51, height: 36, hitboxWidthFactor: 0.56, hitboxHeightFactor: 0.40, offsetY: 2 },
  rock_18: { x: 357, y: 198, width: 28, height: 22, hitboxWidthFactor: 0.54, hitboxHeightFactor: 0.40, offsetY: 1 },
  rock_19: { x: 400, y: 236, width: 98, height: 44, hitboxWidthFactor: 0.62, hitboxHeightFactor: 0.40, offsetY: 3 },
  rock_20: { x: 568, y: 201, width: 62, height: 41, hitboxWidthFactor: 0.58, hitboxHeightFactor: 0.42, offsetY: 2 },
  rock_21: { x: 0, y: 248, width: 66, height: 42, hitboxWidthFactor: 0.58, hitboxHeightFactor: 0.42, offsetY: 2 },
  rock_22: { x: 144, y: 260, width: 48, height: 19, hitboxWidthFactor: 0.54, hitboxHeightFactor: 0.40, offsetY: 1 },
  rock_23: { x: 334, y: 262, width: 90, height: 48, hitboxWidthFactor: 0.60, hitboxHeightFactor: 0.42, offsetY: 3 },
  rock_24: { x: 505, y: 292, width: 24, height: 13, hitboxWidthFactor: 0.52, hitboxHeightFactor: 0.38, offsetY: 1 },
  rock_25: { x: 525, y: 288, width: 137, height: 87, hitboxWidthFactor: 0.62, hitboxHeightFactor: 0.42, offsetY: 4 },
  rock_26: { x: 108, y: 306, width: 62, height: 53, hitboxWidthFactor: 0.58, hitboxHeightFactor: 0.42, offsetY: 3 },
  rock_27: { x: 197, y: 302, width: 80, height: 42, hitboxWidthFactor: 0.58, hitboxHeightFactor: 0.40, offsetY: 2 },
};

/**
 * ============================================================================
 * CENTRALIZED MANUALLY EDITABLE ROCK POSITIONS (LOWER 70-80% OF BACKGROUND)
 * ============================================================================
 * Total rocks tripled (12-18 per section, 60 total across 4 consecutive sections).
 * Y positions are confined to the lower 75% of the background (y: ~195 to 720).
 * You can modify the x, y, sprite, or scale of ANY individual rock here.
 */
export const DEFAULT_ROCK_POSITIONS = [
  // --- SECTION 0: 0% - 30% of background width (x: 0 - 409) ---
  { id: 'rock_0_1', section: 0, x: 325, y: 570, sprite: 'rock_9', scale: 0.45 },
  { id: 'rock_0_2', section: 0, x: 81, y: 679, sprite: 'rock_4', scale: 0.36 },
  { id: 'rock_0_3', section: 0, x: 322, y: 229, sprite: 'rock_22', scale: 0.43 },
  { id: 'rock_0_4', section: 0, x: 326, y: 718, sprite: 'rock_7', scale: 0.32 },
  { id: 'rock_0_5', section: 0, x: 66, y: 370, sprite: 'rock_6', scale: 0.42 },
  { id: 'rock_0_6', section: 0, x: 278, y: 581, sprite: 'rock_27', scale: 0.47 },
  { id: 'rock_0_7', section: 0, x: 257, y: 485, sprite: 'rock_16', scale: 0.37 },
  { id: 'rock_0_8', section: 0, x: 297, y: 376, sprite: 'rock_19', scale: 0.36 },
  { id: 'rock_0_9', section: 0, x: 363, y: 332, sprite: 'rock_6', scale: 0.36 },
  { id: 'rock_0_10', section: 0, x: 80, y: 493, sprite: 'rock_6', scale: 0.41 },
  { id: 'rock_0_11', section: 0, x: 376, y: 478, sprite: 'rock_22', scale: 0.42 },
  { id: 'rock_0_12', section: 0, x: 221, y: 408, sprite: 'rock_5', scale: 0.45 },
  { id: 'rock_0_13', section: 0, x: 111, y: 249, sprite: 'rock_25', scale: 0.34 },
  { id: 'rock_0_14', section: 0, x: 107, y: 333, sprite: 'rock_9', scale: 0.41 },
  { id: 'rock_0_15', section: 0, x: 261, y: 335, sprite: 'rock_23', scale: 0.38 },
  { id: 'rock_0_16', section: 0, x: 205, y: 720, sprite: 'rock_6', scale: 0.47 },
  { id: 'rock_0_17', section: 0, x: 51, y: 608, sprite: 'rock_14', scale: 0.33 },

  // --- SECTION 1: 30% - 60% of background width (x: 409 - 818) ---
  { id: 'rock_1_1', section: 1, x: 581, y: 287, sprite: 'rock_20', scale: 0.32 },
  { id: 'rock_1_2', section: 1, x: 459, y: 521, sprite: 'rock_17', scale: 0.46 },
  { id: 'rock_1_3', section: 1, x: 559, y: 420, sprite: 'rock_24', scale: 0.44 },
  { id: 'rock_1_4', section: 1, x: 443, y: 611, sprite: 'rock_18', scale: 0.44 },
  { id: 'rock_1_5', section: 1, x: 759, y: 455, sprite: 'rock_4', scale: 0.34 },
  { id: 'rock_1_6', section: 1, x: 772, y: 300, sprite: 'rock_9', scale: 0.39 },
  { id: 'rock_1_7', section: 1, x: 473, y: 391, sprite: 'rock_19', scale: 0.41 },
  { id: 'rock_1_8', section: 1, x: 581, y: 460, sprite: 'rock_19', scale: 0.42 },
  { id: 'rock_1_9', section: 1, x: 501, y: 521, sprite: 'rock_8', scale: 0.34 },
  { id: 'rock_1_10', section: 1, x: 720, y: 203, sprite: 'rock_15', scale: 0.4 },
  { id: 'rock_1_11', section: 1, x: 632, y: 195, sprite: 'rock_12', scale: 0.33 },
  { id: 'rock_1_12', section: 1, x: 663, y: 560, sprite: 'rock_17', scale: 0.42 },
  { id: 'rock_1_13', section: 1, x: 551, y: 657, sprite: 'rock_12', scale: 0.45 },
  { id: 'rock_1_14', section: 1, x: 705, y: 602, sprite: 'rock_26', scale: 0.34 },
  { id: 'rock_1_15', section: 1, x: 703, y: 492, sprite: 'rock_22', scale: 0.39 },
  { id: 'rock_1_16', section: 1, x: 493, y: 650, sprite: 'rock_3', scale: 0.47 },
  { id: 'rock_1_17', section: 1, x: 654, y: 635, sprite: 'rock_12', scale: 0.44 },

  // --- SECTION 2: 60% - 90% of background width (x: 818 - 1227) ---
  { id: 'rock_2_1', section: 2, x: 1184, y: 224, sprite: 'rock_23', scale: 0.38 },
  { id: 'rock_2_2', section: 2, x: 963, y: 657, sprite: 'rock_24', scale: 0.37 },
  { id: 'rock_2_3', section: 2, x: 1149, y: 484, sprite: 'rock_16', scale: 0.46 },
  { id: 'rock_2_4', section: 2, x: 983, y: 282, sprite: 'rock_21', scale: 0.46 },
  { id: 'rock_2_5', section: 2, x: 870, y: 535, sprite: 'rock_7', scale: 0.4 },
  { id: 'rock_2_6', section: 2, x: 908, y: 507, sprite: 'rock_15', scale: 0.4 },
  { id: 'rock_2_7', section: 2, x: 1064, y: 197, sprite: 'rock_9', scale: 0.36 },
  { id: 'rock_2_8', section: 2, x: 855, y: 257, sprite: 'rock_1', scale: 0.38 },
  { id: 'rock_2_9', section: 2, x: 972, y: 518, sprite: 'rock_13', scale: 0.32 },
  { id: 'rock_2_10', section: 2, x: 1142, y: 622, sprite: 'rock_12', scale: 0.32 },
  { id: 'rock_2_11', section: 2, x: 876, y: 443, sprite: 'rock_20', scale: 0.39 },
  { id: 'rock_2_12', section: 2, x: 981, y: 584, sprite: 'rock_15', scale: 0.38 },
  { id: 'rock_2_13', section: 2, x: 1168, y: 435, sprite: 'rock_27', scale: 0.47 },
  { id: 'rock_2_14', section: 2, x: 959, y: 471, sprite: 'rock_16', scale: 0.33 },

  // --- SECTION 3: 90% - 100% of background width (x: 1227 - 1364) ---
  { id: 'rock_3_1', section: 3, x: 1315, y: 292, sprite: 'rock_15', scale: 0.43 },
  { id: 'rock_3_2', section: 3, x: 1309, y: 680, sprite: 'rock_12', scale: 0.36 },
  { id: 'rock_3_3', section: 3, x: 1318, y: 493, sprite: 'rock_26', scale: 0.35 },
  { id: 'rock_3_4', section: 3, x: 1313, y: 235, sprite: 'rock_12', scale: 0.47 },
  { id: 'rock_3_5', section: 3, x: 1323, y: 592, sprite: 'rock_4', scale: 0.44 },
  { id: 'rock_3_6', section: 3, x: 1270, y: 713, sprite: 'rock_17', scale: 0.34 },
  { id: 'rock_3_7', section: 3, x: 1279, y: 647, sprite: 'rock_24', scale: 0.36 },
  { id: 'rock_3_8', section: 3, x: 1243, y: 433, sprite: 'rock_13', scale: 0.43 },
  { id: 'rock_3_9', section: 3, x: 1275, y: 577, sprite: 'rock_8', scale: 0.43 },
  { id: 'rock_3_10', section: 3, x: 1275, y: 312, sprite: 'rock_11', scale: 0.41 },
  { id: 'rock_3_11', section: 3, x: 1288, y: 527, sprite: 'rock_13', scale: 0.48 },
  { id: 'rock_3_12', section: 3, x: 1278, y: 370, sprite: 'rock_8', scale: 0.38 },
];

/**
 * Deterministic Mulberry32 seeded pseudo-random number generator.
 * @param {number} seed
 * @returns {() => number}
 */
export function createSeededRandom(seed = 0x5a17f00d) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Reusable generator function to produce a new deterministic layout if desired.
 * Confines rocks to the lower 75% of the background.
 *
 * @param {number} seed
 * @param {object} options
 * @returns {Array<object>}
 */
export function generateSeededRockLayout(seed = 0x5a17f00d, options = {}) {
  const rng = createSeededRandom(seed);
  const bgWidth = options.bgWidth || 1364;
  const bgHeight = options.bgHeight || 768;
  const sectionWidth = bgWidth * 0.30;
  const minSpacing = options.minSpacing || 40;
  const roverClearance = options.roverClearance || 90;
  const roverSpawn = options.roverSpawn || { x: bgWidth * 0.5, y: bgHeight * 0.5 };

  // Lower 75% of background (y between 25% and ~95%)
  const minY = Math.round(bgHeight * 0.25);
  const maxY = bgHeight - 45;

  const sections = [
    { section: 0, minX: 35, maxX: sectionWidth - 15 },
    { section: 1, minX: sectionWidth + 15, maxX: sectionWidth * 2 - 15 },
    { section: 2, minX: sectionWidth * 2 + 15, maxX: sectionWidth * 3 - 15 },
    { section: 3, minX: sectionWidth * 3 + 15, maxX: bgWidth - 35 },
  ];

  const variantKeys = Object.keys(ROCK_FRAMES);
  const rocks = [];

  for (const s of sections) {
    //    const count = 12 + Math.floor(rng() * 7); // 12 - 18 per         ion
    const count = 25 + Math.floor(rng() * 11); // 25–35 per section
    let placed = 0;
    let attempts = 0;

    while (placed < count && attempts < 1000) {
      attempts++;
      const x = Math.round(s.minX + rng() * (s.maxX - s.minX));
      const y = Math.round(minY + rng() * (maxY - minY));

      if (Math.hypot(x - roverSpawn.x, y - roverSpawn.y) < roverClearance) {
        continue;
      }

      let tooClose = false;
      for (const r of rocks) {
        if (Math.hypot(x - r.x, y - r.y) < minSpacing) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      const variantIdx = Math.floor(rng() * variantKeys.length);
      const scale = Math.round((0.32 + rng() * 0.16) * 100) / 100;

      rocks.push({
        id: `rock_${s.section}_${placed + 1}`,
        section: s.section,
        x,
        y,
        sprite: variantKeys[variantIdx],
        scale,
      });
      placed++;
    }
  }

  return rocks;
}
