import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import type { BattlePhase, BattleEvent } from '../types';

const PHASE_LABELS: Record<BattlePhase, string> = {
  draw: '抽牌阶段',
  player_turn: '你的回合',
  auto_resolve: '自动结算',
  enemy_turn: '敌人回合',
  victory: '胜利',
  defeat: '败北',
};

interface PhaseBlock {
  phase: BattlePhase;
  events: BattleEvent[];
  label: string;
}

function groupEventsByPhase(events: BattleEvent[]): PhaseBlock[] {
  const blocks: PhaseBlock[] = [];
  let currentPhase: BattlePhase | null = null;
  let currentEvents: BattleEvent[] = [];

  for (const event of events) {
    if (event.type === 'phase_change') {
      if (currentPhase) {
        blocks.push({ phase: currentPhase, events: currentEvents, label: PHASE_LABELS[currentPhase] });
        currentEvents = [];
      }
      currentPhase = event.to;
    }
    currentEvents.push(event);
  }

  if (currentPhase && currentEvents.length > 0) {
    blocks.push({ phase: currentPhase, events: currentEvents, label: PHASE_LABELS[currentPhase] });
  }

  return blocks;
}

function renderEvent(e: BattleEvent, i: number): React.ReactNode {
  switch (e.type) {
    case 'damage':
      return <div key={i}>{e.targetId === 'player' ? '玩家' : '敌人'} 受到 {e.amount} 点伤害</div>;
    case 'block':
      return <div key={i}>{e.targetId === 'player' ? '玩家' : '敌人'} 获得 {e.amount} 点格挡</div>;
    case 'draw':
      return <div key={i}>抽了 {e.count} 张牌</div>;
    case 'card_played':
      return <div key={i}>{e.isAuto ? '自动' : '手动'}打出了一张牌</div>;
    case 'phase_change':
      return <div key={i} style={{ color: '#888' }}>阶段转换: {PHASE_LABELS[e.from]} \u2192 {PHASE_LABELS[e.to]}</div>;
    case 'enemy_defeated':
      return <div key={i} style={{ color: '#e74c3c' }}>敌人被击败！</div>;
    case 'player_defeated':
      return <div key={i} style={{ color: '#e74c3c' }}>玩家被击败！</div>;
    case 'wound_applied':
      return <div key={i}>{e.targetId === 'player' ? '玩家' : '敌人'} 叠加了 {e.amount} 层内伤</div>;
    case 'wound_detonated':
      return <div key={i} style={{ color: '#e74c3c' }}>{e.targetId === 'player' ? '玩家' : '敌人'} 内伤引爆造成 {e.damage} 点伤害</div>;
    default:
      return null;
  }
}

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

  const phaseBlocks = useMemo(() => groupEventsByPhase(events), [events]);

  const [collapsed, setCollapsed] = useState<Set<BattlePhase>>(new Set());
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!didInitRef.current && phaseBlocks.length > 1) {
      const toCollapse = new Set<BattlePhase>();
      phaseBlocks.slice(1).forEach(b => toCollapse.add(b.phase));
      setCollapsed(toCollapse);
      didInitRef.current = true;
    }
  }, [phaseBlocks]);

  const toggleCollapse = (blockPhase: BattlePhase) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(blockPhase)) next.delete(blockPhase);
      else next.add(blockPhase);
      return next;
    });
  };

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
      {/* Phase-foldable battle log */}
      <div style={{
        maxHeight: 180, overflow: 'auto', width: '100%',
        padding: 8, fontSize: 11, color: '#aaa',
        background: '#050505',
        borderRadius: 4,
      }}>
        {phaseBlocks.length === 0 && (
          <div style={{ color: '#555', textAlign: 'center' }}>暂无事件</div>
        )}
        {phaseBlocks.map((block, blockIdx) => {
          const isCollapsed = collapsed.has(block.phase);
          return (
            <div key={blockIdx} style={{ marginBottom: 4 }}>
              <div
                onClick={() => toggleCollapse(block.phase)}
                style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 12,
                  padding: '3px 6px',
                  background: '#111',
                  borderRadius: 3,
                  color: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: 10 }}>{isCollapsed ? '\u25b6' : '\u25bc'}</span>
                <span>{block.label}</span>
                <span style={{ fontSize: 9, color: '#555', marginLeft: 'auto' }}>
                  {block.events.length} 条
                </span>
              </div>
              {!isCollapsed && (
                <div style={{ paddingLeft: 14, paddingTop: 2 }}>
                  {block.events.map((e, i) => renderEvent(e, i))}
                </div>
              )}
            </div>
          );
        })}
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
