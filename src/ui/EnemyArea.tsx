import React from 'react';
import { useGameStore } from '../store/gameStore';

export const EnemyArea: React.FC = () => {
  const enemies = useGameStore(s => s.battleState?.enemies ?? []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 30,
      padding: 30,
      minHeight: 120,
    }}>
      {enemies.map(enemy => (
        <div
          key={enemy.id}
          style={{
            width: 120,
            padding: 12,
            border: '1px solid #c0392b',
            borderRadius: 8,
            background: '#1a0a0a',
            color: '#ddd',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{enemy.name}</div>
          <div style={{ fontSize: 12 }}>HP {enemy.currentHp}/{enemy.maxHp}</div>
          {enemy.block > 0 && <div style={{ fontSize: 12 }}>护盾 {enemy.block}</div>}
          <div style={{ fontSize: 10, color: '#e74c3c', marginTop: 4 }}>
            意图: {enemy.intent.type === 'attack' ? `攻击 ${enemy.intent.value}` : enemy.intent.type}
          </div>
        </div>
      ))}
    </div>
  );
};
