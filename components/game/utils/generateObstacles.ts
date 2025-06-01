export interface ObstacleData {
  id: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  active: boolean;
  type: 'block' | 'tall' | 'wide' | 'low' | 'moving' | 'barrier' | 
        'fallen_log' | 'hay_bale' | 'boulder' | 'stream' | 'fence' | 
        'tall_grass' | 'flower_bed' | 'scarecrow' | 'farm_gate' | 'mud_patch';
  color: string;
  pattern?: string; // For fixed patterns
  subtype?: string; // For variations like different log sizes
}

const LANE_POSITIONS = [-2, 0, 2]; // Left, center, right lanes
const BASE_OBSTACLE_SPACING = 18; // Base spacing between obstacles

// Enhanced obstacle types with creative grass field obstacles
const OBSTACLE_TYPES = {
  // === NATURAL OBSTACLES ===
  fallen_log: {
    width: 0.4, height: 0.6, depth: 2.0,
    colors: { grass: '#8B4513' }, // Brown wood color
    weight: 4,
    description: 'Fallen tree log - slide under or jump over'
  },
  boulder: {
    width: 1.1, height: 1.8, depth: 1.1,
    colors: { grass: '#696969' }, // Dark gray stone
    weight: 3,
    description: 'Large rock formation - must jump over or go around'
  },
  stream: {
    width: 1.8, height: 0.2, depth: 0.8,
    colors: { grass: '#1E90FF' }, // Blue water
    weight: 3,
    description: 'Water stream - must jump across'
  },
  tall_grass: {
    width: 1.5, height: 1.0, depth: 1.5,
    colors: { grass: '#228B22' }, // Forest green
    weight: 2,
    description: 'Dense grass patch - slide through or jump over'
  },
  flower_bed: {
    width: 1.3, height: 0.4, depth: 1.0,
    colors: { grass: '#FF69B4' }, // Hot pink flowers
    weight: 2,
    description: 'Delicate flower garden - must jump over to preserve'
  },
  
  // === FARM OBSTACLES ===
  hay_bale: {
    width: 1.2, height: 1.4, depth: 1.2,
    colors: { grass: '#DAA520' }, // Golden yellow hay
    weight: 4,
    description: 'Round hay bale - jump on top for tricks or slide under'
  },
  scarecrow: {
    width: 0.5, height: 2.2, depth: 0.5,
    colors: { grass: '#CD853F' }, // Sandy brown
    weight: 2,
    description: 'Farm scarecrow - tall obstacle requiring jumps'
  },
  fence: {
    width: 0.2, height: 1.3, depth: 0.2,
    colors: { grass: '#8B4513' }, // Brown fence post
    weight: 3,
    description: 'Wooden fence post - narrow but tall'
  },
  farm_gate: {
    width: 3.0, height: 1.5, depth: 0.3,
    colors: { grass: '#654321' }, // Dark brown gate
    weight: 1,
    description: 'Farm gate - slide under the gap or jump over'
  },
  mud_patch: {
    width: 2.0, height: 0.1, depth: 1.5,
    colors: { grass: '#8B4513' }, // Muddy brown
    weight: 2,
    description: 'Slippery mud - slide through for style points'
  },
  
  // === ORIGINAL OBSTACLES (kept for compatibility) ===
  block: { 
    width: 0.8, height: 1.5, depth: 0.8, 
    colors: { grass: '#ff0000' },
    weight: 2,
    description: 'Generic block obstacle'
  },
  tall: { 
    width: 0.6, height: 2.5, depth: 0.6, 
    colors: { grass: '#cc0000' },
    weight: 1,
    description: 'Tall pillar obstacle'
  },
  wide: { 
    width: 1.2, height: 1.2, depth: 1.2, 
    colors: { grass: '#990000' },
    weight: 1,
    description: 'Wide block obstacle'
  },
  low: { 
    width: 1.0, height: 0.8, depth: 1.0, 
    colors: { grass: '#ff3333' },
    weight: 2,
    description: 'Low obstacle for sliding under'
  },
  barrier: { 
    width: 4.5, height: 1.8, depth: 0.3, 
    colors: { grass: '#660000' },
    weight: 1,
    description: 'Wide barrier with gap underneath'
  }
};

