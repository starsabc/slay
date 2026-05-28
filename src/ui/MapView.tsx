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

  const nodeLabel: Record<string, string> = {
    start: '始', battle: '战', elite: '精', shop: '商', event: '?', rest: '息', boss: '王',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#ddd', fontFamily: 'sans-serif', padding: 20 }}>
      {/* Resource bar */}
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 20, fontSize: 14 }}>
        <span>第 {currentFloor} 层</span>
        <span>HP {currentHp}/{maxHp}</span>
        <span>气运 {qi}</span>
        <span>警惕 {alert}</span>
        <span>灵石 {gold}</span>
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
              {node.revealed ? nodeLabel[node.type] || '?' : node.foggy ? '?' : '.'}
              {node.visited && !isCurrent && <div style={{ fontSize: 10, color: '#5a5' }}>OK</div>}
            </div>
          );
        })}
      </div>

      {/* Help text */}
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#888' }}>
        点击相邻格子移动（消耗气运）| 到达 [王] Boss 格即可挑战通关
      </div>
    </div>
  );
};
