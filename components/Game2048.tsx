import React, { useState, useEffect, useCallback } from 'react';
import { Trophy } from 'lucide-react';

interface Tile {
  id: number;
  value: number;
  position: { row: number; col: number };
  isNew: boolean;
  isMerged: boolean;
}

interface LeaderboardEntry {
  username: string;
  score: number;
  timestamp: number;
}

export default function Game2048() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [username, setUsername] = useState('');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Load leaderboard and best score from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const leaderboardResult = await window.storage.get('leaderboard', true);
        if (leaderboardResult) {
          const data = JSON.parse(leaderboardResult.value);
          setLeaderboard(data.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score).slice(0, 10));
        }
      } catch (error) {
        console.log('No leaderboard data yet');
      }

      try {
        const bestResult = await window.storage.get('bestScore', false);
        if (bestResult) {
          setBestScore(parseInt(bestResult.value));
        }
      } catch (error) {
        console.log('No best score yet');
      }
    };
    loadData();
  }, []);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newTiles = [
      createRandomTile(0),
      createRandomTile(1)
    ];
    setTiles(newTiles);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  };

  const createRandomTile = (id: number): Tile => {
    const emptyPositions = getEmptyPositions([]);
    const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    return {
      id,
      value: Math.random() < 0.9 ? 2 : 4,
      position: randomPos,
      isNew: true,
      isMerged: false
    };
  };

  const getEmptyPositions = (currentTiles: Tile[]) => {
    const positions = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!currentTiles.some(t => t.position.row === row && t.position.col === col)) {
          positions.push({ row, col });
        }
      }
    }
    return positions;
  };

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let moved = false;
    let newScore = score;
    let newTiles = tiles.map(t => ({ ...t, isNew: false, isMerged: false }));
    const maxId = Math.max(...newTiles.map(t => t.id), 0);

    // Sort tiles based on direction
    const sorted = [...newTiles].sort((a, b) => {
      if (direction === 'up') return a.position.row - b.position.row;
      if (direction === 'down') return b.position.row - a.position.row;
      if (direction === 'left') return a.position.col - b.position.col;
      return b.position.col - a.position.col;
    });

    const merged: boolean[][] = Array(4).fill(null).map(() => Array(4).fill(false));

    sorted.forEach(tile => {
      let newRow = tile.position.row;
      let newCol = tile.position.col;

      while (true) {
        const nextRow = direction === 'up' ? newRow - 1 : direction === 'down' ? newRow + 1 : newRow;
        const nextCol = direction === 'left' ? newCol - 1 : direction === 'right' ? newCol + 1 : newCol;

        if (nextRow < 0 || nextRow > 3 || nextCol < 0 || nextCol > 3) break;

        const targetTile = newTiles.find(t => t.position.row === nextRow && t.position.col === nextCol && t.id !== tile.id);

        if (targetTile) {
          if (targetTile.value === tile.value && !merged[nextRow][nextCol] && !merged[newRow][newCol]) {
            // Merge tiles
            newTiles = newTiles.filter(t => t.id !== tile.id);
            const mergedTile = newTiles.find(t => t.id === targetTile.id);
            if (mergedTile) {
              mergedTile.value *= 2;
              mergedTile.isMerged = true;
              newScore += mergedTile.value;
              merged[nextRow][nextCol] = true;
              moved = true;
              
              if (mergedTile.value === 2048 && !gameWon) {
                setGameWon(true);
              }
            }
          }
          break;
        }

        newRow = nextRow;
        newCol = nextCol;
      }

      if (newRow !== tile.position.row || newCol !== tile.position.col) {
        const movedTile = newTiles.find(t => t.id === tile.id);
        if (movedTile) {
          movedTile.position = { row: newRow, col: newCol };
          moved = true;
        }
      }
    });

    if (moved) {
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        window.storage.set('bestScore', newScore.toString(), false);
      }

      const emptyPositions = getEmptyPositions(newTiles);
      if (emptyPositions.length > 0) {
        const newTile = createRandomTile(maxId + 1);
        newTiles.push(newTile);
      }

      setTiles(newTiles);

      // Check game over
      setTimeout(() => {
        if (!canMove(newTiles)) {
          setGameOver(true);
        }
      }, 300);
    }
  }, [tiles, score, gameOver, gameWon, bestScore]);

  const canMove = (currentTiles: Tile[]) => {
    if (getEmptyPositions(currentTiles).length > 0) return true;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const tile = currentTiles.find(t => t.position.row === row && t.position.col === col);
        if (!tile) continue;

        const neighbors = [
          currentTiles.find(t => t.position.row === row - 1 && t.position.col === col),
          currentTiles.find(t => t.position.row === row + 1 && t.position.col === col),
          currentTiles.find(t => t.position.row === row && t.position.col === col - 1),
          currentTiles.find(t => t.position.row === row && t.position.col === col + 1),
        ];

        if (neighbors.some(n => n && n.value === tile.value)) return true;
      }
    }
    return false;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        move(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch/swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        move(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        move(deltaY > 0 ? 'down' : 'up');
      }
    }

    setTouchStart(null);
  };

  const handlePlayAgain = () => {
    initializeGame();
  };

  const handleShareScore = async () => {
    if (!username.trim()) {
      alert('Please enter a username first!');
      return;
    }

    // Save to leaderboard
    const newEntry: LeaderboardEntry = {
      username: username.trim(),
      score,
      timestamp: Date.now()
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    try {
      await window.storage.set('leaderboard', JSON.stringify(updatedLeaderboard), true);
      setLeaderboard(updatedLeaderboard);
    } catch (error) {
      console.error('Failed to save to leaderboard:', error);
    }

    // Share on Farcaster
    const appUrl = window.location.origin;
    const text = `🎮 I scored ${score} in 2048! Can you beat it?\n\n${appUrl}`;
    
    // Open share URL
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: 'bg-[#eee4da] text-[#776e65]',
      4: 'bg-[#ede0c8] text-[#776e65]',
      8: 'bg-[#f2b179] text-white',
      16: 'bg-[#f59563] text-white',
      32: 'bg-[#f67c5f] text-white',
      64: 'bg-[#f65e3b] text-white',
      128: 'bg-[#edcf72] text-white',
      256: 'bg-[#edcc61] text-white',
      512: 'bg-[#edc850] text-white',
      1024: 'bg-[#edc53f] text-white',
      2048: 'bg-[#edc22e] text-white',
    };
    return colors[value] || 'bg-[#3c3a32] text-white';
  };

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-[#faf8ef] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-[#776e65]">🏆 Leaderboard</h1>
            <button
              onClick={() => setShowLeaderboard(false)}
              className="px-4 py-2 bg-[#8f7a66] text-white rounded font-bold hover:bg-[#9f8a76]"
            >
              Back
            </button>
          </div>
          
          <div className="bg-[#bbada0] rounded-lg p-4">
            {leaderboard.length === 0 ? (
              <p className="text-white text-center py-8">No scores yet. Be the first!</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-[#cdc1b4] rounded p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-[#776e65] w-8">
                        {index + 1}
                      </span>
                      <span className="font-bold text-[#776e65]">{entry.username}</span>
                    </div>
                    <span className="text-xl font-bold text-[#776e65]">{entry.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8ef] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-5xl font-bold text-[#776e65]">2048</h1>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="px-4 py-2 bg-[#8f7a66] text-white rounded font-bold hover:bg-[#9f8a76] flex items-center gap-2"
          >
            <Trophy size={20} />
            Leaderboard
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="bg-[#bbada0] px-6 py-3 rounded flex-1 text-center">
            <div className="text-[#eee4da] text-sm font-bold">SCORE</div>
            <div className="text-white text-2xl font-bold">{score}</div>
          </div>
          <div className="bg-[#bbada0] px-6 py-3 rounded flex-1 text-center">
            <div className="text-[#eee4da] text-sm font-bold">BEST</div>
            <div className="text-white text-2xl font-bold">{bestScore}</div>
          </div>
        </div>

        <div
          className="bg-[#bbada0] p-3 rounded-lg relative select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ aspectRatio: '1/1' }}
        >
          {/* Grid background */}
          <div className="grid grid-cols-4 gap-3 h-full">
            {Array(16).fill(0).map((_, i) => (
              <div key={i} className="bg-[#cdc1b4] rounded" />
            ))}
          </div>

          {/* Tiles */}
          <div className="absolute inset-3">
            {tiles.map(tile => (
              <div
                key={tile.id}
                className={`absolute w-[calc(25%-0.75rem)] h-[calc(25%-0.75rem)] rounded flex items-center justify-center font-bold transition-all duration-200 ${getTileColor(tile.value)} ${tile.isNew ? 'animate-pop' : ''} ${tile.isMerged ? 'animate-merge' : ''}`}
                style={{
                  left: `calc(${tile.position.col * 25}% + ${tile.position.col * 0.75}rem)`,
                  top: `calc(${tile.position.row * 25}% + ${tile.position.row * 0.75}rem)`,
                  fontSize: tile.value >= 1000 ? '1.5rem' : tile.value >= 100 ? '2rem' : '2.5rem'
                }}
              >
                {tile.value}
              </div>
            ))}
          </div>

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-white/80 rounded-lg flex flex-col items-center justify-center gap-4">
              <div className="text-4xl font-bold text-[#776e65]">Game Over!</div>
              <div className="text-2xl text-[#776e65]">Score: {score}</div>
              
              <input
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-4 py-2 rounded border-2 border-[#bbada0] text-center"
                maxLength={20}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={handlePlayAgain}
                  className="px-6 py-3 bg-[#8f7a66] text-white rounded font-bold hover:bg-[#9f8a76]"
                >
                  Play Again
                </button>
                <button
                  onClick={handleShareScore}
                  className="px-6 py-3 bg-[#edc22e] text-white rounded font-bold hover:bg-[#edcf72]"
                >
                  Share Score
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[#776e65] mt-4 text-sm">
          Swipe to move tiles. Combine tiles to reach 2048!
        </p>

        <style jsx>{`
          @keyframes pop {
            0% { transform: scale(0); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          @keyframes merge {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          .animate-pop {
            animation: pop 0.2s ease-out;
          }
          .animate-merge {
            animation: merge 0.2s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
