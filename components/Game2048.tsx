'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Clock, Gamepad2 } from 'lucide-react';

interface LeaderboardEntry {
  username: string;
  score: number;
  timestamp: number;
}

// Extend Window interface for storage API
declare global {
  interface Window {
    storage?: {
      get: (key: string, shared?: boolean) => Promise<{ key: string; value: string; shared: boolean } | null>;
      set: (key: string, value: string, shared?: boolean) => Promise<{ key: string; value: string; shared: boolean } | null>;
      delete: (key: string, shared?: boolean) => Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
      list: (prefix?: string, shared?: boolean) => Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
    };
  }
}

const Game2048 = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'game' | 'leaderboard'>('home');
  const [gameMode, setGameMode] = useState<'normal' | 'timed'>('normal');
  const [timeLeft, setTimeLeft] = useState(30);
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [username, setUsername] = useState('');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const SIZE = 4;

  // Load leaderboard and best score
  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      // Load best score from local storage
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('2048-best');
        if (saved) setBestScore(parseInt(saved));
      }

      // Load leaderboard from persistent storage
      try {
        const leaderboardResult = await window.storage?.get('leaderboard', true);
        if (leaderboardResult) {
          const data = JSON.parse(leaderboardResult.value);
          setLeaderboard(data.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score).slice(0, 10));
        }
      } catch (error) {
        console.log('No leaderboard data yet');
      }
    };
    
    if (typeof window !== 'undefined') {
      loadData();
    }
  }, []);

  // Timer effect for timed mode
  useEffect(() => {
    if (currentScreen === 'game' && gameMode === 'timed' && !gameOver && !won && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentScreen, gameMode, gameOver, won, timeLeft]);

  const startGame = (mode: 'normal' | 'timed') => {
    setGameMode(mode);
    setTimeLeft(30);
    initGame();
    setCurrentScreen('game');
  };

  const initGame = () => {
    const newGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    addNewTile(newGrid);
    addNewTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const addNewTile = (currentGrid: number[][]) => {
    const empty: [number, number][] = [];
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (currentGrid[i][j] === 0) empty.push([i, j]);
      }
    }
    if (empty.length > 0) {
      const [row, col] = empty[Math.floor(Math.random() * empty.length)];
      currentGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const slideAndMergeRow = (row: number[]) => {
    let newRow = row.filter(val => val !== 0);
    let addScore = 0;
    
    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] = newRow[i] * 2;
        addScore += newRow[i];
        if (newRow[i] === 2048) {
          setWon(true);
        }
        newRow[i + 1] = 0;
      }
    }
    
    newRow = newRow.filter(val => val !== 0);
    
    while (newRow.length < SIZE) {
      newRow.push(0);
    }
    
    return { row: newRow, score: addScore };
  };

  const moveLeft = () => {
    let newGrid: number[][] = [];
    let totalScore = 0;
    let moved = false;

    for (let i = 0; i < SIZE; i++) {
      const { row, score } = slideAndMergeRow(grid[i]);
      newGrid.push(row);
      totalScore += score;
      
      if (JSON.stringify(row) !== JSON.stringify(grid[i])) {
        moved = true;
      }
    }

    if (moved) {
      addNewTile(newGrid);
      updateScore(totalScore);
      setGrid(newGrid);
      checkGameOver(newGrid);
    }
  };

  const moveRight = () => {
    let newGrid: number[][] = [];
    let totalScore = 0;
    let moved = false;

    for (let i = 0; i < SIZE; i++) {
      const reversed = [...grid[i]].reverse();
      const { row, score } = slideAndMergeRow(reversed);
      newGrid.push(row.reverse());
      totalScore += score;
      
      if (JSON.stringify(newGrid[i]) !== JSON.stringify(grid[i])) {
        moved = true;
      }
    }

    if (moved) {
      addNewTile(newGrid);
      updateScore(totalScore);
      setGrid(newGrid);
      checkGameOver(newGrid);
    }
  };

  const moveUp = () => {
    let newGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    let totalScore = 0;
    let moved = false;

    for (let j = 0; j < SIZE; j++) {
      const column: number[] = [];
      for (let i = 0; i < SIZE; i++) {
        column.push(grid[i][j]);
      }
      
      const { row, score } = slideAndMergeRow(column);
      totalScore += score;
      
      for (let i = 0; i < SIZE; i++) {
        newGrid[i][j] = row[i];
      }
      
      const originalColumn = grid.map(r => r[j]).join(',');
      const newColumn = row.join(',');
      if (originalColumn !== newColumn) {
        moved = true;
      }
    }

    if (moved) {
      addNewTile(newGrid);
      updateScore(totalScore);
      setGrid(newGrid);
      checkGameOver(newGrid);
    }
  };

  const moveDown = () => {
    let newGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    let totalScore = 0;
    let moved = false;

    for (let j = 0; j < SIZE; j++) {
      const column: number[] = [];
      for (let i = SIZE - 1; i >= 0; i--) {
        column.push(grid[i][j]);
      }
      
      const { row, score } = slideAndMergeRow(column);
      totalScore += score;
      
      for (let i = 0; i < SIZE; i++) {
        newGrid[SIZE - 1 - i][j] = row[i];
      }
      
      const originalColumn = grid.map(r => r[j]).reverse().join(',');
      const newColumn = row.join(',');
      if (originalColumn !== newColumn) {
        moved = true;
      }
    }

    if (moved) {
      addNewTile(newGrid);
      updateScore(totalScore);
      setGrid(newGrid);
      checkGameOver(newGrid);
    }
  };

  const updateScore = (addScore: number) => {
    const newScore = score + addScore;
    setScore(newScore);
    if (newScore > bestScore) {
      setBestScore(newScore);
      if (typeof window !== 'undefined') {
        localStorage.setItem('2048-best', newScore.toString());
      }
    }
  };

  const checkGameOver = (currentGrid: number[][]) => {
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (currentGrid[i][j] === 0) return;
      }
    }

    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (j < SIZE - 1 && currentGrid[i][j] === currentGrid[i][j + 1]) return;
        if (i < SIZE - 1 && currentGrid[i][j] === currentGrid[i + 1][j]) return;
      }
    }

    setGameOver(true);
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver || currentScreen !== 'game') return;
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveLeft();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveRight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveDown();
    }
  }, [grid, gameOver, currentScreen]);

  useEffect(() => {
    if (mounted) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [handleKeyPress, mounted]);

  // Touch/swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || gameOver) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        deltaX > 0 ? moveRight() : moveLeft();
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        deltaY > 0 ? moveDown() : moveUp();
      }
    }

    setTouchStart(null);
  };

  const handleShareScore = async () => {
    if (!username.trim()) {
      alert('Please enter a username first!');
      return;
    }

    const newEntry: LeaderboardEntry = {
      username: username.trim(),
      score,
      timestamp: Date.now()
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    try {
      await window.storage?.set('leaderboard', JSON.stringify(updatedLeaderboard), true);
      setLeaderboard(updatedLeaderboard);
    } catch (error) {
      console.error('Failed to save to leaderboard:', error);
    }

    const appUrl = window.location.origin;
    const text = `🎮 I scored ${score} in 2048! Can you beat it?\n\n${appUrl}`;
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const getTileColor = (value: number) => {
    const colors: {[key: number]: string} = {
      0: 'bg-gray-300',
      2: 'bg-blue-100 text-gray-800',
      4: 'bg-blue-200 text-gray-800',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-orange-500 text-white',
      64: 'bg-red-400 text-white',
      128: 'bg-yellow-300 text-white',
      256: 'bg-yellow-400 text-white',
      512: 'bg-yellow-500 text-white',
      1024: 'bg-purple-400 text-white',
      2048: 'bg-purple-600 text-white',
      4096: 'bg-pink-500 text-white'
    };
    return colors[value] || 'bg-gray-900 text-white';
  };

  const getTileSize = (value: number) => {
    if (value >= 1024) return 'text-2xl';
    if (value >= 128) return 'text-3xl';
    return 'text-4xl';
  };

  if (!mounted) {
    return null;
  }

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            {/* Top Half - Icon */}
            <div className="flex justify-center items-center mb-8 pt-8">
              <img 
                src="https://2048-base-miniapp.vercel.app/icon.png" 
                alt="2048 Game Icon" 
                className="w-[100px] h-[100px] rounded-2xl shadow-lg"
              />
            </div>

            {/* Buttons */}
            <div className="space-y-4 mb-8">
              <button
                onClick={() => startGame('timed')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
              >
                <Clock size={24} />
                Play Against Time (30s)
              </button>
              
              <button
                onClick={() => startGame('normal')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
              >
                <Gamepad2 size={24} />
                Play Normal Game
              </button>
              
              <button
                onClick={() => setCurrentScreen('leaderboard')}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
              >
                <Trophy size={24} />
                Leaderboard
              </button>
            </div>

            {/* Bottom Half - Description */}
            <div className="text-center pb-4">
              <h2 className="text-2xl font-bold text-indigo-600 mb-4">How to Play</h2>
              <div className="text-gray-600 space-y-2">
                <p className="text-sm">Use arrow keys on desktop or swipe on mobile to move tiles.</p>
                <p className="text-sm">When two tiles with the same number touch, they merge into one!</p>
                <p className="text-sm font-semibold">Goal: Reach the 2048 tile to win!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Leaderboard Screen
  if (currentScreen === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-indigo-600 flex items-center justify-center gap-2">
                <Trophy size={36} /> Leaderboard
              </h1>
            </div>
            
            <div className="space-y-3 mb-6" style={{ minHeight: '400px' }}>
              {leaderboard.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No scores yet. Be the first!</p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 flex items-center justify-between border-2 border-indigo-100"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-indigo-600 w-10">
                        {index + 1}
                      </span>
                      <span className="font-bold text-gray-800 text-lg">{entry.username}</span>
                    </div>
                    <span className="text-2xl font-bold text-indigo-600">{entry.score}</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setCurrentScreen('home')}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white rounded-lg py-3 font-bold transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <img 
                src="https://2048-base-miniapp.vercel.app/icon.png" 
                alt="2048 Game" 
                className="w-16 h-16 rounded-lg"
              />
            </div>
            <p className="text-gray-600 text-sm">Join tiles to reach 2048!</p>
          </div>

          {/* Scores */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-3 text-white">
              <div className="text-xs font-semibold uppercase">Score</div>
              <div className="text-2xl font-bold">{score}</div>
            </div>
            <div className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3 text-white">
              <div className="text-xs font-semibold uppercase flex items-center gap-1">
                <Trophy size={12} /> Best
              </div>
              <div className="text-2xl font-bold">{bestScore}</div>
            </div>
            {gameMode === 'timed' && (
              <div className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-3 text-white">
                <div className="text-xs font-semibold uppercase flex items-center gap-1">
                  <Clock size={12} /> Time
                </div>
                <div className="text-2xl font-bold">{timeLeft}s</div>
              </div>
            )}
            <button
              onClick={initGame}
              className="bg-gray-700 hover:bg-gray-800 text-white rounded-lg px-4 flex items-center justify-center transition-colors"
              title="New Game"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          {/* Game Board */}
          <div 
            className="bg-gray-800 rounded-xl p-3 mb-6 relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="grid grid-cols-4 gap-3">
              {grid.map((row, i) =>
                row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`aspect-square rounded-lg flex items-center justify-center font-bold transition-all duration-100 ${getTileColor(cell)} ${getTileSize(cell)}`}
                  >
                    {cell !== 0 && cell}
                  </div>
                ))
              )}
            </div>

            {/* Game Over Overlay */}
            {(gameOver || won) && (
              <div className="absolute inset-0 bg-black bg-opacity-80 rounded-xl flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-4xl font-bold text-white mb-4">
                    {won && !gameOver ? '🎉 You Won!' : gameOver ? '💀 Game Over' : '🎉 You Won!'}
                  </div>
                  <div className="text-2xl text-white mb-4">
                    Score: {score}
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="px-4 py-2 rounded-lg border-2 border-indigo-400 text-center mb-4 w-full max-w-xs text-gray-800"
                    maxLength={20}
                  />
                  
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={initGame}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={handleShareScore}
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Share Score
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-gray-600">
            <p className="mb-1">Use arrow keys or swipe to play</p>
            <p className="text-xs">Merge tiles with same numbers to reach 2048!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
