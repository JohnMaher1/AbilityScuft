import { BaseItem, registerAbility } from "../lib/dota_ts_adapter";
import { ModifierLuaType, ModifierType } from "../models/modifier.types";

LinkLuaModifier(
    "modifier_the_balancer" as ModifierType,
    "modifiers/modifier_the_balancer.lua" as ModifierLuaType,
    LuaModifierMotionType.NONE
);

@registerAbility("item_the_balancer")
export class item_the_balancer extends BaseItem {
    GetAbilityTextureName(): string {
        return "the_balancer";
    }

    OnSpellStart(): void {
        const caster = this.GetCaster();
        // Get the target
        const target = this.GetCursorTarget();
        // Give the target hex for 20 seconds
        if (target === undefined) return;
        target?.AddNewModifier(
            caster,
            this,
            "modifier_the_balancer" as ModifierType,
            {
                duration: 20,
            }
        );
        target?.AddNewModifier(
            this.GetCaster(),
            this,
            "modifier_sheepstick_debuff",
            { duration: 20 }
        );
        // Add break
        target?.AddNewModifier(
            this.GetCaster(),
            this,
            "modifier_silver_edge_debuff",
            { duration: 20 }
        );
        const targetMoveSpeed = target.GetBaseMoveSpeed();
        target.SetBaseMoveSpeed(0);
        Timers.CreateTimer(0.1, () => {
            // Remove the item
            this.Destroy();
        });
        Timers.CreateTimer(20, () => {
            target.SetBaseMoveSpeed(targetMoveSpeed);
        });
    }
}
