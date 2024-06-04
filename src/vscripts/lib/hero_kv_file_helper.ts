import {
    HasHiddenAbility,
    HasInateAbility,
    HasInateTag,
    IsAttributeTypeAbility,
    IsGrantedByShardOrScepter,
    IsNotLearnableAbility,
    abilityNamesToIgnore,
    isSpecialAbility,
} from "./util";

export interface DebugParameters {
    abilityNames: string[];
}

export const hero_kv_getHeroKVFile = (heroName: string) => {
    const file = LoadKeyValues("scripts/npc/heroes/" + heroName + ".txt");
    return file;
};

export const hero_kv_readAllHeroFiles = (): DebugParameters => {
    const heroList = LoadKeyValues("scripts/npc/hero_list.txt");
    const abilities: AbilityInformation[] = [];

    const abilityTotalCount = 105;
    const heroEntries = Object.entries(heroList);
    const heroListLength = heroEntries.length;

    for (let i = 0; i < heroListLength; i++) {
        const random = Math.floor(Math.random() * heroListLength);
        const [key, value] = heroEntries[random];

        const file = LoadKeyValues("scripts/npc/heroes/" + key + ".txt");
        Object.entries(file).forEach(([abilityName, abilityValues]) => {
            if (
                typeof abilityValues !== "number" &&
                !isSpecialAbility(abilityName)
            ) {
                let canAddAbility: boolean = true;

                abilityNamesToIgnore.forEach((abilityNameToIgnore) => {
                    if (abilityName.includes(abilityNameToIgnore)) {
                        canAddAbility = false;
                    }
                });

                if (abilityName.includes("attribute_bonus")) {
                    canAddAbility = false;
                }

                Object.entries(abilityValues as any).forEach(
                    ([abilityKey, abilityValue]) => {
                        let abilityValueString = abilityValue as string;
                        if (
                            abilityKey === "AbilityBehavior" &&
                            (HasHiddenAbility(abilityValueString) ||
                                HasInateAbility(abilityValueString) ||
                                IsNotLearnableAbility(abilityValueString) ||
                                IsAttributeTypeAbility(abilityValueString))
                        ) {
                            canAddAbility = false;
                        }

                        if (IsGrantedByShardOrScepter(abilityKey as string)) {
                            canAddAbility = false;
                        }

                        if (abilityKey === "MaxLevel") {
                            if (abilityValueString === "1") {
                                canAddAbility = false;
                            }
                        }
                    }
                );

                // Check for innates
                const keys = Object.keys(abilityValues);
                if (HasInateTag(keys)) {
                    canAddAbility = false;
                }

                if (canAddAbility) {
                    abilities.push({
                        abilityName: abilityName,
                        abilityNumber: 1,
                    });
                }
            }
        });
    }

    // Shuffle items in the abilities array
    let shuffledAbilities: string[] = shuffle(
        abilities.flatMap((x) => x.abilityName)
    );
    // Make a copy of the array that includes the first 90 elements
    shuffledAbilities.splice(abilityTotalCount);

    CustomGameEventManager.Send_ServerToAllClients(
        "on_abilities_load",
        shuffledAbilities
    );
    return { abilityNames: shuffledAbilities };
};

const shuffle = (array: string[]): string[] => {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    // Remove duplicates
    const uniqueArray = Array.from(new Set(array));

    return uniqueArray;
};
