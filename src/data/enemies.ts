import type { EnemyState } from '../types';

export interface EnemyTemplate {
  id: string;
  name: string;
  maxHp: number;
  behaviors: EnemyBehavior[];
}

export interface EnemyBehavior {
  type: 'attack' | 'defend' | 'attack_wound';
  value: number;
}

const templates: Record<string, EnemyTemplate> = {
  bandit: {
    id: 'bandit',
    name: '山贼',
    maxHp: 20,
    behaviors: [{ type: 'attack', value: 5 }],
  },
  viper: {
    id: 'viper',
    name: '毒蛇',
    maxHp: 12,
    behaviors: [{ type: 'attack_wound', value: 3 }],
  },
  heavy_guard: {
    id: 'heavy_guard',
    name: '重甲兵',
    maxHp: 30,
    behaviors: [
      { type: 'defend', value: 0 },
      { type: 'attack', value: 8 },
    ],
  },
  assassin: {
    id: 'assassin',
    name: '刺客',
    maxHp: 8,
    behaviors: [{ type: 'attack', value: 4 }],
  },
  warlock: {
    id: 'warlock',
    name: '邪道术士',
    maxHp: 18,
    behaviors: [
      { type: 'defend', value: 0 },
      { type: 'attack', value: 10 },
    ],
  },
};

export function createEnemy(templateId: string, instanceNum?: number): EnemyState {
  const t = templates[templateId];
  if (!t) throw new Error(`Unknown enemy template: ${templateId}`);
  return {
    id: instanceNum ? `${t.id}_${instanceNum}` : t.id,
    name: t.name,
    maxHp: t.maxHp,
    currentHp: t.maxHp,
    block: 0,
    wound: 0,
    intent: resolveIntent(t, 0),
  };
}

export function resolveIntent(
  template: EnemyTemplate,
  turnInCycle: number,
): EnemyState['intent'] {
  const idx = turnInCycle % template.behaviors.length;
  const b = template.behaviors[idx];
  switch (b.type) {
    case 'attack':
      return { type: 'attack', value: b.value };
    case 'attack_wound':
      return { type: 'attack', value: b.value };
    case 'defend':
      return { type: 'defend', value: 3 };
  }
}

export function getDefaultBattle(): { templateId: string; instanceNum: number }[] {
  return [{ templateId: 'bandit', instanceNum: 1 }];
}
