import type { RelicDef, EffectValues } from '../types';

export interface TriggerContext {
  handSize: number;
  hpPct: number;
  blockTotal: number;
  cardPosition: number;
}

export class RelicEngine {
  constructor(private relics: RelicDef[]) {}

  checkTriggers(
    trigger: RelicDef['triggerType'],
    ctx: TriggerContext,
  ): Partial<EffectValues>[] {
    return this.relics
      .filter(
        r =>
          r.triggerType === trigger && this.checkCondition(r.condition, ctx),
      )
      .map(r => r.effect);
  }

  private checkCondition(
    condition: Record<string, number> | undefined,
    ctx: TriggerContext,
  ): boolean {
    if (!condition) return true;
    for (const [key, threshold] of Object.entries(condition)) {
      switch (key) {
        case 'handSize_gte':
          if (ctx.handSize < threshold) return false;
          break;
        case 'handSize_lte':
          if (ctx.handSize > threshold) return false;
          break;
        case 'hp_pct_lte':
          if (ctx.hpPct > threshold) return false;
          break;
        case 'block_gte':
          if (ctx.blockTotal < threshold) return false;
          break;
      }
    }
    return true;
  }
}
