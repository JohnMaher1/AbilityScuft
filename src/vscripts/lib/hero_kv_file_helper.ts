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

export const hero_kv_readAllHeroFiles = (
    heroList: string[]
): DebugParameters => {
    const abilities: AbilityInformation[] = [];

    const abilityTotalCount = 18 * 7;
    const heroListLength = heroList.length;
    const abilitiesAdded: string[] = [];

    for (let i = 0; i < heroListLength; i++) {
        const random = Math.floor(Math.random() * heroListLength);
        const key = heroList[random];
        const file = LoadKeyValues("scripts/npc/heroes/" + key + ".txt");
        print("Reading hero file: " + key + ".txt");
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

                if (canAddAbility && !abilitiesAdded.includes(abilityName)) {
                    abilities.push({
                        abilityName: abilityName,
                        abilityNumber: 1,
                        heroName: key,
                    });
                    abilitiesAdded.push(abilityName);
                }
            }
        });
    }

    // Shuffle items in the abilities array
    let shuffledAbilities: AbilityInformation[] = shuffle(abilities);

    // Make a copy of the array that includes the first 90 elements
    shuffledAbilities.splice(abilityTotalCount);
    shuffledAbilities.sort((a, b) => {
        if (a.heroName < b.heroName) {
            return -1;
        }
        if (a.heroName > b.heroName) {
            return 1;
        }
        return 0;
    });

    const abilityNames = shuffledAbilities.flatMap(
        (ability) => ability.abilityName
    );
    CustomGameEventManager.Send_ServerToAllClients(
        "on_abilities_load",
        abilityNames
    );
    return { abilityNames: abilityNames };
};

const shuffle = (array: AbilityInformation[]): AbilityInformation[] => {
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