// Enhanced obstacle patterns with realistic combinations
const FIXED_PATTERNS = [
  {
    name: 'farm_yard',
    obstacles: [
      { lane: -1, offset: 0, type: 'hay_bale' as const },
      { lane: 1, offset: 10, type: 'scarecrow' as const },
      { lane: 0, offset: 25, type: 'farm_gate' as const },
    ],
    description: 'Farm scene with hay bale, scarecrow, and gate'
  },
  {
    name: 'nature_trail',
    obstacles: [
      { lane: 0, offset: 0, type: 'fallen_log' as const },
      { lane: -1, offset: 15, type: 'boulder' as const },
      { lane: 1, offset: 30, type: 'tall_grass' as const },
    ],
    description: 'Natural forest trail obstacles'
  },
  {
    name: 'garden_path',
    obstacles: [
      { lane: -1, offset: 0, type: 'flower_bed' as const },
      { lane: 1, offset: 0, type: 'flower_bed' as const },
      { lane: 0, offset: 20, type: 'stream' as const },
    ],
    description: 'Beautiful garden with flowers and stream'
  },
  {
    name: 'muddy_terrain',
    obstacles: [
      { lane: 0, offset: 0, type: 'mud_patch' as const },
      { lane: -1, offset: 12, type: 'fallen_log' as const },
      { lane: 1, offset: 25, type: 'boulder' as const },
    ],
    description: 'Muddy area with natural obstacles'
  },
  {
    name: 'fence_line',
    obstacles: [
      { lane: -1, offset: 0, type: 'fence' as const },
      { lane: 0, offset: 8, type: 'fence' as const },
      { lane: 1, offset: 16, type: 'fence' as const },
      { lane: 0, offset: 30, type: 'farm_gate' as const },
    ],
    description: 'Property boundary with fence posts and gate'
  },
  // Original patterns
  {
    name: 'zigzag',
    obstacles: [
      { lane: -1, offset: 0, type: 'block' as const },
      { lane: 0, offset: 20, type: 'block' as const },
      { lane: 1, offset: 40, type: 'block' as const },
    ],
    description: 'Classic zigzag pattern'
  },
  {
    name: 'walls',
    obstacles: [
      { lane: -1, offset: 0, type: 'tall' as const },
      { lane: 1, offset: 0, type: 'tall' as const },
      { lane: 0, offset: 25, type: 'wide' as const },
    ],
    description: 'Wall formation'
  },
  {
    name: 'lowGap',
    obstacles: [
      { lane: -1, offset: 0, type: 'low' as const },
      { lane: 1, offset: 0, type: 'low' as const },
      { lane: 0, offset: 30, type: 'barrier' as const },
    ],
    description: 'Low obstacles with barrier'
  }
];

// Helper function to get surface type based on score - now always grass
const getSurfaceType = (score: number): keyof typeof OBSTACLE_TYPES.block.colors => {
  // Always return grass for infinite grass gameplay
  return 'grass';
  
  // Original progression (commented out):
  // const progressDistance = score * 5;
  // if (progressDistance < 50) return 'grass';
  // if (progressDistance < 150) return 'mud';
  // if (progressDistance < 300) return 'road';
  // return 'highway';
};

