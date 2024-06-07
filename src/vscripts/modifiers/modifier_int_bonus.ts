import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

class ModifierIntBonus extends BaseModifier {
    // Declare functions
    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.STATS_INTELLECT_BONUS];
    }

    IsHidden(): boolean {
        return false;
    }

    GetModifierBonusStats_Intellect(): number {
        return this.GetAbility()?.GetSpecialValueFor("int_bonus") || 0;
    }

    GetName(): string {
        return "Intelligence Bonus";
    }
}

@registerModifier()
export class modifier_int_bonus extends ModifierIntBonus {}
