import React, { useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateShopItems, canAfford } from '../game/ShopManager';
import type { ShopItem } from '../game/ShopManager';

export const ShopView: React.FC = () => {
  const runState = useGameStore(s => s.runState);
  const backToMap = useGameStore(s => s.backToMap);
  const [message, setMessage] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!runState) return [];
    return generateShopItems(runState.deck, runState.relics.map(r => r.id));
  }, [runState?.deck?.length, runState?.relics?.length]);

  if (!runState) return null;

  const handleBuy = (item: ShopItem) => {
    if (!canAfford(runState.gold, item.price)) {
      setMessage('灵石不足！');
      return;
    }
    runState.gold -= item.price;
    if (item.type === 'card' && item.cardId) {
      runState.deck.push(item.cardId);
      setMessage(`购买了 ${item.label}`);
    } else if (item.type === 'relic' && item.relicId) {
      // Store has acquireRelic but we'll directly add to array for shop
      const ok = useGameStore.getState().acquireRelic(item.relicId);
      setMessage(ok ? `装备了心法：${item.label}` : '心法槽位已满');
    } else if (item.type === 'remove') {
      // TODO: show card selection modal in full implementation
      setMessage('请选择要移除的牌（功能开发中）');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#ddd', fontFamily: 'sans-serif', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: '#d4a017' }}>武库</h2>
        <div style={{ fontSize: 14 }}>
          💰 {runState.gold} 灵石 | 🌀 {runState.qi} 气运
        </div>
      </div>

      {message && <div style={{ padding: 8, marginBottom: 12, background: '#2a2', color: '#fff', borderRadius: 4, textAlign: 'center' }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {items.map(item => {
          const afford = canAfford(runState.gold, item.price);
          return (
            <div key={item.id}
              onClick={() => handleBuy(item)}
              style={{
                padding: 12, background: afford ? '#1a1a2e' : '#0a0a0a',
                border: `1px solid ${afford ? '#4a4a8a' : '#333'}`,
                borderRadius: 8, cursor: afford ? 'pointer' : 'default',
                opacity: afford ? 1 : 0.5,
              }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>{item.description}</div>
              <div style={{ color: '#d4a017', fontWeight: 'bold' }}>{item.price} 💰</div>
            </div>
          );
        })}
      </div>

      <button onClick={backToMap} style={{ marginTop: 20, padding: '10px 24px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        离开武库
      </button>
    </div>
  );
};
