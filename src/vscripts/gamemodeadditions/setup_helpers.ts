import LocalNetTables from "../LocalNetTables";
import { GameRulesState } from "./functions/game_rules_state";

function GetHeroList() {
    const heroesList = LoadKeyValues("scripts/npc/npc_heroes.txt");
    const heroes = Object.keys(heroesList).map((key) => {
        return key;
    });
    // Return a random set of 50 heroes
    const randomHeroes: string[] = [];
    while (randomHeroes.length < 50) {
        const randomIndex = Math.floor(Math.random() * heroes.length);
        const randomHero = heroes[randomIndex];
        if (
            !randomHeroes.includes(randomHero) &&
            randomHero !== "npc_dota_hero_base" &&
            randomHero !== "Version"
        ) {
            randomHeroes.push(randomHero);
        }
    }
    GameRulesState.getInstance()._heroList = randomHeroes;
    return randomHeroes;
}

export function CreateCustomNetTables() {
    new LocalNetTables("setup_options");
    CustomNetTables.SetTableValue("setup_options", "allowPassives", {
        value: true,
    });
    CustomNetTables.SetTableValue("setup_options", "forceRandomAbilities", {
        value: false,
    });
}

export function PrecacheResources(this: void, context: CScriptPrecacheContext) {
    //const loadPrefabs = IsInToolsMode() ? false : true;
    const loadPrefabs = true;
    const heroesList = GetHeroList();
    PrecacheResource(
        "particle",
        "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf",
        context
    );
    PrecacheResource(
        "soundfile",
        "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts",
        context
    );
    if (!loadPrefabs) {
        return;
    }
    const particleList = SPAGHETTI LoadKeyValues("scripts/particles/hero_particles.txt");
    const particleNames = Object.keys(particleList);
    // Particle Effects
    for (const key of particleNames) {
        const keyCopy = key.substring(0, key.length - 2);

        // Check if keyCopy is a substring of any element in heroesList
        let found = false;
        const keyCopyHeroName = keyCopy.split("/")[0];
        const nameToSearch = "npc_dota_" + keyCopyHeroName;
        for (const hero of heroesList) {
            if (hero.includes(nameToSearch)) {
                found = true;
                break;
            }
        }

        if (!found) {
            continue;
        }
        PrecacheResource(
            "particle",
            `particles/units/heroes/${keyCopy}`,
            context
        );
    }
    // Hero Sounds
    for (const key of heroesList) {
        const heroName = key.replace("npc_dota_hero_", "");
        const heroSoundName = getHeroToSoundNameMapping(heroName);
        PrecacheResource(
            "soundfile",
            `soundevents/game_sounds_heroes/game_sounds_${heroSoundName}.vsndevts`,
            context
        );
    }
}

const getHeroToSoundNameMapping = (heroName: string): string => {
    switch (heroName) {
        case "night_stalker":
            return "nightstalker";
        case "drow_ranger":
            return "drowranger";
        case "shadow_shaman":
            return "shadowshaman";
        case "skeleton_king":
            return "skeletonking";
        case "crystal_maiden":
            return "crystalmaiden";
        case "witch_doctor":
            return "witchdoctor";
        case "storm_spirit":
            return "stormspirit";
        case "sand_king":
            return "sandking";
        case "doom_bringer":
            return "doombringer";
        default:
            return heroName;
    }
};
