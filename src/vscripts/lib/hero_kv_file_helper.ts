export interface DebugParameters {
    abilities: AbilityInformation[];
}

const abilitiesTypes: AbilityTypes[] = [
    AbilityTypes.ULTIMATE,
    AbilityTypes.HIDDEN, // Passive
    AbilityTypes.BASIC,
];

interface FacetAbility {
    facetName: string;
    facetAbilities: string[];
}

export const hero_kv_getHeroKVFile = (heroName: string) => {
    const file = LoadKeyValues("scripts/npc/heroes/" + heroName + ".txt");
    return file;
};

const nonDotaHeros: string[] = [
    "npc_dota_hero_base",
    "Version",
    "npc_dota_hero_target_dummy",
];

const IsDotaHero = (heroName: string): boolean => {
    return !nonDotaHeros.includes(heroName);
};

const IsAbiltiyDraftAbilities = (value: string): boolean => {
    return value === "AbilityDraftAbilities";
};

export const IsUltimate = (abilityName: string): boolean => {
    const abilityKV = GetAbilityKeyValuesByName(abilityName);
    let isUltimate = false;
    Object.entries(abilityKV).forEach(([key, value]) => {
        if (key === "AbilityType") {
            const valueString = value as string;
            if (valueString.includes("DOTA_ABILITY_TYPE_ULTIMATE")) {
                isUltimate = true;
            }
            return;
        }
    });
    return isUltimate;
};

export const IsPassive = (abilityName: string): boolean => {
    const abilityKV = GetAbilityKeyValuesByName(abilityName);
    let isPassive = false;
    Object.entries(abilityKV).forEach(([key, value]) => {
        if (key === "AbilityBehavior") {
            const valueString = value as string;
            if (valueString.includes("DOTA_ABILITY_BEHAVIOR_PASSIVE")) {
                isPassive = true;
            }
            return;
        }
    });
    return isPassive;
};

export const isBasic = (abilityName: string): boolean => {
    const abilityKV = GetAbilityKeyValuesByName(abilityName);
    let isBasic = false;
    Object.entries(abilityKV).forEach(([key, value]) => {
        if (key === "AbilityType") {
            const valueString = value as string;
            if (valueString.includes("DOTA_ABILITY_TYPE_BASIC")) {
                isBasic = true;
            }
            return;
        }
    });
    return isBasic;
};

export const getDotaHeroes = (
    heroList: string[] | undefined
): { [hero: string]: object } => {
    const npcHerosFileKV = LoadKeyValues("scripts/npc/npc_heroes.txt");
    const heroEntries: { [hero: string]: object } = {};
    Object.entries(npcHerosFileKV).forEach(([heroName, heroValues]) => {
        const containsHero: boolean = heroList?.includes(heroName)
            ? true
            : false;

        if (!IsDotaHero(heroName) || containsHero) {
            return;
        }
        heroEntries[heroName] = heroValues;
    });
    return heroEntries;
};

export const getAbilityDraftKV = (
    heroList: string[] | undefined
): { [key: string]: object } => {
    const heroEntries = getDotaHeroes(heroList);

    const abilityEntries: { [key: string]: object } = {};
    Object.entries(heroEntries).forEach(([heroName, heroValues]) => {
        Object.entries(heroValues).forEach(
            ([heroAttribute, heroAttributeValue]) => {
                if (IsAbiltiyDraftAbilities(heroAttribute)) {
                    abilityEntries[heroName] = heroAttributeValue;
                }
            }
        );
    });
    return abilityEntries;
};

const handleFacetAdd = (
    facetAbilities: FacetAbility[],
    facetName: string,
    facetAbility?: string
) => {
    const facet = facetAbilities.find((x) => x.facetName === facetName);
    if (facet === undefined) {
        if (facetAbility) {
            facetAbilities.push({ facetName, facetAbilities: [facetAbility] });
        } else {
            facetAbilities.push({ facetName, facetAbilities: [] });
        }
    }
    if (facet !== undefined) {
        if (facetAbility !== undefined) {
            facet.facetAbilities?.push(facetAbility);
        }
    }
};

export const getFacetInformation = (
    heroList: string[] | undefined
): FacetAbility[] => {
    const facets = getFacets(undefined);
    const facetAbilities: FacetAbility[] = [];
    Object.entries(facets).forEach(([facetName, facetValues]) => {
        handleFacetAdd(facetAbilities, facetName);
        Object.entries(facetValues).forEach(([facetKey, facetValue]) => {
            if (facetKey === "Abilities") {
                Object.values(facetValue as any).forEach((abilityNumber) => {
                    Object.entries(abilityNumber as object).forEach(
                        ([abilityName, abilityValue]) => {
                            handleFacetAdd(
                                facetAbilities,
                                facetName,
                                abilityValue as string
                            );
                        }
                    );
                });
            }
        });
    });
    return facetAbilities;
};

