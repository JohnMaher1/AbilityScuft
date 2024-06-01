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
    constructor(abilityNames: string[]) {
        this.abilityNames = abilityNames;
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
                        hero?.RemoveAbility(ability.GetAbilityName());
                    }
                }
            }
        }
    }

    getInstance() {
        return this;
    }

    registerAbilityClick = () => {
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

    handlePlayerAbilityClicked(playerID: PlayerID, abilityName: string) {
        if (playerID === this.playerTurn) {
            // Assign ability to player
            const player = PlayerResource.GetPlayer(playerID)!;
            const playerHero = player.GetAssignedHero();
            playerHero.AddAbility(abilityName);
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
        this.playerTurn =
            this.playerTurnOrder[
                (this.playerTurnOrder.indexOf(this.playerTurn) + 1) %
                    this.playerTurnOrder.length
            ];

        // Check if all players have selected 4 abilities
        let allPlayersHaveSelectedAbilities = false;

        const playerAbilityCountLength = this.playerAbilityCounts.length;
        if (playerAbilityCountLength === PlayerResource.GetPlayerCount()) {
            if (
                this.playerAbilityCounts.every(
                    (playerAbilityCount) => playerAbilityCount.abilityCount >= 4
                )
            ) {
                allPlayersHaveSelectedAbilities = true;
            }
        }

        if (allPlayersHaveSelectedAbilities) {
            print("All players have selected abilities");
            CustomGameEventManager.Send_ServerToAllClients(
                "on_ability_pick_phase_completed",
                {} as never
            );
        }
    }

    mockPick() {
        if (this.currentMockTurn > this.maxMockTurns) {
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
        while (
            goodGuysIndex < playersByTeam[DotaTeam.GOODGUYS].length ||
            badGuysIndex < playersByTeam[DotaTeam.BADGUYS].length
        ) {
            if (goodGuysIndex < playersByTeam[DotaTeam.GOODGUYS].length) {
                this.playerTurnOrder.push(
                    playersByTeam[DotaTeam.GOODGUYS][goodGuysIndex]
                );
                goodGuysIndex++;
            }
            if (badGuysIndex < playersByTeam[DotaTeam.BADGUYS].length) {
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
}
