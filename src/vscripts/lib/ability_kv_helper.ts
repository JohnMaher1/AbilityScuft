import { isSpecialAbility } from "./util";

const HasScepterUpgrade: string = "HasScepterUpgrade";
const IsGrantedByScepter: string = "IsGrantedByScepter";

const hero_ability_kv_GetHeroNameFromAbility = (
    abilityName: string
): object => {
    return GetAbilityKeyValuesByName(abilityName);
};

const hero_ability_kv_GetHeroKV = (heroName: string) => {
    return LoadKeyValues("scripts/npc/heroes/" + heroName + ".txt");
};

const hero_ability_kv_GetHeroFromScepterAbility = (
    abilityNameProp: string
): string | undefined => {
    const heroList = LoadKeyValues("scripts/npc/hero_list.txt");
    let value: string | undefined = undefined;
    Object.keys(heroList).forEach((hero) => {
        const heroKvFile = hero_ability_kv_GetHeroKV(hero);
        Object.keys(heroKvFile).forEach((key) => {
            if (key === abilityNameProp) {
                value = hero;
                return;
            }
        });
    });
    return value;
};

export const hero_ability_kv_IsScepterUpgrade = (abilityName: string) => {
    const heroKvFile = hero_ability_kv_GetHeroNameFromAbility(abilityName);
    let hasScepterUpgrade: boolean = false;
    let isGrantedByScepter: boolean = false;
    Object.entries(heroKvFile).forEach(([key, value]) => {
        if (key === HasScepterUpgrade && value === "1") {
            hasScepterUpgrade = true;
        }
        if (key === IsGrantedByScepter && value === "1") {
            isGrantedByScepter = true;
        }
    });
    return hasScepterUpgrade && isGrantedByScepter;
};

export const hero_ability_kv_GetScepterAbility = (
    heroKVFile: object
): string | undefined => {
    //print("heroKvFile: ", heroKvFile, "Hero name: ", heroName);
    let scepterAbility: string | undefined = undefined;
    Object.entries(heroKVFile).forEach(([abilityName, abilityValues]) => {
        if (
            typeof abilityValues !== "number" &&
            !isSpecialAbility(abilityName)
        ) {
            Object.entries(abilityValues as any).forEach(([abilityKey]) => {
                if (abilityKey === IsGrantedByScepter) {
                    scepterAbility = abilityName;
                    return;
                }
            });
        }
    });
    return scepterAbility;
};

export const hero_ability_kv_HasScepterUpgrade = (abilityName: string) => {
    const heroKvFile = hero_ability_kv_GetHeroNameFromAbility(abilityName);
    let hasScepterUpgrade: boolean = false;
    let isGrantedByScepter: boolean = false;
    Object.entries(heroKvFile).forEach(([key, value]) => {
        if (key === HasScepterUpgrade && value === "1") {
            hasScepterUpgrade = true;
        }
        if (key === IsGrantedByScepter && value === "1") {
            isGrantedByScepter = true;
        }
    });
    return hasScepterUpgrade && !isGrantedByScepter;
};

export const hero_ability_kv_HandleScepterShardUpgrade = (
    player: PlayerID,
    abilityName: string
) => {
    const abilityKV = GetAbilityKeyValuesByName(abilityName);
    const hero = PlayerResource.GetPlayer(player)!.GetAssignedHero();
    // Loop through the ability key values and print them
    for (const [key, value] of Object.entries(abilityKV)) {
        if (
            key === "AbilityDraftUltScepterAbility" ||
            key === "AbilityDraftUltShardAbility"
        ) {
            hero.AddAbility(value);
        }
    }

    hero.AddAbility(abilityName);
};
