import { describe, it, expect } from 'vitest';
import { RelicEngine } from '../RelicEngine';
import type { RelicDef } from '../../types';

describe('RelicEngine', () => {
  const ironBody: RelicDef = {
    id: 'iron_body',
    name: '铁布衫',
    rarity: 'basic',
    triggerType: 'end_turn',
    condition: { handSize_gte: 5 },
    effect: { block: 3 },
    description: '',
  };
  const bloodRage: RelicDef = {
    id: 'blood_rage',
    name: '血怒',
    rarity: 'master',
    triggerType: 'low_hp',
    condition: { hp_pct_lte: 30 },
    effect: { multiplier: 1.5 },
    description: '',
  };
  const noCondition: RelicDef = {
    id: 'berserk',
    name: '狂战诀',
    rarity: 'basic',
    triggerType: 'auto_left',
    effect: { damage: 2 },
    description: '',
  };

  it('triggers when condition met', () => {
    const engine = new RelicEngine([ironBody]);
    const result = engine.checkTriggers('end_turn', {
      handSize: 5,
      hpPct: 100,
      blockTotal: 0,
      cardPosition: -1,
    });
    expect(result).toHaveLength(1);
    expect(result[0].block).toBe(3);
  });

  it('does NOT trigger when condition not met', () => {
    const engine = new RelicEngine([ironBody]);
    const result = engine.checkTriggers('end_turn', {
      handSize: 3,
      hpPct: 100,
      blockTotal: 0,
      cardPosition: -1,
    });
    expect(result).toHaveLength(0);
  });

  it('triggers multiple matching relics', () => {
    const engine = new RelicEngine([ironBody, bloodRage, noCondition]);
    const lowHp = engine.checkTriggers('low_hp', {
      handSize: 5,
      hpPct: 25,
      blockTotal: 0,
      cardPosition: -1,
    });
    expect(lowHp).toHaveLength(1);
    expect(lowHp[0].multiplier).toBe(1.5);
  });

  it('no condition = always triggers for matching triggerType', () => {
    const engine = new RelicEngine([noCondition]);
    const result = engine.checkTriggers('auto_left', {
      handSize: 1,
      hpPct: 50,
      blockTotal: 0,
      cardPosition: 0,
    });
    expect(result).toHaveLength(1);
  });

  it('returns empty for empty relics', () => {
    const engine = new RelicEngine([]);
    expect(
      engine.checkTriggers('end_turn', {
        handSize: 5,
        hpPct: 100,
        blockTotal: 0,
        cardPosition: -1,
      }),
    ).toHaveLength(0);
  });
});
