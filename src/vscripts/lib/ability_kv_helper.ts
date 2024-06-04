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
                print("key: ", key);
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
        //print("key: ", key, "value: ", value);
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

    /*
    const hasAbilityWithScepterUpgrade =
        hero_ability_kv_HasScepterUpgrade(abilityName);
    const isAbilityWithScepterUpgrade =
        hero_ability_kv_IsScepterUpgrade(abilityName);

    if (hasAbilityWithScepterUpgrade) {
        // Get hero name from ability name
        const hero = PlayerResource.GetPlayer(player)!.GetAssignedHero();
        const heroName = hero_ability_kv_GetHeroFromScepterAbility(
            "juggernaut_omni_slash"
        );
        if (heroName) {
            const heroKVFile = hero_ability_kv_GetHeroKV(heroName);
            print(
                "heroKVFile: ",
                heroKVFile,
                "Hero name: ",
                hero.GetUnitName(),
                "Hero ability name: ",
                heroName
            );
            let scepterAbility: string | undefined = undefined;
            if (heroKVFile !== undefined) {
                print("heroKVFile: ", heroKVFile);
                scepterAbility = hero_ability_kv_GetScepterAbility(heroKVFile);
                if (scepterAbility) {
                    print(
                        "Adding scepter ability to hero: ",
                        hero.GetUnitName(),
                        abilityName,
                        scepterAbility
                    );
                    hero.AddAbility(scepterAbility);
                    // Loop through hero abilities and print the names
                    for (let i = 0; i < hero.GetAbilityCount(); i++) {
                        const ability = hero.GetAbilityByIndex(i);
                        if (ability) {
                            print(
                                "Ability for the: ",
                                ability.GetAbilityName()
                            );
                        }
                    }
                }
            }
        }
        
    }
    */
};

/*

Look into this tomorrow

"HasScepterUpgrade"			"1"
		"AbilityDraftUltScepterAbility"		"juggernaut_swift_slash"
    */
