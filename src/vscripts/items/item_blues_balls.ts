import { BaseItem, registerAbility } from "../lib/dota_ts_adapter";
import { ModifierLuaType, ModifierType } from "../models/modifier.types";

LinkLuaModifier(
    "modifier_strength_bonus" as ModifierType,
    "modifiers/modifier_strength_bonus.lua" as ModifierLuaType,
    LuaModifierMotionType.NONE
);

LinkLuaModifier(
    "modifier_post_nut_clarity" as ModifierType,
    "modifiers/modifier_post_nut_clarity.lua" as ModifierLuaType,
    LuaModifierMotionType.NONE
);

@registerAbility("item_blues_balls")
export class item_blues_balls extends BaseItem {
    // GetIntrinsicModifierName(): string {
    //     return "modifier_strength_bonus" as ModifierType;
    // }

    GetAbilityTextureName(): string {
        if (
            this.GetCaster().HasModifier(
                "modifier_post_nut_clarity" as ModifierType
            )
        ) {
            return "post_nut";
        }
        return "blues_balls";
    }

    OnSpellStart(): void {
        const caster = this.GetCaster();
        caster.AddNewModifier(
            caster,
            this,
            "modifier_post_nut_clarity" as ModifierType,
            undefined
        );
        caster.AddNewModifier(
            caster,
            this,
            "modifier_disarmed" as ModifierType,
            undefined
        );

        Timers.CreateTimer(5, () => {
            caster.RemoveModifierByName("modifier_disarmed" as ModifierType);
            return;
        });
        Timers.CreateTimer(15, () => {
            caster.RemoveModifierByName(
                "modifier_post_nut_clarity" as ModifierType
            );
            caster.SetMana(caster.GetMaxMana());
        });
    }
}
