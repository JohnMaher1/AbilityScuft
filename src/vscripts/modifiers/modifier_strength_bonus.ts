import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

class ModifierStrengthBonus extends BaseModifier {
    // Declare functions
    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.STATS_STRENGTH_BONUS];
    }

    IsHidden(): boolean {
        return true;
    }

    GetModifierBonusStats_Strength(): number {
        return this.GetAbility()?.GetSpecialValueFor("strength_bonus") || 0;
    }

    GetName(): string {
        return "Strength Bonus";
    }
}

@registerModifier()
export class modifier_strength_bonus extends ModifierStrengthBonus {}
