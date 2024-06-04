import { hero_ability_kv_HandleScepterShardUpgrade } from "./ability_kv_helper";
import { hero_kv_getHeroKVFile } from "./hero_kv_file_helper";
import { reloadable } from "./tstl-utils";

interface PlayerAbilityCounts {
    playerID: PlayerID;
    abilityCount: number;
}
@reloadable
export class AbilitySelection {
    playerTurn: PlayerID = 0;
    playerTurnOrder: PlayerID[] = [];
    playerTurnReversed: boolean = false;
    canPickAgain: boolean = false;
    abilityNames: string[] = [];
    maxMockTurns = 40;
    currentMockTurn = 0;
    playerAbilityCounts: PlayerAbilityCounts[] = [];
    forceRandomAbilities: boolean = false;
    allPlayersHaveSelectedAbilities: boolean = false;
    onAbilitySelectionComplete: () => void;
    constructor(
        abilityNames: string[],
        onAbilitySelectionComplete: () => void,
        forceRandomAbilities: boolean
    ) {
        this.abilityNames = abilityNames;
        this.onAbilitySelectionComplete = onAbilitySelectionComplete;
        this.forceRandomAbilities = forceRandomAbilities;
    }

    init() {
        print("Ability Selection initialized");
        this.playerTurn = 0;
        this.playerTurnOrder = [];
        this.playerTurnReversed = false;
        this.createPlayerTurnOrder();
        this.registerAbilityClick();
        this.removeAllAbilitiesFromPlayers();
    }
    removeAllAbilitiesFromPlayers() {
        for (let i = 0; i < DOTA_MAX_TEAM_PLAYERS; i++) {
            const playerID = i;

            if (PlayerResource.IsValidPlayerID(playerID)) {
                const hero =
                    PlayerResource.GetPlayer(playerID)?.GetAssignedHero();
                if (!hero) {
                    continue;
                }
                const abilityCount = hero.GetAbilityCount();
                for (let i = 0; i < abilityCount; i++) {
                    const ability = hero?.GetAbilityByIndex(i);
                    if (ability?.GetAbilityName()) {
                        if (this.isBaseAbility(ability)) {
                            hero?.RemoveAbility(ability.GetAbilityName());
                        }
                    }
                }
            }
        }
    }

    getInstance() {
        return this;
    }

    registerAbilityClick = () => {
        if (this.forceRandomAbilities) {
            return;
        }

        CustomGameEventManager.RegisterListener(
            "on_ability_clicked",
            (_, data) => {
                this.handlePlayerAbilityClicked(data.player, data.abilityName);
            }
        );
    };

    handlePlayerAbilityCount(playerID: PlayerID) {
        const playerAbilityCount = this.playerAbilityCounts.find(
            (playerAbilityCount) => playerAbilityCount.playerID === playerID
        );
        if (playerAbilityCount) {
            playerAbilityCount.abilityCount++;
        } else {
            this.playerAbilityCounts.push({
                playerID: playerID,
                abilityCount: 1,
            });
        }
    }

    onAddAbilityToPlayer(playerID: PlayerID, abilityName: string) {
        // Check if ability has a scepter upgrade
        hero_ability_kv_HandleScepterShardUpgrade(playerID, abilityName);
    }

    handlePlayerAbilityClicked(playerID: PlayerID, abilityName: string) {
        if (playerID === this.playerTurn) {
            // Assign ability to player
            const player = PlayerResource.GetPlayer(playerID)!;
            const playerHero = player.GetAssignedHero();
            const playerAbilityCount = this.playerAbilityCounts.find(
                (x) => x.playerID === playerID
            );
            if (!playerAbilityCount) {
                //playerHero.AddAbility(abilityName);
                this.onAddAbilityToPlayer(playerID, "shadow_shaman_shackles");
            }
            if (playerAbilityCount && playerAbilityCount.abilityCount < 4) {
                this.onAddAbilityToPlayer(playerID, abilityName);
            }

            this.handlePlayerAbilityCount(playerID);
            // Get position of ability
            let abilityPosition = 1;
            for (let i = 0; i < 4; i++) {
                if (!playerHero.GetAbilityByIndex(i)) {
                    abilityPosition = i + 1;
                    break;
                }
            }

            CustomGameEventManager.Send_ServerToAllClients(
                "on_player_ability_select",
                {
                    playerID: playerID,
                    abilityName: abilityName,
                    abilityPosition: abilityPosition as 1 | 2 | 3 | 4,
                }
            );

            switch (true) {
                // Last player is normal order
                case !this.playerTurnReversed &&
                    this.playerTurn ===
                        this.playerTurnOrder[this.playerTurnOrder.length - 1]:
                    if (this.canPickAgain === false) {
                        this.canPickAgain = true;
                    } else {
                        this.playerTurnOrder = this.playerTurnOrder.reverse();
                        this.playerTurnReversed = !this.playerTurnReversed;
                        this.setPlayerTurn();
                    }
                    break;

                // First player in ascending order
                case this.playerTurnReversed &&
                    this.playerTurn ===
                        this.playerTurnOrder[this.playerTurnOrder.length - 1]:
                    if (this.canPickAgain === false) {
                        this.canPickAgain = true;
                    } else {
                        this.playerTurnOrder = this.playerTurnOrder.reverse();
                        this.playerTurnReversed = !this.playerTurnReversed;
                        this.setPlayerTurn();
                    }
                    break;
                // Default case (next player in turn order)
                default:
                    this.canPickAgain = false;
                    this.setPlayerTurn();
                    break;
            }

            // Dispatch an event to the UI to display the player turn order
            CustomGameEventManager.Send_ServerToAllClients("on_turn_change", {
                playerTurnID: this.playerTurn,
            });
        } else {
            //print("Not this player's turn. The turn is now: ", this.playerTurn);
            // TODO - Send a message to the player that it's not their turn
        }
    }

