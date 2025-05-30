'use client';

import { useGameStore } from './store/useGameStore';
import { getDifficultyConfig } from './utils/generateObstacles';

export const HUD: React.FC = () => {
  const { 
    score, 
    isGameOver, 
    isPlaying, 
    speedMultiplier,
    bonusEffects,
    lastBonusMessage,
    stylePoints,
    isSliding,
    trickJumpActive,
    trickJumpType,
    hasDoubleJumped,
    bodyLean,
    startGame, 
    resetGame 
  } = useGameStore();

  const handleStart = () => {
    if (isGameOver) {
      resetGame();
    }
    startGame();
  };

  // Get current environment info - now always grass fields and morning
  const getEnvironmentInfo = (currentScore: number) => {
    // Always return grass fields and morning for infinite grass gameplay
    return { surface: 'Grass Fields', timeOfDay: 'Morning' };
    
    // Original progression (commented out):
    // const progressDistance = currentScore * 5;
    // let surface = 'Grass Fields';
    // let timeOfDay = 'Dawn';
    // if (progressDistance >= 50) surface = 'Mud Trails';
    // if (progressDistance >= 150) surface = 'Paved Road';
    // if (progressDistance >= 300) surface = 'Highway';
    // if (currentScore >= 15) timeOfDay = 'Morning';
    // if (currentScore >= 30) timeOfDay = 'Midday';
    // if (currentScore >= 50) timeOfDay = 'Evening';
    // if (currentScore >= 80) timeOfDay = 'Night';
    // return { surface, timeOfDay };
  };

  const environment = getEnvironmentInfo(score);
  const difficulty = getDifficultyConfig(score);
  const difficultyLevel = Math.floor(score / 10);

  // Glass morphism styles
  const glassStyle = "backdrop-blur-md bg-white/10 border border-white/20 shadow-lg";
  const pulseStyle = "animate-pulse bg-gradient-to-r from-purple-400/20 to-pink-400/20";

  return (
    <div className="fixed inset-0 pointer-events-none z-10 font-mono">
      {/* Enhanced Score & Style Points Display */}
      {isPlaying && (
        <div className="absolute top-6 left-6 pointer-events-auto space-y-3">
          <div className={`${glassStyle} text-white px-6 py-3 rounded-2xl text-2xl font-bold transform transition-all duration-300 hover:scale-105`}>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-300">⭐</span>
              <span>Score: {score}</span>
            </div>
          </div>
          
          {/* Style Points Display */}
          <div className={`${glassStyle} text-white px-4 py-2 rounded-xl text-lg transition-all duration-300 ${stylePoints > 0 ? 'animate-pulse border-purple-400/40' : ''}`}>
            <div className="flex items-center space-x-2">
              <span className="text-purple-300">✨</span>
              <span>Style: {stylePoints}</span>
            </div>
          </div>
          
          <div className={`${glassStyle} text-white px-4 py-2 rounded-xl text-lg transition-all duration-300`}>
            <div className="flex items-center space-x-2">
              <span className="text-orange-300">🚀</span>
              <span>Speed: {speedMultiplier.toFixed(1)}x</span>
            </div>
          </div>
          
          <div className={`${glassStyle} text-white px-4 py-2 rounded-xl text-sm transition-all duration-300`}>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-blue-300">🌅</span>
                <span>{environment.timeOfDay}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-300">🌿</span>
                <span>{environment.surface}</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Difficulty Display */}
          <div className={`${glassStyle} text-white px-4 py-2 rounded-xl text-sm transition-all duration-300 border-red-400/30`}>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-red-400">⚔️</span>
                <span className="text-red-300">Level {difficultyLevel}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-400">🎯</span>
                <span className="text-orange-300">Max: {difficulty.maxObstacles}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Character State Display */}
      {isPlaying && (
        <div className="absolute bottom-6 left-6 pointer-events-auto space-y-2">
          {/* Current Character State */}
          <div className={`${glassStyle} text-white px-4 py-2 rounded-xl text-sm transition-all duration-300`}>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-cyan-300">🏃</span>
                <span className="font-semibold">Character</span>
              </div>
              {isSliding && (
                <div className="flex items-center space-x-2 text-green-300">
                  <span>⬇️</span>
                  <span>Sliding</span>
                </div>
              )}
              {trickJumpActive && (
                <div className="flex items-center space-x-2 text-purple-300 animate-pulse">
                  <span>{trickJumpType === 'flip' ? '🔄' : '🌪️'}</span>
                  <span>{trickJumpType === 'flip' ? 'Flipping' : 'Spinning'}</span>
                </div>
              )}
              {hasDoubleJumped && (
                <div className="flex items-center space-x-2 text-yellow-300 animate-pulse">
                  <span>⚡</span>
                  <span>Double Jump</span>
                </div>
              )}
              {Math.abs(bodyLean) > 0.3 && (
                <div className="flex items-center space-x-2 text-blue-300">
                  <span>{bodyLean > 0 ? '↗️' : '↖️'}</span>
                  <span>Leaning</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Bonus Effects Display */}
      {isPlaying && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          {/* Active Bonus Effects */}
          <div className="flex gap-3 mb-4">
            {bonusEffects.shield > 0 && (
              <div className={`${glassStyle} ${pulseStyle} text-white px-4 py-2 rounded-xl text-sm font-bold border-purple-400/40 transform transition-all duration-300 hover:scale-110`}>
                🛡️ Shield: {bonusEffects.shield.toFixed(1)}s
              </div>
            )}
            {bonusEffects.speedBoost > 0 && (
              <div className={`${glassStyle} ${pulseStyle} text-white px-4 py-2 rounded-xl text-sm font-bold border-orange-400/40 transform transition-all duration-300 hover:scale-110`}>
                ⚡ Speed: {bonusEffects.speedBoost.toFixed(1)}s
              </div>
            )}
            {bonusEffects.jumpBoost > 0 && (
              <div className={`${glassStyle} ${pulseStyle} text-white px-4 py-2 rounded-xl text-sm font-bold border-blue-400/40 transform transition-all duration-300 hover:scale-110`}>
                🚀 Jump: {bonusEffects.jumpBoost.toFixed(1)}s
              </div>
            )}
            {bonusEffects.slowMotion > 0 && (
              <div className={`${glassStyle} ${pulseStyle} text-white px-4 py-2 rounded-xl text-sm font-bold border-cyan-400/40 transform transition-all duration-300 hover:scale-110`}>
                ⏰ Slow: {bonusEffects.slowMotion.toFixed(1)}s
              </div>
            )}
            {bonusEffects.magnet > 0 && (
              <div className={`${glassStyle} ${pulseStyle} text-white px-4 py-2 rounded-xl text-sm font-bold border-pink-400/40 transform transition-all duration-300 hover:scale-110`}>
                🧲 Magnet: {bonusEffects.magnet.toFixed(1)}s
              </div>
            )}
          </div>
          
          {/* Enhanced Bonus Collection Message */}
          {lastBonusMessage && (
            <div className="text-center transform transition-all duration-500 animate-bounce">
              <div className="bg-gradient-to-r from-green-400/90 to-emerald-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl text-xl font-black shadow-2xl border-2 border-green-300/50">
                {lastBonusMessage}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Controls Display */}
      {isPlaying && (
        <div className="absolute top-6 right-6 pointer-events-auto space-y-3">
          <div className={`${glassStyle} text-white px-4 py-3 rounded-xl text-sm transition-all duration-300`}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-blue-300">🎮</span>
                <span className="font-semibold">Controls</span>
              </div>
              <div className="text-xs space-y-1 text-gray-200">
                <div>A/D or ←/→ : Move & Lean</div>
                <div>Space : Jump & Double Jump</div>
                <div>S/↓/Shift : Slide</div>
                <div className="text-purple-300">Hold A+D for spin tricks!</div>
                <div className="text-yellow-300">Long jumps = flips!</div>
              </div>
            </div>
          </div>
          
          {/* Style Points Guide */}
          <div className={`${glassStyle} text-white px-4 py-3 rounded-xl text-xs transition-all duration-300 border-purple-400/30`}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-purple-300">✨</span>
                <span className="font-semibold">Style Points</span>
              </div>
              <div className="text-gray-200 space-y-1">
                <div>Double Jump: +5</div>
                <div>Flip Trick: +10</div>
                <div>Spin Trick: +15</div>
                <div className="text-green-300">Mud Slide: +5</div>
                <div className="text-blue-300">Stream Jump: +7</div>
                <div className="text-pink-300">Flower Preserve: +6</div>
              </div>
            </div>
          </div>
          
          {/* Creative Obstacles Guide */}
          <div className={`${glassStyle} text-white px-4 py-3 rounded-xl text-xs transition-all duration-300 border-green-400/30`}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-300">🌾</span>
                <span className="font-semibold">Field Obstacles</span>
              </div>
              <div className="text-gray-200 space-y-1">
                <div>🪵 Logs: Slide under or jump</div>
                <div>🧱 Hay: Slide/jump/tricks</div>
                <div>🌊 Stream: Must jump over</div>
                <div>🌸 Flowers: Jump to preserve</div>
                <div>💧 Mud: Slide for bonus</div>
                <div>🌿 Grass: Slide through</div>
                <div>🚪 Gate: Slide under gap</div>
                <div>🗿 Boulder: Jump over only</div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Bonus Legend */}
          <div className={`${glassStyle} text-white px-4 py-3 rounded-xl text-xs max-w-xs transition-all duration-300 hover:scale-105`}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-300">✨</span>
                <span className="font-semibold">Bonuses</span>
              </div>
              <div className="grid grid-cols-1 gap-1 text-gray-200">
                <div className="flex justify-between">
                  <span>🪙 Gold</span>
                  <span className="text-yellow-300">+2 Score</span>
                </div>
                <div className="flex justify-between">
                  <span>🟢 Green</span>
                  <span className="text-green-300">+5 Score</span>
                </div>
                <div className="flex justify-between">
                  <span>🔶 Orange</span>
                  <span className="text-orange-300">Speed</span>
                </div>
                <div className="flex justify-between">
                  <span>🔷 Blue</span>
                  <span className="text-blue-300">Jump</span>
                </div>
                <div className="flex justify-between">
                  <span>🟪 Purple</span>
                  <span className="text-purple-300">Shield</span>
                </div>
                <div className="flex justify-between">
                  <span>🟦 Cyan</span>
                  <span className="text-cyan-300">Slow Mo</span>
                </div>
                <div className="flex justify-between">
                  <span>🩷 Pink</span>
                  <span className="text-pink-300">Magnet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Start/Game Over Screen */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 backdrop-blur-lg flex items-center justify-center pointer-events-auto">
          <div className="text-center text-white max-w-2xl mx-auto px-8">
            {isGameOver ? (
              <div className="transform transition-all duration-1000 animate-fade-in">
                <h1 className="text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 animate-pulse">
                  Game Over
                </h1>
                <div className={`${glassStyle} px-8 py-6 rounded-3xl mb-8 transform transition-all duration-500 hover:scale-105`}>
                  <p className="text-4xl mb-4 font-bold text-yellow-300">Final Score: {score}</p>
                  <p className="text-2xl mb-4 font-bold text-purple-300">Style Points: {stylePoints}</p>
                  <div className="text-xl space-y-2 text-gray-300">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-blue-400">🌅</span>
                      <span>Environment: {environment.timeOfDay}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-green-400">🌿</span>
                      <span>Surface: {environment.surface}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-red-400">⚔️</span>
                      <span>Difficulty Level: {difficultyLevel}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleStart}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-2xl text-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl border-2 border-blue-400/50"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <div className="transform transition-all duration-1000 animate-fade-in">
                <h1 className="text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
                  3D Runner
                </h1>
                <div className={`${glassStyle} px-8 py-6 rounded-3xl mb-8 transform transition-all duration-500 hover:scale-105`}>
                  <p className="text-2xl mb-6 text-gray-200 font-semibold">
                    Run infinitely with enhanced character abilities and style!
                  </p>
                  <div className="text-lg space-y-3">
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-blue-300">🎮</span>
                      <span>Use A/D or Arrow Keys to move & lean</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-green-300">🚀</span>
                      <span>Press Space to jump & double jump</span>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-yellow-300">⬇️</span>
                      <span>Hold S/↓/Shift to slide under obstacles</span>
                    </div>
                  </div>
                  <div className="text-base text-purple-300 mt-6 space-y-2 bg-purple-400/10 rounded-2xl p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span>✨</span>
                      <span>Perform tricks for style points!</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>🔄</span>
                      <span>Long jumps trigger flips</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>🌪️</span>
                      <span>Hold A+D while jumping for spins</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>🧲</span>
                      <span>Magnet power-up attracts nearby bonuses</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mt-4 space-y-1 bg-gray-800/20 rounded-xl p-3">
                    <div className="flex items-center justify-center space-x-2">
                      <span>🪙</span>
                      <span>Collect bonuses for points and abilities</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>🛡️</span>
                      <span>Shield protects from one collision</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>📈</span>
                      <span>Difficulty increases every 10 points!</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleStart}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-2xl text-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl border-2 border-green-400/50"
                >
                  Start Running
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 