// Difficulty progression system with creative obstacles
export const getDifficultyConfig = (score: number) => {
  const level = Math.floor(score / 10); // Difficulty level every 10 points
  
  return {
    // More obstacles as score increases
    maxObstacles: Math.min(16, 8 + level), // Start with 8, max 16
    
    // More frequent patterns at higher scores
    patternFrequency: Math.min(0.5, 0.2 + level * 0.05), // 20% to 50%
    
    // Closer spacing at higher difficulties
    spacingMultiplier: Math.max(0.6, 1 - level * 0.08), // Reduces spacing by 8% per level
    
    // Progressive obstacle unlocking with creative obstacles
    availableTypes: 
      score < 5 ? ['fallen_log', 'hay_bale', 'low'] : // Start with easy natural obstacles
      score < 10 ? ['fallen_log', 'hay_bale', 'flower_bed', 'mud_patch', 'low'] : // Add delicate/fun obstacles  
      score < 15 ? ['fallen_log', 'hay_bale', 'flower_bed', 'mud_patch', 'tall_grass', 'fence', 'low', 'block'] : // Add blocking obstacles
      score < 20 ? ['fallen_log', 'hay_bale', 'flower_bed', 'mud_patch', 'tall_grass', 'fence', 'stream', 'low', 'block', 'wide'] : // Add jumping challenges
      score < 30 ? ['fallen_log', 'hay_bale', 'boulder', 'flower_bed', 'mud_patch', 'tall_grass', 'fence', 'stream', 'scarecrow', 'low', 'block', 'wide', 'tall'] : // Add tall obstacles
      ['fallen_log', 'hay_bale', 'boulder', 'flower_bed', 'mud_patch', 'tall_grass', 'fence', 'stream', 'scarecrow', 'farm_gate', 'barrier', 'low', 'block', 'wide', 'tall'], // All obstacles
    
    // Tighter formations
    formationChance: Math.min(0.3, level * 0.05), // Chance for obstacle formations
    
    // Moving obstacles at higher levels (for future enhancement)
    movingObstacleChance: level > 5 ? Math.min(0.2, (level - 5) * 0.05) : 0,
  };
};

export const generateRandomObstacle = (
  playerZ: number, 
  existingObstacles: ObstacleData[], 
  speedMultiplier: number = 1,
  _score: number = 0 // Renamed to _score
): ObstacleData => {
  const difficulty = getDifficultyConfig(_score); // Use _score
  
  // Find the furthest obstacle to place new one ahead
  const furthestZ = existingObstacles.length > 0 
    ? Math.max(...existingObstacles.map(obs => obs.position.z))
    : playerZ;

  // Use difficulty-based available types instead of score-based filtering
  const availableTypes = difficulty.availableTypes;

  // Weighted random selection
  const typeWeights = availableTypes.map(type => OBSTACLE_TYPES[type as keyof typeof OBSTACLE_TYPES].weight);
  const totalWeight = typeWeights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  let selectedType = availableTypes[0];
  for (let i = 0; i < availableTypes.length; i++) {
    random -= typeWeights[i];
    if (random <= 0) {
      selectedType = availableTypes[i];
      break;
    }
  }

  const obstacleConfig = OBSTACLE_TYPES[selectedType as keyof typeof OBSTACLE_TYPES];
  const surfaceType = getSurfaceType(_score); // Use _score
  
  // For barrier type, place across all lanes
  let randomLane = 0;
  if (selectedType !== 'barrier') {
    randomLane = LANE_POSITIONS[Math.floor(Math.random() * LANE_POSITIONS.length)];
  }

  // Add some size variation
  const sizeVariation = 0.8 + Math.random() * 0.4;
  const width = obstacleConfig.width * sizeVariation;
  const height = obstacleConfig.height * sizeVariation;
  const depth = obstacleConfig.depth * sizeVariation;

  // Apply difficulty-based spacing adjustments
  const difficultySpacing = BASE_OBSTACLE_SPACING * difficulty.spacingMultiplier;
  const adjustedSpacing = difficultySpacing * Math.max(0.8, speedMultiplier * 0.6);

  return {
    id: `obstacle-${Date.now()}-${Math.random()}`,
    position: {
      x: randomLane,
      y: height / 2 + 0.1,
      z: furthestZ + adjustedSpacing + Math.random() * 4, // Reduced randomness for tighter challenges
    },
    size: { width, height, depth },
    color: obstacleConfig.colors[surfaceType],
    type: selectedType as ObstacleData['type'],
    active: true,
  };
};

