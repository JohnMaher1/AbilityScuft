import { BaseItem, registerAbility } from "../lib/dota_ts_adapter";
import { ModifierLuaType, ModifierType } from "../models/modifier.types";

LinkLuaModifier(
    "modifier_strength_bonus" as ModifierType,
    "modifiers/modifier_strength_bonus.lua" as ModifierLuaType,
    LuaModifierMotionType.NONE
);

LinkLuaModifier(
    "modifier_int_bonus" as ModifierType,
    "modifiers/modifier_int_bonus.lua" as ModifierLuaType,
    LuaModifierMotionType.NONE
);

@registerAbility()
export class item_blues_balls extends BaseItem {
    private hasInitialized: boolean = false;
    private hasNutted: boolean = false;

    // OnInventoryContentsChanged(): void {
    //     print("OnInventoryContentsChanged");
    //     if (this.hasInitialized) return;
    //     this.hasInitialized = true;
    //     const caster = this.GetCaster();
    //     caster.AddNewModifier(
    //         caster,
    //         this,
    //         "modifier_strength_bonus" as ModifierType,
    //         undefined
    //     );
    // }

    OnSpellStart(): void {
        this.hasNutted = true;
        const caster = this.GetCaster();
        caster.RemoveModifierByName("modifier_strength_bonus" as ModifierType);
        caster.AddNewModifier(
            caster,
            this,
            "modifier_int_bonus" as ModifierType,
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
            caster.RemoveModifierByName("modifier_int_bonus" as ModifierType);
            caster.AddNewModifier(
                caster,
                this,
                "modifier_strength_bonus" as ModifierType,
                undefined
            );
            this.hasNutted = false;
        });
    }

    GetAbilityTextureName(): string {
        if (this.hasNutted) {
            return "post_nut";
        } else {
            return "blues_balls";
        }
    }
}
