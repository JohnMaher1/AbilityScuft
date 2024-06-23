import { AbilitySelection } from "../../lib/ability_selection";
import { hero_kv_readAllHeroFiles } from "../../lib/hero_kv_file_helper";
import { GameRulesState } from "./game_rules_state";
import { SettingsState } from "./settings_state";

export function addModifierToHeroToPreventMovement() {
    for (let i = 0; i < DOTA_MAX_PLAYERS; i++) {
        const player = PlayerResource.GetPlayer(i as PlayerID);
        if (!player) {
            continue;
        }
        const hero = PlayerResource.GetSelectedHeroEntity(i as PlayerID);
        hero?.AddNewModifier(hero, undefined, "modifier_panic", {
            duration: 50000,
        });
    }
}

export function reloadAndStartGame(): void {
    const debugParameters = hero_kv_readAllHeroFiles(
        GameRulesState.getInstance()._heroList
    );
    print(
        "Starting the game with force abilities set to: ",
        SettingsState.getInstance().forceRandomAbilities
    );
    GameRulesState.getInstance()._abilitySelection = new AbilitySelection(
        debugParameters.abilities,
        GameRulesState.getInstance().onAbilityPickPhaseCompleted,
        SettingsState.getInstance().forceRandomAbilities
    );
    GameRulesState.getInstance()._abilitySelection!.init();
}

export function handleBalancerItem(): void {
    // Check game state is in progress
    if (GameRules.State_Get() !== GameState.GAME_IN_PROGRESS) {
        return;
    }
    // Check if one team is ahead in gold by 5000
    let goodGuysNetWorth = 0;
    let badGuysNetWorth = 0;
    const amount = 5000;

    if (GameRulesState.getInstance()._balancerCanGetAdded) {
        const playerCount = PlayerResource.GetPlayerCount();
        let hasAddedBalancer = false;
        for (let i = 0; i < playerCount; i++) {
            const player = PlayerResource.GetPlayer(i as PlayerID);
            if (!player) {
                continue;
            }
            const playerGold = PlayerResource.GetTotalEarnedGold(i as PlayerID);
            if (player.GetTeam() === DotaTeam.GOODGUYS) {
                goodGuysNetWorth += playerGold;
            } else {
                badGuysNetWorth += playerGold;
            }
        }
        if (goodGuysNetWorth - badGuysNetWorth > amount) {
            for (let i = 0; i < playerCount; i++) {
                const player = PlayerResource.GetPlayer(i as PlayerID);
                if (!player) {
                    continue;
                }
                // Check hero is on the losing (badguys team)
                if (player.GetTeam() === DotaTeam.BADGUYS) {
                    const hero = player.GetAssignedHero();
                    hero.AddItemByName("item_the_balancer");
                }
            }
            hasAddedBalancer = true;
            GameRulesState.getInstance()._balancerCanGetAdded = false;
        }
        if (badGuysNetWorth - goodGuysNetWorth > amount) {
            for (let i = 0; i < playerCount; i++) {
                const player = PlayerResource.GetPlayer(i as PlayerID);
                if (!player) {
                    continue;
                }
                if (player.GetTeam() === DotaTeam.GOODGUYS) {
                    const hero = player.GetAssignedHero();
                    hero.AddItemByName("item_the_balancer");
                }
            }
            hasAddedBalancer = true;
            GameRulesState.getInstance()._balancerCanGetAdded = false;
        }
        if (hasAddedBalancer) {
            Timers.CreateTimer(300, () => {
                GameRulesState.getInstance()._balancerCanGetAdded = true;
            });
        }
    }
}
