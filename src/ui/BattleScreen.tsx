import React, { useCallback, useState, useEffect, useRef } from 'react';
import { BattleView } from './BattleView';
import { HandArea } from './HandArea';
import { PlayerInfo } from './PlayerInfo';
import { EnemyArea } from './EnemyArea';
import { RelicBar } from './RelicBar';
import { useGameStore, generateBattleReward } from '../store/gameStore';

export const BattleScreen: React.FC = () => {
  const [pendingAttackCardId, setPendingAttackCardId] = useState<string | null>(null);
  const playCard = useGameStore(s => s.playCard);
  const getCardDef = useGameStore(s => s.getCardDef);
  const battlePhase = useGameStore(s => s.battleState?.phase ?? 'draw');
  const handleBattleVictory = useGameStore(s => s.handleBattleVictory);
  const runState = useGameStore(s => s.runState);
  const acceptReward = useGameStore(s => s.acceptReward);
  const skipReward = useGameStore(s => s.skipReward);
  const backToMap = useGameStore(s => s.backToMap);
  const advanceFloor = useGameStore(s => s.advanceFloor);

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

  const isBoss = runState
    ? runState.grid[runState.currentPosition.row]?.[runState.currentPosition.col]?.type === 'boss'
    : false;

  const handleBackToMap = useCallback(() => {
    backToMap();
    if (isBoss) advanceFloor();
  }, [backToMap, advanceFloor, isBoss]);

  const showVictory = runState?.phase === 'battle_victory' && runState.pendingReward;
  const rewardCardsAvailable = showVictory && runState!.pendingReward!.cardChoices.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111',
      color: '#ddd',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <PlayerInfo />
      {runState && (
        <div style={{
          display: 'flex', justifyContent: 'center',
          padding: '4px 20px', background: '#0d0d0d',
          borderBottom: '1px solid #333',
        }}>
          <RelicBar />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <EnemyArea
          selectable={!!pendingAttackCardId}
          selectedTargetId={pendingAttackCardId ? null : null}
          onSelect={handleEnemySelect}
        />
        <BattleView />
      </div>
      <HandArea onPlayCard={handleCardPlay} highlightMode={battlePhase === 'auto_resolve'} />

      {/* Battle Victory Overlay */}
      {showVictory && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: 12,
            padding: '32px 40px',
            minWidth: 420,
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#ffd700', fontSize: 24 }}>
              战斗胜利！
            </h2>
            <div style={{ marginBottom: 16, fontSize: 15, lineHeight: 2 }}>
              <div>获得 <span style={{ color: '#ffd700' }}>{runState!.pendingReward!.gold}</span> 灵石</div>
              <div>恢复 <span style={{ color: '#7ec8e3' }}>{runState!.pendingReward!.qiRestore}</span> 气运</div>
            </div>

            {rewardCardsAvailable && (
              <>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#ccc' }}>
                  选择一张卡牌加入牌组：
                </h3>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
                  {runState!.pendingReward!.cardChoices.map(cardId => {
                    const def = getCardDef(cardId);
                    return (
                      <div
                        key={cardId}
                        onClick={() => acceptReward(cardId)}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          background: '#2a1a0a',
                          border: '1px solid #5a4a2a',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: 14,
                          color: '#eed',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#3a2a1a'; e.currentTarget.style.borderColor = '#d4a017'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#2a1a0a'; e.currentTarget.style.borderColor = '#5a4a2a'; }}
                      >
                        <div style={{ fontWeight: 'bold' }}>{def?.name ?? cardId}</div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                          {def?.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={skipReward}
                  style={{
                    padding: '6px 20px', marginBottom: 12,
                    background: '#333', border: '1px solid #555',
                    borderRadius: 6, color: '#ccc', cursor: 'pointer', fontSize: 13,
                  }}
                >
                  跳过
                </button>
              </>
            )}

            <div>
              <button
                onClick={handleBackToMap}
                style={{
                  padding: '8px 28px',
                  background: '#2a4a2a', border: '1px solid #4a7a4a',
                  borderRadius: 6, color: '#cfc', cursor: 'pointer', fontSize: 14,
                  fontWeight: 'bold',
                }}
              >
                返回地图
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
