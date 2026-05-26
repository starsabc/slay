import React from 'react';
import { useGameStore } from '../store/gameStore';

interface Props {
  selectable?: boolean;
  selectedTargetId?: string | null;
  onSelect?: (enemyId: string) => void;
}

export const EnemyArea: React.FC<Props> = ({ selectable, selectedTargetId, onSelect }) => {
  const enemies = useGameStore(s => s.battleState?.enemies ?? []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 30,
      padding: 30,
      minHeight: 120,
    }}>
      {enemies.map(enemy => {
        const isSelected = selectedTargetId === enemy.id;
        const isDead = enemy.currentHp <= 0;
        return (
          <div
            key={enemy.id}
            onClick={() => {
              if (selectable && onSelect && !isDead) {
                onSelect(enemy.id);
              }
            }}
            style={{
              width: 120,
              padding: 12,
              border: isSelected ? '2px solid #e74c3c' : '1px solid #c0392b',
              borderRadius: 8,
              background: isSelected ? '#2a0a0a' : '#1a0a0a',
              color: '#ddd',
              textAlign: 'center',
              cursor: selectable && !isDead ? 'pointer' : 'default',
              opacity: isDead ? 0.4 : 1,
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{enemy.name}</div>
            <div style={{ fontSize: 12 }}>HP {enemy.currentHp}/{enemy.maxHp}</div>
            {enemy.block > 0 && <div style={{ fontSize: 12 }}>护盾 {enemy.block}</div>}
            {enemy.wound > 0 && <div style={{ fontSize: 12, color: '#8e44ad' }}>内伤 {enemy.wound}</div>}
            <div style={{ fontSize: 10, color: '#e74c3c', marginTop: 4 }}>
              意图: {enemy.intent.type === 'attack' ? `⚔ ${enemy.intent.value}` : enemy.intent.type === 'defend' ? `🛡 ${enemy.intent.value}` : enemy.intent.type}
            </div>
          </div>
        );
      })}
    </div>
  );
};
