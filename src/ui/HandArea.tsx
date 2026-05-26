import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CardComponent } from './CardComponent';
import { calcPositionMultiplier } from '../engine/AutoResolver';

interface Props {
  onPlayCard?: (instanceId: string) => void;
  highlightMode?: boolean;
}

export const HandArea: React.FC<Props> = ({ onPlayCard, highlightMode }) => {
  const hand = useGameStore(s => s.battleState?.hand ?? []);
  const phase = useGameStore(s => s.battleState?.phase ?? 'draw');
  const playCard = useGameStore(s => s.playCard);

  const canPlay = phase === 'player_turn';

  const handlePlay = (instanceId: string) => {
    if (canPlay) {
      if (onPlayCard) {
        onPlayCard(instanceId);
      } else {
        playCard(instanceId);
      }
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
      {hand.map((card, index) => {
        const circledNumbers = ['\u2460','\u2461','\u2462','\u2463','\u2464','\u2465','\u2466','\u2467','\u2468','\u2469'];
        let positionLabel: string | undefined;
        if (highlightMode) {
          const mult = calcPositionMultiplier(index, hand.length);
          const numLabel = index < 10 ? circledNumbers[index] : `${index + 1}`;
          positionLabel = `${numLabel} \u00d7${mult.toFixed(2)}`;
        }
        return (
          <CardComponent
            key={card.instanceId}
            card={card}
            isManual={canPlay}
            onPlay={handlePlay}
            positionLabel={positionLabel}
          />
        );
      })}
      {hand.length === 0 && (
        <div style={{ color: '#555' }}>手牌为空</div>
      )}
    </div>
  );
};
