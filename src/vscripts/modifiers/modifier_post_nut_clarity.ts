import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

class ModifierPostNutClarity extends BaseModifier {
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

    GetTexture(): string {
        return "blues_balls";
    }
}

@registerModifier()
export class modifier_post_nut_clarity extends ModifierPostNutClarity {}