    setPlayerTurn() {
        if (this.allPlayersHaveSelectedAbilities) {
            return;
        }
        this.playerTurn =
            this.playerTurnOrder[
                (this.playerTurnOrder.indexOf(this.playerTurn) + 1) %
                    this.playerTurnOrder.length
            ];

        // Check if all players have selected 4 abilities

        const playerAbilityCountLength = this.playerAbilityCounts.length;
        if (playerAbilityCountLength === PlayerResource.GetPlayerCount()) {
            if (
                this.playerAbilityCounts.every(
                    (playerAbilityCount) => playerAbilityCount.abilityCount >= 4
                )
            ) {
                this.allPlayersHaveSelectedAbilities = true;
            }
        }

        if (this.allPlayersHaveSelectedAbilities) {
            Timers.CreateTimer(IsInToolsMode() ? 1 : 10, () => {
                CustomGameEventManager.Send_ServerToAllClients(
                    "on_ability_pick_phase_completed",
                    {} as never
                );
                this.onAbilitySelectionComplete();
            });
        }
    }

    mockPick() {
        print("Mock Pick");
        if (
            this.currentMockTurn > this.maxMockTurns ||
            this.allPlayersHaveSelectedAbilities === true
        ) {
            return;
        }

        const randomAbility =
            this.abilityNames[
                Math.floor(Math.random() * this.abilityNames.length)
            ];
        this.handlePlayerAbilityClicked(this.playerTurn, randomAbility);
        this.currentMockTurn++;
    }

    createPlayerTurnOrder() {
        // Get All Players
        let players: PlayerID[] = [];
        for (let i = 0; i < DOTA_MAX_TEAM_PLAYERS; i++) {
            const playerID = i;
            if (PlayerResource.IsValidPlayerID(playerID)) {
                players.push(playerID);
            }
        }

        const playersByTeam = players.reduce((acc, playerID) => {
            const team = PlayerResource.GetTeam(playerID);
            if (acc[team]) {
                acc[team].push(playerID);
            } else {
                acc[team] = [playerID];
            }
            return acc;
        }, {} as Record<DotaTeam, PlayerID[]>);

        let goodGuysIndex = 0;
        let badGuysIndex = 0;
        const goodGuysLength = playersByTeam[DotaTeam.GOODGUYS]?.length ?? 0;
        const badGuysLength = playersByTeam[DotaTeam.BADGUYS]?.length ?? 0;
        while (goodGuysIndex < goodGuysLength || badGuysIndex < badGuysLength) {
            if (goodGuysIndex < goodGuysLength) {
                this.playerTurnOrder.push(
                    playersByTeam[DotaTeam.GOODGUYS][goodGuysIndex]
                );
                goodGuysIndex++;
            }
            if (badGuysIndex < badGuysLength) {
                this.playerTurnOrder.push(
                    playersByTeam[DotaTeam.BADGUYS][badGuysIndex]
                );
                badGuysIndex++;
            }
        }
        // Dispatch an event to the UI to display the player turn order
        CustomGameEventManager.Send_ServerToAllClients("on_turn_change", {
            playerTurnID: this.playerTurn,
        });
    }

    private isBaseAbility(ability: CDOTABaseAbility) {
        const abilityBehavior = ability.GetBehavior();
        return (
            this.IsBaseAbilityBehavior(abilityBehavior) &&
            this.IsBaseAbilityType(ability.GetAbilityType())
        );
    }

    private IsBaseAbilityBehavior(abilityBehavior: AbilityBehavior | Uint64) {
        return !(
            abilityBehavior === AbilityBehavior.HIDDEN ||
            abilityBehavior === AbilityBehavior.NOT_LEARNABLE ||
            abilityBehavior === AbilityBehavior.INNATE_UI
        );
    }

    private IsBaseAbilityType(abilityType: AbilityTypes) {
        return !(abilityType === AbilityTypes.ATTRIBUTES);
    }
}
