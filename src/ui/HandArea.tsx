import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CardComponent } from './CardComponent';

export const HandArea: React.FC = () => {
  const hand = useGameStore(s => s.battleState?.hand ?? []);
  const phase = useGameStore(s => s.battleState?.phase ?? 'draw');
  const playCard = useGameStore(s => s.playCard);

  const canPlay = phase === 'player_turn';

  const handlePlay = (instanceId: string) => {
    if (canPlay) {
      playCard(instanceId);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      padding: '12px 0',
      minHeight: 160,
      background: '#0a0a0a',
      borderTop: '1px solid #333',
    }}>
      {hand.map(card => (
        <CardComponent
          key={card.instanceId}
          card={card}
          isManual={canPlay}
          onPlay={handlePlay}
        />
      ))}
      {hand.length === 0 && (
        <div style={{ color: '#555' }}>手牌为空</div>
      )}
    </div>
  );
};
