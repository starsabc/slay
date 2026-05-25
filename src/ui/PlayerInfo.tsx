import React from 'react';
import { useGameStore } from '../store/gameStore';

export const PlayerInfo: React.FC = () => {
  const player = useGameStore(s => s.battleState?.player);
  const energy = useGameStore(s => s.battleState?.energy ?? 0);
  const maxEnergy = useGameStore(s => s.battleState?.maxEnergy ?? 3);
  const phase = useGameStore(s => s.battleState?.phase ?? 'draw');
  const turnNumber = useGameStore(s => s.battleState?.turnNumber ?? 0);

  if (!player) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '10px 20px',
      background: '#0a0a0a',
      borderBottom: '1px solid #333',
      color: '#ddd',
      fontSize: 14,
    }}>
      <div>回合 {turnNumber}</div>
      <div>HP {player.currentHp}/{player.maxHp}</div>
      {player.block > 0 && <div>护盾 {player.block}</div>}
      <div>内力 {energy}/{maxEnergy}</div>
      <div style={{ color: '#888', marginLeft: 'auto' }}>
        {phase === 'player_turn' && '你的回合'}
        {phase === 'auto_resolve' && '自动结算中...'}
        {phase === 'enemy_turn' && '敌人回合'}
        {phase === 'victory' && '胜利！'}
        {phase === 'defeat' && '战败...'}
      </div>
    </div>
  );
};
