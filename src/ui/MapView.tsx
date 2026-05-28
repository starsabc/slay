import React from 'react';
import { useGameStore } from '../store/gameStore';
import { canMoveTo } from '../game/MapGenerator';
import { RelicBar } from './RelicBar';

export const MapView: React.FC = () => {
  const runState = useGameStore(s => s.runState);
  const movePlayer = useGameStore(s => s.movePlayer);
  if (!runState) return null;

  const { grid, currentPosition, qi, alert, gold, currentHp, maxHp, currentFloor } = runState;

  const handleCellClick = (row: number, col: number) => {
    if (canMoveTo(currentPosition, { row, col })) {
      const node = grid[row][col];
      if (node.revealed || node.foggy) {
        movePlayer({ row, col });
      }
    }
  };

  const nodeIcon: Record<string, string> = {
    start: '\u25BC', battle: '\u2694', elite: '\uD83D\uDC80', shop: '\uD83D\uDCB0', event: '\u2753', rest: '\u26E9', boss: '\uD83D\uDC79',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#ddd', fontFamily: 'sans-serif', padding: 20 }}>
      {/* Resource bar */}
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 20, fontSize: 14 }}>
        <span>\u7B2C {currentFloor} \u5C42</span>
        <span>\u2764 {currentHp}/{maxHp}</span>
        <span>\uD83C\uDF00 \u6C14\u8FD0 {qi}</span>
        <span>\u26A0 \u8B66\u60D5 {alert}</span>
        <span>\uD83D\uDCB0 {gold}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <RelicBar />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 500, margin: '0 auto' }}>
        {grid.flat().map(node => {
          const isCurrent = node.row === currentPosition.row && node.col === currentPosition.col;
          const canMove = canMoveTo(currentPosition, { row: node.row, col: node.col }) && node.revealed;

          let bg = '#1a1a1a';
          let border = '1px solid #333';
          if (isCurrent) { bg = '#2a1a0a'; border = '2px solid gold'; }
          else if (node.visited) { bg = '#0a1a0a'; border = '1px solid #2a5a2a'; }
          else if (canMove && node.revealed) { bg = '#1a1a2e'; border = '1px solid #4a4a8a'; }
          else if (node.foggy) { border = '1px dashed #555'; }

          return (
            <div
              key={`${node.row}-${node.col}`}
              onClick={() => handleCellClick(node.row, node.col)}
              style={{
                aspectRatio: '1', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: bg, border, borderRadius: 8,
                cursor: canMove ? 'pointer' : 'default',
                opacity: node.revealed || node.foggy ? 1 : 0.3,
                fontSize: 24, transition: 'all 0.2s',
              }}
            >
              {node.revealed ? nodeIcon[node.type] || '?' : node.foggy ? '?' : '\u00B7'}
              {node.visited && !isCurrent && <div style={{ fontSize: 10, color: '#5a5' }}>\u2713</div>}
            </div>
          );
        })}
      </div>

      {/* Help text */}
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#888' }}>
        \u70B9\u51FB\u76F8\u90BB\u683C\u5B50\u79FB\u52A8\uFF08\u6D88\u8017\u6C14\u8FD0\uFF09| \u5230\u8FBE \uD83D\uDC79 Boss \u683C\u5373\u53EF\u6311\u6218\u901A\u5173
      </div>
    </div>
  );
};
