import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

interface Props {
  onPhaseChange?: (phase: string) => void;
}

export const BattleView: React.FC<Props> = ({ onPhaseChange }) => {
  const phase = useGameStore(s => s.battleState?.phase ?? 'draw');
  const events = useGameStore(s => s.events);
  const initBattle = useGameStore(s => s.initBattle);
  const endTurn = useGameStore(s => s.endTurn);
  const enemyTurn = useGameStore(s => s.enemyTurn);

  useEffect(() => {
    initBattle();
  }, []);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase]);

  const handleEndTurn = () => {
    if (phase === 'player_turn') {
      endTurn();
    }
  };

  const handleNextPhase = () => {
    if (phase === 'enemy_turn' || phase === 'auto_resolve') {
      enemyTurn();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
    }}>
      {/* Battle log */}
      <div style={{
        maxHeight: 100, overflow: 'auto', width: '100%',
        padding: 8, fontSize: 11, color: '#aaa',
        background: '#050505',
      }}>
        {events.map((e, i) => (
          <div key={i}>
            {e.type === 'damage' && `${e.targetId === 'player' ? '玩家' : '敌人'} 受到 ${e.amount} 点伤害`}
            {e.type === 'block' && `玩家 获得 ${e.amount} 点格挡`}
            {e.type === 'draw' && `抽了 ${e.count} 张牌`}
            {e.type === 'card_played' && `${e.isAuto ? '自动' : '手动'}打出了一张牌`}
            {e.type === 'phase_change' && `阶段转换: ${e.from} → ${e.to}`}
            {e.type === 'enemy_defeated' && '敌人被击败！'}
            {e.type === 'player_defeated' && '玩家被击败！'}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        {phase === 'player_turn' && (
          <button onClick={handleEndTurn} style={btnStyle}>
            结束回合（自动结算剩余手牌）
          </button>
        )}
        {(phase === 'auto_resolve' || phase === 'enemy_turn') && (
          <button onClick={handleNextPhase} style={btnStyle}>
            继续
          </button>
        )}
        {(phase === 'victory' || phase === 'defeat') && (
          <button onClick={() => initBattle()} style={btnStyle}>
            重新开始
          </button>
        )}
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: 14,
  background: '#c0392b',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
};
