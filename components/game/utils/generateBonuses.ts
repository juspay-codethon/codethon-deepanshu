export interface BonusData {
  id: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  active: boolean;
  type: 'score' | 'speed' | 'jump' | 'shield' | 'slowmo' | 'coin' | 'magnet';
  color: string;
  value: number; // Score value or duration in seconds
  collected: boolean;
}

const LANE_POSITIONS = [-2, 0, 2]; // Left, center, right lanes
const BONUS_SPAWN_CHANCE = 0.20; // Increased to 20% chance per spawn cycle
const MIN_BONUS_SPACING = 30; // Slightly reduced spacing for more bonuses

// Bonus types with their configurations
const BONUS_TYPES = {
  coin: {
    color: '#ffd700', // Gold
    size: { width: 0.6, height: 0.6, depth: 0.1 },
    value: 3, // Increased value to 3 points
    weight: 10, // Significantly increased weight to make coins more common
    description: '+3 Score'
  },
  // Removed 'score' type (the green box)
  speed: {
    color: '#ff6600', // Orange
    size: { width: 0.7, height: 0.7, depth: 0.7 },
    value: 3, // 3 seconds duration
    weight: 2,
    description: 'Speed Boost'
  },
  jump: {
    color: '#0066ff', // Blue
    size: { width: 0.7, height: 0.7, depth: 0.7 },
    value: 5, // 5 seconds duration
    weight: 2,
    description: 'Jump Boost'
  },
  shield: {
    color: '#ff00ff', // Magenta
    size: { width: 0.8, height: 0.8, depth: 0.8 },
    value: 4, // 4 seconds duration
    weight: 1,
    description: 'Shield Protection'
  },
  slowmo: {
    color: '#00ffff', // Cyan
    size: { width: 0.7, height: 0.7, depth: 0.7 },
    value: 3, // 3 seconds duration
    weight: 1,
    description: 'Slow Motion'
  },
  magnet: {
    color: '#ff0099', // Pink
    size: { width: 0.6, height: 0.6, depth: 0.6 },
    value: 4, // 4 seconds duration
    weight: 1,
    description: 'Coin Magnet'
  }
};

// Bonus spawn configuration based on score
export const getBonusSpawnConfig = (score: number) => {
  return {
    spawnChance: Math.min(0.30, BONUS_SPAWN_CHANCE + Math.floor(score / 15) * 0.02), // Further increase spawn rate with score
    availableTypes: score < 10 ? ['coin'] : // Early game only coins
                   score < 25 ? ['coin', 'speed', 'jump'] : // Introduce some power-ups
                   ['coin', 'speed', 'jump', 'shield', 'slowmo', 'magnet'], // All types (excluding 'score') after score 25
  };
};

export const shouldSpawnBonus = (
  existingBonuses: BonusData[],
  playerZ: number,
  score: number
): boolean => {
  const config = getBonusSpawnConfig(score);
  
  // Check if there's already a bonus too close
  const tooClose = existingBonuses.some(bonus => 
    bonus.active && Math.abs(bonus.position.z - playerZ) < MIN_BONUS_SPACING
  );
  
  if (tooClose) return false;
  
  return Math.random() < config.spawnChance;
};

export const generateRandomBonus = (
  playerZ: number,
  existingBonuses: BonusData[],
  score: number = 0
): BonusData => {
  const config = getBonusSpawnConfig(score);
  
  // Find the furthest bonus to place new one ahead
  const furthestZ = existingBonuses.length > 0 
    ? Math.max(...existingBonuses.map(bonus => bonus.position.z))
    : playerZ;

  // Weighted random selection
  const availableTypes = config.availableTypes;
  const typeWeights = availableTypes.map(type => BONUS_TYPES[type as keyof typeof BONUS_TYPES].weight);
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

  const bonusConfig = BONUS_TYPES[selectedType as keyof typeof BONUS_TYPES];
  const randomLane = LANE_POSITIONS[Math.floor(Math.random() * LANE_POSITIONS.length)];

  return {
    id: `bonus-${Date.now()}-${Math.random()}`,
    position: {
      x: randomLane,
      y: bonusConfig.size.height / 2 + 1, // Float above ground
      z: Math.max(furthestZ + MIN_BONUS_SPACING, playerZ + 30 + Math.random() * 20),
    },
    size: bonusConfig.size,
    color: bonusConfig.color,
    type: selectedType as BonusData['type'],
    value: bonusConfig.value,
    active: true,
    collected: false,
  };
};

export const checkBonusCollection = (
  playerPos: { x: number; y: number; z: number },
  playerSize: { width: number; height: number; depth: number },
  bonus: BonusData
): boolean => {
  if (!bonus.active || bonus.collected) return false;

  const playerBounds = {
    minX: playerPos.x - playerSize.width / 2,
    maxX: playerPos.x + playerSize.width / 2,
    minY: playerPos.y - playerSize.height / 2,
    maxY: playerPos.y + playerSize.height / 2,
    minZ: playerPos.z - playerSize.depth / 2,
    maxZ: playerPos.z + playerSize.depth / 2,
  };

  const bonusBounds = {
    minX: bonus.position.x - bonus.size.width / 2,
    maxX: bonus.position.x + bonus.size.width / 2,
    minY: bonus.position.y - bonus.size.height / 2,
    maxY: bonus.position.y + bonus.size.height / 2,
    minZ: bonus.position.z - bonus.size.depth / 2,
    maxZ: bonus.position.z + bonus.size.depth / 2,
  };

  // Check for overlap in all three dimensions
  const overlapX = playerBounds.maxX > bonusBounds.minX && playerBounds.minX < bonusBounds.maxX;
  const overlapY = playerBounds.maxY > bonusBounds.minY && playerBounds.minY < bonusBounds.maxY;
  const overlapZ = playerBounds.maxZ > bonusBounds.minZ && playerBounds.minZ < bonusBounds.maxZ;

  return overlapX && overlapY && overlapZ;
};

export const cleanupBonuses = (bonuses: BonusData[], playerZ: number): BonusData[] => {
  // Remove bonuses that are too far behind the player
  return bonuses.filter(bonus => bonus.position.z > playerZ - 50);
};
