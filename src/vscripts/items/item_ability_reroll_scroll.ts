import { GameRulesState } from "../gamemodeadditions/functions/game_rules_state";
import { BaseItem, registerAbility } from "../lib/dota_ts_adapter";

@registerAbility("item_ability_reroll_scroll")
export class item_ability_reroll_scroll extends BaseItem {
    abilityCount: number = 18;
    OnSpellStart(): void {
        const player = this.GetCaster().GetPlayerOwner();
        CustomGameEventManager.Send_ServerToPlayer(
            player,
            "on_ability_reroll",
            {
                abilities: this.getRandomAbilities(),
                existingAbilities:
                    GameRulesState.getInstance().getPlayerAbilities(
                        player.GetPlayerID()
                    ),
                playerID: player.GetPlayerID(),
            }
        );
        this.Destroy();
    }

    getRandomAbilities = (): AbilityInformation[] => {
        const abilities = GameRulesState.getInstance()._unselectedAbilities;
        const filteredAbilities = abilities.filter(
            (x) => x.abilityType !== AbilityTypes.INNATE
        );
        const randomAbilities: AbilityInformation[] = [];
        for (let i = 0; i < this.abilityCount; i++) {
            let randomIndex = Math.floor(
                Math.random() * filteredAbilities.length
            );
            let randomAbility = filteredAbilities[randomIndex];
            while (randomAbilities.includes(filteredAbilities[randomIndex])) {
                randomIndex = Math.floor(
                    Math.random() * filteredAbilities.length
                );
                randomAbility = filteredAbilities[randomIndex];
            }
            randomAbilities.push(randomAbility);
        }
        return randomAbilities;
    };
}