export const getFacets = (
    heroList: string[] | undefined
): { [facet: string]: object } => {
    const facets: { [facet: string]: object } = {};
    const heroEntries = getDotaHeroes(heroList);
    Object.entries(heroEntries).forEach(([heroName, heroValues]) => {
        Object.entries(heroValues).forEach(
            ([heroAttribute, heroAttributeValue]) => {
                if (heroAttribute === "Facets") {
                    Object.entries(heroAttributeValue).forEach(
                        ([facetName, facetValue]) => {
                            facets[facetName as string] = facetValue as object;
                        }
                    );
                }
            }
        );
    });
    return facets;
};

export const getAbilityDraftAbilities = (
    heroList?: string[]
): AbilityInformation[] => {
    const result: AbilityInformation[] = [];
    const abilityEntries = getAbilityDraftKV(heroList);
    Object.entries(abilityEntries).forEach(
        ([dotaHeroAbilityDraftName, abilityDraftAbilities]) => {
            Object.values(abilityDraftAbilities).forEach(
                (abilityName, index) => {
                    processAbilityNames(
                        abilityName as string,
                        index,
                        dotaHeroAbilityDraftName,
                        result
                    );
                }
            );
        }
    );
    return result;
};

function processAbilityName(
    abilityName: string,
    index: number,
    heroName: string,
    result: AbilityInformation[]
) {
    if (
        abilitiesTypes.includes(AbilityTypes.ULTIMATE) &&
        IsUltimate(abilityName)
    ) {
        result.push({
            abilityName,
            abilityNumber: index,
            heroName,
            abilityType: AbilityTypes.ULTIMATE,
        });
        return;
    }

    if (
        abilitiesTypes.includes(AbilityTypes.HIDDEN) &&
        IsPassive(abilityName)
    ) {
        result.push({
            abilityName,
            abilityNumber: index,
            heroName,
            abilityType: AbilityTypes.HIDDEN,
        });
        return;
    }

    if (abilitiesTypes.includes(AbilityTypes.BASIC) && isBasic(abilityName)) {
        result.push({
            abilityName,
            abilityNumber: index,
            heroName,
            abilityType: AbilityTypes.BASIC,
        });
        return;
    }
}

function processAbilityNames(
    abilityNameString: string,
    index: number,
    heroName: string,
    result: any[]
) {
    if (abilityNameString.includes(",")) {
        const abilityNames = abilityNameString.split(",");
        abilityNames.forEach((name) =>
            processAbilityName(name.trim(), index, heroName, result)
        );
    } else {
        processAbilityName(abilityNameString, index, heroName, result);
    }
}

export const hero_kv_readAllHeroFiles = (
    heroList: string[]
): DebugParameters => {
    // Row length is 20

    // 1 row ults, 2 row passives, 4 row basics, 2 row innates, 1 row neutrals (TODO)

    const abilityDraftAbilities = getAbilityDraftAbilities(heroList);
    const rowLength = 20;
    const abilityTotalCount = rowLength * 8;
    //const abilityTotalCount = 150;
    const abilities: AbilityInformation[] = [];

    const ultimates = abilityDraftAbilities
        .filter((x) => x.abilityType === AbilityTypes.ULTIMATE)
        .slice(0, rowLength - 1);
    abilities.push(...ultimates);
    const passives = abilityDraftAbilities
        .filter((x) => x.abilityType === AbilityTypes.HIDDEN)
        .slice(0, rowLength * 2 - 1);
    abilities.push(...passives);
    const basics = abilityDraftAbilities
        .filter((x) => x.abilityType === AbilityTypes.BASIC)
        .slice(0, rowLength * 4 - 1);
    abilities.push(...basics);
    const innates = GetInnateAbilities().slice(0, rowLength * 2 - 1);
    abilities.push(...innates);
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
        shuffledAbilities
    );

    return { abilities: shuffledAbilities };
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

export const GetInnateAbilities = (): AbilityInformation[] => {
    const innateAbilities: AbilityInformation[] = [];
    const heroList = LoadKeyValues("scripts/npc/hero_list.txt");
    let value: string | undefined = undefined;
    Object.keys(heroList).forEach((hero) => {
        const heroKvFile = LoadKeyValues("scripts/npc/heroes/" + hero + ".txt");
        Object.entries(heroKvFile).forEach(([key, value]) => {
            if (key === "Version") return;
            Object.entries(value as any).forEach(
                ([abilityKey, abilityValue]) => {
                    if (abilityKey === "Innate") {
                        innateAbilities.push({
                            abilityName: key,
                            abilityNumber: 0,
                            abilityType: AbilityTypes.INNATE,
                            heroName: hero,
                        });
                    }
                }
            );
        });
    });
    const innatesHerosCustom = LoadKeyValues(
        "scripts/npc/npc_innate_heroes_custom.txt"
    );
    Object.entries(innatesHerosCustom).forEach(([hero, ability]) => {
        if (innateAbilities.some((x) => x.heroName === hero)) {
            return;
        }
        innateAbilities.push({
            abilityName: ability as string,
            abilityNumber: 0,
            abilityType: AbilityTypes.INNATE,
            heroName: hero,
        });
    });
    return innateAbilities;
};
