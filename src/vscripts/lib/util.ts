export function isSpecialAbility(abilityName: string): boolean {
    return abilityName.includes("special_bonus");
}

export function HasHiddenAbility(abilityBehaviourString: string): boolean {
    return (
        abilityBehaviourString.includes("DOTA_ABILITY_BEHAVIOR_HIDDEN") ||
        abilityBehaviourString.includes(
            "DOTA_ABILITY_BEHAVIOR_SHOW_IN_GUIDES"
        ) ||
        abilityBehaviourString.includes(
            "DOTA_ABILITY_BEHAVIOR_SKIP_FOR_KEYBINDS"
        )
    );
}

export function IsMaxLevelOne(abilityMaxLevel: number): boolean {
    return abilityMaxLevel === 1;
}

export function HasInateAbility(abilityBehaviourString: string): boolean {
    return abilityBehaviourString.includes("DOTA_ABILITY_BEHAVIOR_INNATE_UI");
}

export function HasInateTag(abilityTags: AnyNotNil[]): boolean {
    let hasInnateFlag: boolean = false;
    abilityTags.forEach((tag) => {
        if (typeof tag === "string" && tag.includes("Innate")) {
            hasInnateFlag = true;
        }
    });
    return hasInnateFlag;
}

export function IsNotLearnableAbility(abilityBehaviourString: string): boolean {
    return abilityBehaviourString.includes(
        "DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE"
    );
}

export function IsAttributeTypeAbility(
    abilityBehaviourString: string
): boolean {
    return abilityBehaviourString.includes("DOTA_ABILITY_TYPE_ATTRIBUTES");
}

export const abilityNamesToIgnore: string[] = [
    "undying_zombie_master",
    "lich_variant_ice_rite",
    "attribute_bonus",
    "treant_lifebomb_explode",
    "warlock_imp_explode_major",
    "abaddon_soul_suck",
];