export const generateFixedPattern = (
  playerZ: number, 
  existingObstacles: ObstacleData[], 
  speedMultiplier: number = 1,
  _score: number = 0 // Renamed to _score
): ObstacleData[] => {
  const furthestZ = existingObstacles.length > 0 
    ? Math.max(...existingObstacles.map(obs => obs.position.z))
    : playerZ;

  const pattern = FIXED_PATTERNS[Math.floor(Math.random() * FIXED_PATTERNS.length)];
  const adjustedSpacing = BASE_OBSTACLE_SPACING * Math.max(1, speedMultiplier * 0.8);
  const baseZ = furthestZ + adjustedSpacing + 20;
  const surfaceType = getSurfaceType(_score); // Use _score

  return pattern.obstacles.map((obs, index) => {
    const obstacleConfig = OBSTACLE_TYPES[obs.type];
    return {
      id: `pattern-${pattern.name}-${Date.now()}-${index}`,
      position: {
        x: LANE_POSITIONS[obs.lane + 1], // Convert -1,0,1 to 0,1,2 indices
        y: obstacleConfig.height / 2 + 0.1,
        z: baseZ + obs.offset,
      },
      size: {
        width: obstacleConfig.width,
        height: obstacleConfig.height,
        depth: obstacleConfig.depth,
      },
      color: obstacleConfig.colors[surfaceType],
      type: obs.type,
      pattern: pattern.name,
      active: true,
    };
  });
};

