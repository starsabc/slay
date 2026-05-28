import React from 'react';
import { useGameStore } from '../store/gameStore';

export const RelicBar: React.FC = () => {
  const runState = useGameStore(s => s.runState);
  if (!runState) return null;

  const { relics, maxRelicSlots } = runState;
  const slots = Array.from({ length: maxRelicSlots });

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {slots.map((_, i) => {
        const relic = relics[i];
        return (
          <div key={i} title={relic?.description || '空槽位'}
            style={{
              width: 28, height: 28, borderRadius: 4,
              background: relic ? '#2a1a0a' : '#1a1a1a',
              border: `1px solid ${relic ? '#d4a017' : '#333'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: relic ? '#d4a017' : '#555',
              cursor: relic ? 'help' : 'default',
            }}>
            {relic ? '◈' : '○'}
          </div>
        );
      })}
    </div>
  );
};
