'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Trophy } from 'lucide-react';

const Game2048 = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [mounted, setMounted] = useState(false);
  const SIZE = 4;

  // Initialize game
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('2048-best');
      if (saved) setBestScore(parseInt(saved));
    }
    initGame();
  }, []);

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
    // Remove zeros
    let newRow = row.filter(val => val !== 0);
    let addScore = 0;
    
    // Merge adjacent equal values
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
    
    // Remove zeros again after merging
    newRow = newRow.filter(val => val !== 0);
    
    // Fill with zeros to maintain size
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
      
      // Check if row changed
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
      
      // Check if column changed
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
    // Check if there are any empty cells
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (currentGrid[i][j] === 0) return;
      }
    }

    // Check if any adjacent cells can be merged
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (j < SIZE - 1 && currentGrid[i][j] === currentGrid[i][j + 1]) return;
        if (i < SIZE - 1 && currentGrid[i][j] === currentGrid[i + 1][j]) return;
      }
    }

    setGameOver(true);
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    
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
  }, [grid, gameOver]);

  useEffect(() => {
    if (mounted) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [handleKeyPress, mounted]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold text-indigo-600 mb-2">2048</h1>
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
            <button
              onClick={initGame}
              className="bg-gray-700 hover:bg-gray-800 text-white rounded-lg px-4 flex items-center justify-center transition-colors"
              title="New Game"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          {/* Game Board */}
          <div className="bg-gray-800 rounded-xl p-3 mb-6 relative">
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
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-4">
                    {won && !gameOver ? '🎉 You Won!' : gameOver ? '💀 Game Over' : '🎉 You Won!'}
                  </div>
                  <div className="text-2xl text-white mb-6">
                    Score: {score}
                  </div>
                  <button
                    onClick={initGame}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Touch Controls */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div></div>
            <button
              onClick={moveUp}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 flex items-center justify-center transition-colors active:scale-95"
            >
              <ArrowUp size={28} />
            </button>
            <div></div>
            <button
              onClick={moveLeft}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 flex items-center justify-center transition-colors active:scale-95"
            >
              <ArrowLeft size={28} />
            </button>
            <button
              onClick={moveDown}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 flex items-center justify-center transition-colors active:scale-95"
            >
              <ArrowDown size={28} />
            </button>
            <button
              onClick={moveRight}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 flex items-center justify-center transition-colors active:scale-95"
            >
              <ArrowRight size={28} />
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-gray-600">
            <p className="mb-1">Use arrow keys or touch buttons</p>
            <p className="text-xs">Merge tiles with same numbers to reach 2048!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game2048;
