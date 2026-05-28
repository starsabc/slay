import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getEventDef, getRandomEventIds } from '../data/events';

export const EventView: React.FC = () => {
  const runState = useGameStore(s => s.runState);
  const backToMap = useGameStore(s => s.backToMap);
  const acquireRelic = useGameStore(s => s.acquireRelic);
  const gainGold = useGameStore(s => s.gainGold);
  const healPlayerMeta = useGameStore(s => s.healPlayerMeta);
  const increaseMaxHp = useGameStore(s => s.increaseMaxHp);
  const damagePlayerMeta = useGameStore(s => s.damagePlayerMeta);
  const gainQi = useGameStore(s => s.gainQi);

  const [eventId] = useState(() => getRandomEventIds(1)[0]);
  const [result, setResult] = useState<string | null>(null);

  if (!runState) return null;

  const event = getEventDef(eventId);
  if (!event) return null;

  const handleChoice = (index: number) => {
    const choice = event.choices[index];
    const effect = choice.effect;
    let msg = '';

    switch (effect.type) {
      case 'add_card':
        msg = '获得了一张新卡牌！';
        break;
      case 'add_relic': {
        const ids = ['iron_body', 'berserk', 'shadow_step', 'rock_stance', 'sacrifice', 'first_move'];
        const relicId = ids[Math.floor(Math.random() * ids.length)];
        const ok = acquireRelic(relicId);
        msg = ok ? `获得了心法：${relicId}` : '心法槽位已满，无法获得';
        break;
      }
      case 'gold_gain':
        if (effect.value && effect.value > 0) {
          gainGold(effect.value);
          msg = `获得了 ${effect.value} 灵石`;
        } else {
          msg = '无事发生';
        }
        break;
      case 'heal':
        if (effect.value) {
          const heal = Math.floor(runState.maxHp * effect.value / 100);
          healPlayerMeta(heal);
          msg = `回复了 ${heal} HP`;
        }
        break;
      case 'max_hp_up':
        increaseMaxHp(effect.value || 0);
        msg = `最大 HP +${effect.value}`;
        break;
      case 'damage':
        damagePlayerMeta(effect.value || 0);
        msg = `失去了 ${effect.value} HP`;
        break;
      case 'qi_gain':
        gainQi(effect.value || 0);
        msg = `气运 +${effect.value}`;
        break;
      case 'reveal_boss':
        msg = 'Boss 的位置被揭示！';
        break;
      case 'remove_card':
        msg = '一张牌被永久移除';
        break;
      case 'skip_boss':
        msg = '你跳过了本层的 Boss';
        backToMap();
        return;
      default:
        msg = choice.description;
    }

    setResult(msg);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#ddd', fontFamily: 'sans-serif', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 500, width: '100%' }}>
        <h2 style={{ color: '#c0392b', marginBottom: 8 }}>{event.name}</h2>
        <p style={{ fontSize: 14, color: '#aaa', marginBottom: 24, lineHeight: 1.6 }}>{event.description}</p>

        {result ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 16, color: '#4a9', marginBottom: 16 }}>{result}</p>
            <button onClick={backToMap} style={btnStyle}>继续探索</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {event.choices.map((choice, i) => (
              <button key={i} onClick={() => handleChoice(i)} style={choiceBtnStyle}>
                <div style={{ fontWeight: 'bold' }}>{choice.label}</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>{choice.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  padding: '10px 24px', fontSize: 14, background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
};

const choiceBtnStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: 14, background: '#1a1a2e', color: '#ddd', border: '1px solid #444', borderRadius: 6, cursor: 'pointer', textAlign: 'left' as const,
};
