import React from 'react';
import type { RuntimeCard } from '../types';
import { useGameStore } from '../store/gameStore';

interface Props {
  card: RuntimeCard;
  isManual: boolean;
  onPlay?: (instanceId: string) => void;
}

export const CardComponent: React.FC<Props> = ({ card, isManual, onPlay }) => {
  const getCardDef = useGameStore(s => s.getCardDef);
  const energy = useGameStore(s => s.battleState?.energy ?? 0);
  const def = getCardDef(card.defId);
  const canAfford = energy >= def.cost;

  const handleClick = () => {
    if (isManual && canAfford && onPlay) {
      onPlay(card.instanceId);
    }
  };

  const rarityColors: Record<string, string> = {
    basic: '#888',
    advanced: '#4a90d9',
    master: '#9b59b6',
    legendary: '#d4a017',
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: 100,
        minHeight: 140,
        border: `2px solid ${rarityColors[def.rarity] || '#888'}`,
        borderRadius: 8,
        padding: 8,
        margin: '0 4px',
        background: isManual && canAfford ? '#1a1a2e' : '#111',
        opacity: isManual && !canAfford ? 0.5 : 1,
        cursor: isManual && canAfford ? 'pointer' : 'default',
        color: '#ddd',
        fontSize: 11,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
      }}
    >
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: 2 }}>{def.name}</div>
        <div style={{ color: '#888', fontSize: 10 }}>{def.type} | 消耗 {def.cost} 内力</div>
      </div>
      <div style={{ fontSize: 10, whiteSpace: 'pre-line', lineHeight: 1.3 }}>
        {def.description}
      </div>
      {def.orderTag && (
        <div style={{ color: '#e74c3c', fontSize: 10, fontWeight: 'bold' }}>
          [{def.orderTag === 'priority' ? '优先' : '延后'}]
        </div>
      )}
    </div>
  );
};
