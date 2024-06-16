export function PrecacheResources(this: void, context: CScriptPrecacheContext) {
    const loadPrefabs = IsInToolsMode() ? false : true;

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
    const heroList = LoadKeyValues("scripts/npc/hero_list.txt");
    const heroNames = Object.keys(heroList);
    const particleList = LoadKeyValues("scripts/particles/hero_particles.txt");
    const particleNames = Object.keys(particleList);
    // Particle Effects
    for (const key of particleNames) {
        const keyCopy = key.substring(0, key.length - 2);
        PrecacheResource(
            "particle",
            `particles/units/heroes/${keyCopy}`,
            context
        );
    }
    // Hero Sounds
    for (const key of heroNames) {
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
