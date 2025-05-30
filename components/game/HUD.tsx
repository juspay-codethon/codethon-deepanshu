'use client';

import { useGameStore } from './store/useGameStore';
import { useState, useEffect } from 'react';

export const HUD: React.FC = () => {
  const { 
    score, 
    highScore,
    highScores,
    playerName,
    isGameOver, 
    isPlaying, 
    bonusEffects,
    lastBonusMessage,
    stylePoints,
    startGame, 
    resetGame,
    setPlayerName,
    loadHighScores
  } = useGameStore();

  const [tempName, setTempName] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadHighScores();
    setTempName(playerName);
  }, [loadHighScores, playerName]);

  const handleStart = () => {
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
      if (isGameOver) {
        resetGame();
      }
      startGame();
    }
  };

  // Glass morphism styles
  const glassStyle = "backdrop-blur-md bg-white/10 border border-white/20 shadow-lg";
  const pulseStyle = "animate-pulse bg-gradient-to-r from-purple-400/20 to-pink-400/20";

  // Format date to relative time (e.g., "2h ago", "3d ago")
  const getRelativeTime = (timestamp: number) => {
    if (!isClient) return '';
    
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = timestamp - Date.now();
    const diffAbs = Math.abs(diff);
    
    if (diffAbs < 1000 * 60) return 'just now';
    if (diffAbs < 1000 * 60 * 60) return rtf.format(Math.floor(diff / (1000 * 60)), 'minute');
    if (diffAbs < 1000 * 60 * 60 * 24) return rtf.format(Math.floor(diff / (1000 * 60 * 60)), 'hour');
    if (diffAbs < 1000 * 60 * 60 * 24 * 30) return rtf.format(Math.floor(diff / (1000 * 60 * 60 * 24)), 'day');
    return rtf.format(Math.floor(diff / (1000 * 60 * 60 * 24 * 30)), 'month');
  };

  if (!isClient) {
    return null; // Return nothing during SSR
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-10 font-mono">
      {/* Essential Game Info */}
      {isPlaying && (
        <div className="absolute top-6 left-6 pointer-events-auto space-y-3">
          {/* Player Name & Score */}
          <div className={`${glassStyle} text-white px-6 py-3 rounded-2xl text-2xl font-bold transform transition-all duration-300`}>
            <div className="flex flex-col">
              <span className="text-sm text-gray-300">{playerName}</span>
              <span>{score}</span>
            </div>
          </div>
          
          {/* High Score Indicator */}
          {score >= highScore - 5 && (
            <div className={`${glassStyle} text-white px-4 py-2 rounded-xl text-sm transition-all duration-300 ${score >= highScore ? 'animate-pulse text-yellow-400' : 'text-gray-300'}`}>
              {score >= highScore ? '🏆 NEW BEST!' : `🏆 BEST: ${highScore}`}
            </div>
          )}
          
          {/* Style Points */}
          {stylePoints > 0 && (
            <div className={`${glassStyle} text-white px-4 py-2 rounded-xl text-sm transition-all duration-300 animate-pulse`}>
              ✨ {stylePoints}
            </div>
          )}
        </div>
      )}

      {/* Minimalist Bonus Effects Display */}
      {isPlaying && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="flex gap-2">
            {bonusEffects.shield > 0 && (
              <div className={`${glassStyle} ${pulseStyle} text-white px-3 py-1 rounded-xl text-sm`}>
                🛡️
              </div>
            )}
            {bonusEffects.speedBoost > 0 && (
              <div className={`${glassStyle} ${pulseStyle} text-white px-3 py-1 rounded-xl text-sm`}>
                ⚡
              </div>
            )}
            {bonusEffects.jumpBoost > 0 && (
              <div className={`${glassStyle} ${pulseStyle} text-white px-3 py-1 rounded-xl text-sm`}>
                🚀
              </div>
            )}
            {bonusEffects.magnet > 0 && (
              <div className={`${glassStyle} ${pulseStyle} text-white px-3 py-1 rounded-xl text-sm`}>
                🧲
              </div>
            )}
          </div>
          
          {/* Bonus Collection Message */}
          {lastBonusMessage && (
            <div className="text-center transform transition-all duration-500 animate-bounce mt-4">
              <div className="bg-gradient-to-r from-green-400/90 to-emerald-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-lg font-bold shadow-2xl">
                {lastBonusMessage}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Start/Game Over Screen with High Scores */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 backdrop-blur-lg flex items-center justify-center pointer-events-auto">
          <div className="text-center text-white max-w-xl mx-auto px-8">
            {isGameOver ? (
              <div className="transform transition-all duration-1000 animate-fade-in">
                <h1 className="text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 animate-pulse">
                  Game Over
                </h1>
                <div className={`${glassStyle} px-8 py-6 rounded-3xl mb-8`}>
                  <p className="text-4xl mb-2 font-bold">{score}</p>
                  <p className="text-xl text-gray-400 mb-4">{playerName}</p>
                  {score >= highScore && score > 0 && (
                    <p className="text-2xl font-bold text-yellow-400 animate-pulse">New Best! 🏆</p>
                  )}
                </div>

                {/* High Scores Table */}
                {highScores.length > 0 && (
                  <div className={`${glassStyle} px-6 py-4 rounded-2xl mb-8`}>
                    <h2 className="text-xl font-bold mb-4">High Scores</h2>
                    <div className="space-y-2">
                      {highScores.slice(0, 5).map((entry, index) => (
                        <div 
                          key={index}
                          className={`flex justify-between items-center ${entry.score === score && entry.name === playerName ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{index + 1}.</span>
                            <span>{entry.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>{entry.score}</span>
                            <span className="text-xs text-gray-500">{getRelativeTime(entry.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStart}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-2xl text-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="transform transition-all duration-1000 animate-fade-in">
                <h1 className="text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
                  3D Runner
                </h1>
                
                {/* Player Name Input */}
                <div className={`${glassStyle} px-6 py-4 rounded-2xl mb-8`}>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-xl text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                    maxLength={15}
                  />
                </div>

                {/* High Scores Preview */}
                {highScores.length > 0 && (
                  <div className={`${glassStyle} px-6 py-4 rounded-2xl mb-8`}>
                    <h2 className="text-xl font-bold mb-4">Top Scores</h2>
                    <div className="space-y-2">
                      {highScores.slice(0, 3).map((entry, index) => (
                        <div key={index} className="flex justify-between items-center text-gray-300">
                          <span>{entry.name}</span>
                          <span>{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleStart}
                  disabled={!tempName.trim()}
                  className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-2xl text-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl ${!tempName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Play
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 