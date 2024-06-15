import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

class ModifierTheBalancer extends BaseModifier {
    // Declare functions
    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ON_ABILITY_FULLY_CAST,
            ModifierFunction.ON_ABILITY_START,
            ModifierFunction.MOVESPEED_BONUS_CONSTANT,
        ];
    }

    IsHexDebuff(): boolean {
        return true;
    }

    GetName(): string {
        return "The Balancer";
    }
}

@registerModifier()
export class modifier_the_balancer extends ModifierTheBalancer {}