export const checkCollision = (
  playerPos: { x: number; y: number; z: number },
  playerSize: { width: number; height: number; depth: number },
  obstacle: ObstacleData,
  isSliding: boolean = false
): boolean => {
  if (!obstacle.active) return false;

  // Adjust player bounds based on sliding state
  const effectivePlayerHeight = isSliding ? playerSize.height * 0.4 : playerSize.height; // Much lower when sliding
  const effectivePlayerY = isSliding ? playerPos.y - playerSize.height * 0.3 : playerPos.y; // Lower center point

  const playerBounds = {
    minX: playerPos.x - playerSize.width / 2,
    maxX: playerPos.x + playerSize.width / 2,
    minY: effectivePlayerY - effectivePlayerHeight / 2,
    maxY: effectivePlayerY + effectivePlayerHeight / 2,
    minZ: playerPos.z - playerSize.depth / 2,
    maxZ: playerPos.z + playerSize.depth / 2,
  };

  const obstacleBounds = {
    minX: obstacle.position.x - obstacle.size.width / 2,
    maxX: obstacle.position.x + obstacle.size.width / 2,
    minY: obstacle.position.y - obstacle.size.height / 2,
    maxY: obstacle.position.y + obstacle.size.height / 2,
    minZ: obstacle.position.z - obstacle.size.depth / 2,
    maxZ: obstacle.position.z + obstacle.size.depth / 2,
  };

  // === SPECIAL OBSTACLE BEHAVIORS ===
  
  // Fallen logs - can slide under or jump over
  if (obstacle.type === 'fallen_log') {
    if (playerPos.y > obstacle.position.y + obstacle.size.height / 2 + 0.1) {
      return false; // Jumped over
    }
    if (isSliding && effectivePlayerY + effectivePlayerHeight / 2 < obstacle.position.y + obstacle.size.height / 2 - 0.1) {
      return false; // Slid under
    }
  }

  // Hay bales - can slide under, jump over, or trick jump on top
  if (obstacle.type === 'hay_bale') {
    if (playerPos.y > obstacle.position.y + obstacle.size.height / 2 + 0.1) {
      return false; // Jumped over or landed on top
    }
    if (isSliding && effectivePlayerY + effectivePlayerHeight / 2 < obstacle.position.y + obstacle.size.height / 2 - 0.2) {
      return false; // Slid under (hay bales have more clearance)
    }
  }

  // Streams - must jump over (can't slide through water)
  if (obstacle.type === 'stream') {
    if (playerPos.y > obstacle.position.y + obstacle.size.height + 0.3) {
      return false; // Successfully jumped over stream
    }
    // Cannot slide through water - always collides if touching
  }

  // Flower beds - delicate, must jump over to preserve (can't slide through)
  if (obstacle.type === 'flower_bed') {
    if (playerPos.y > obstacle.position.y + obstacle.size.height + 0.1) {
      return false; // Jumped over preserving flowers
    }
    // Can't slide through flowers - always collides
  }

  // Mud patches - sliding gives bonus, walking slows down (no collision but effects)
  if (obstacle.type === 'mud_patch') {
    if (isSliding) {
      return false; // Sliding through mud is encouraged (no collision)
    }
    // Walking through mud should have effects but not end game
    // This could trigger a slow-down effect instead of collision
    return false; // Allow passage but could apply speed penalty elsewhere
  }

  // Tall grass - can slide through or push through slowly
  if (obstacle.type === 'tall_grass') {
    if (isSliding) {
      return false; // Can slide through tall grass
    }
    if (playerPos.y > obstacle.position.y + obstacle.size.height / 2) {
      return false; // Jump over
    }
    // Walking through tall grass slows but doesn't stop
    return false; // Allow passage but could apply effects
  }

  // Fence posts - narrow but tall, precise jumping required
  if (obstacle.type === 'fence') {
    if (playerPos.y > obstacle.position.y + obstacle.size.height / 2 + 0.1) {
      return false; // Jumped over fence
    }
    // Fence posts are narrow - very precise collision detection
  }

  // Farm gates - slide under gap or jump over
  if (obstacle.type === 'farm_gate') {
    if (playerPos.y > obstacle.position.y + obstacle.size.height / 2 + 0.1) {
      return false; // Jumped over gate
    }
    if (isSliding && effectivePlayerY + effectivePlayerHeight / 2 < obstacle.position.y - obstacle.size.height / 2 + 0.8) {
      return false; // Slid under gate gap
    }
  }

  // Scarecrows - tall and narrow, must jump or go around
  if (obstacle.type === 'scarecrow') {
    if (playerPos.y > obstacle.position.y + obstacle.size.height / 2 + 0.1) {
      return false; // Jumped over
    }
    // Scarecrows are narrow, so side avoidance is easier
  }

  // Boulders - solid rock, must jump over (no sliding under)
  if (obstacle.type === 'boulder') {
    if (playerPos.y > obstacle.position.y + obstacle.size.height / 2 + 0.2) {
      return false; // Jumped over boulder
    }
    // Cannot slide under solid rock
  }

  // === ORIGINAL OBSTACLE BEHAVIORS ===
  
  // Low obstacles - can jump over OR slide under
  if (obstacle.type === 'low') {
    if (playerPos.y > obstacle.position.y + obstacle.size.height / 2 + 0.2) {
      return false; // Jumped over
    }
    if (isSliding && effectivePlayerY + effectivePlayerHeight / 2 < obstacle.position.y + obstacle.size.height / 2 - 0.1) {
      return false; // Slid under
    }
  }

  // Barriers - slide under gap or jump over
  if (obstacle.type === 'barrier' && isSliding) {
    const barrierGapHeight = 0.6; // Height of the gap under the barrier
    if (effectivePlayerY + effectivePlayerHeight / 2 < obstacle.position.y - obstacle.size.height / 2 + barrierGapHeight) {
      return false; // Player slides under the barrier
    }
  }

  // Check for overlap in all three dimensions
  const overlapX = playerBounds.maxX > obstacleBounds.minX && playerBounds.minX < obstacleBounds.maxX;
  const overlapY = playerBounds.maxY > obstacleBounds.minY && playerBounds.minY < obstacleBounds.maxY;
  const overlapZ = playerBounds.maxZ > obstacleBounds.minZ && playerBounds.minZ < obstacleBounds.maxZ;

  return overlapX && overlapY && overlapZ;
};

export const cleanupObstacles = (obstacles: ObstacleData[], playerZ: number): ObstacleData[] => {
  // Remove obstacles that are too far behind the player
  return obstacles.filter(obstacle => obstacle.position.z > playerZ - 30);
};
