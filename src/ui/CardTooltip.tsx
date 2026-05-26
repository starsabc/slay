import React from 'react';
import type { RuntimeCard } from '../types';
import { useGameStore } from '../store/gameStore';
import { getCardDef } from '../data/cards';

interface Props {
  card: RuntimeCard;
  show: boolean;
}

export const CardTooltip: React.FC<Props> = ({ card, show }) => {
  const hand = useGameStore(s => s.battleState?.hand ?? []);
  const handSize = hand.length;

  if (!show) return null;

  const def = getCardDef(card.defId);

  // Calculate real-time position multiplier
  const positionIndex = hand.findIndex(c => c.instanceId === card.instanceId);
  const multiplier = positionIndex >= 0 && handSize > 1
    ? Math.round((1.5 - 0.6 * (positionIndex / (handSize - 1))) * 100) / 100
    : 1.0;

  const autoBlock = formatAutoValue(def.autoEffect.block ?? 0, handSize, multiplier, 'block', def.id);
  const autoDmg = formatAutoValue(def.autoEffect.damage ?? 0, handSize, multiplier, 'damage', def.id);
  const autoWound = formatAutoValue(def.autoEffect.wound ?? 0, handSize, multiplier, 'wound', def.id);

  return (
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 8,
      background: '#1a1a2e',
      border: '1px solid #555',
      borderRadius: 6,
      padding: '8px 12px',
      minWidth: 180,
      zIndex: 100,
      fontSize: 12,
      color: '#ddd',
      whiteSpace: 'pre-line',
      pointerEvents: 'none',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{def.name}</div>
      <div style={{ color: '#888' }}>手动（消耗{def.cost}内力）：</div>
      <div>{formatManual(def)}</div>
      <div style={{ color: '#e74c3c', marginTop: 4 }}>自动（倍率 ×{multiplier}，手牌{handSize}张）：</div>
      <div>
        {autoDmg && <div>伤害 {autoDmg}</div>}
        {autoBlock && <div>格挡 {autoBlock}</div>}
        {autoWound && <div>内伤 +{autoWound}</div>}
        {def.autoEffect.draw && def.autoEffect.draw > 0 && <div>抽 {def.autoEffect.draw} 张</div>}
        {def.autoEffect.detonate && def.autoEffect.detonate > 0 && <div>引爆 ×{def.autoEffect.detonate}</div>}
        {!autoDmg && !autoBlock && !autoWound && !def.autoEffect.draw && !def.autoEffect.detonate && <div>（特殊效果）</div>}
      </div>
    </div>
  );
};

function formatManual(def: ReturnType<typeof getCardDef>): string {
  const parts: string[] = [];
  if (def.manualEffect.damage) parts.push(`伤害 ${def.manualEffect.damage}`);
  if (def.manualEffect.block) parts.push(`格挡 ${def.manualEffect.block}`);
  if (def.manualEffect.draw) parts.push(`抽 ${def.manualEffect.draw} 张`);
  if (def.manualEffect.wound) parts.push(`内伤 +${def.manualEffect.wound}`);
  return parts.join(' | ') || '（特殊效果）';
}

function formatAutoValue(base: number, handSize: number, multiplier: number, key: string, defId: string): number | string {
  if (base === 0) {
    if (key === 'block' && defId === 'meditation') return Math.floor(handSize * multiplier);
    return '';
  }
  return Math.floor(base * handSize * multiplier);
}
