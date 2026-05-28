import React, { useCallback, useState, useEffect, useRef } from 'react';
import { BattleView } from './BattleView';
import { HandArea } from './HandArea';
import { PlayerInfo } from './PlayerInfo';
import { EnemyArea } from './EnemyArea';
import { useGameStore, generateBattleReward } from '../store/gameStore';

export const BattleScreen: React.FC = () => {
  const [pendingAttackCardId, setPendingAttackCardId] = useState<string | null>(null);
  const playCard = useGameStore(s => s.playCard);
  const getCardDef = useGameStore(s => s.getCardDef);
  const battlePhase = useGameStore(s => s.battleState?.phase ?? 'draw');
  const handleBattleVictory = useGameStore(s => s.handleBattleVictory);
  const runState = useGameStore(s => s.runState);

  // Detect battle victory and trigger reward flow
  const prevBattlePhaseRef = useRef(battlePhase);
  useEffect(() => {
    if (prevBattlePhaseRef.current !== 'victory' && battlePhase === 'victory') {
      const reward = generateBattleReward();
      handleBattleVictory(reward);
    }
    prevBattlePhaseRef.current = battlePhase;
  }, [battlePhase, handleBattleVictory]);

  const handleCardPlay = useCallback((instanceId: string) => {
    const cardInHand = useGameStore.getState().battleState?.hand.find(
      c => c.instanceId === instanceId
    );
    if (!cardInHand) return;

    const def = getCardDef(cardInHand.defId);
    if (!def) return;

    // Cards with damage, wound, or detonate need target selection
    if (def.manualEffect.damage != null || def.manualEffect.wound != null || def.manualEffect.detonate != null) {
      setPendingAttackCardId(instanceId);
    } else {
      // Self-targeting card (defense, draw, energy, etc.)
      playCard(instanceId);
    }
  }, [playCard, getCardDef, setPendingAttackCardId]);

  const handleEnemySelect = useCallback((enemyId: string) => {
    if (pendingAttackCardId) {
      playCard(pendingAttackCardId, enemyId);
      setPendingAttackCardId(null);
    }
  }, [pendingAttackCardId, playCard, setPendingAttackCardId]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111',
      color: '#ddd',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <PlayerInfo />
      <div style={{ flex: 1 }}>
        <EnemyArea
          selectable={!!pendingAttackCardId}
          selectedTargetId={pendingAttackCardId ? null : null}
          onSelect={handleEnemySelect}
        />
        <BattleView />
      </div>
      <HandArea onPlayCard={handleCardPlay} highlightMode={battlePhase === 'auto_resolve'} />
    </div>
  );
};
