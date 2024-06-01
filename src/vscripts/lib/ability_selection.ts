import { reloadable } from "./tstl-utils";

@reloadable
export class AbilitySelection {
    playerTurn: PlayerID = 0;
    playerTurnOrder: PlayerID[] = [];
    playerTurnReversed: boolean = false;
    canPickAgain: boolean = false;
    constructor() {}

    init() {
        print("Ability Selection initialized");
        this.playerTurn = 0;
        this.playerTurnOrder = [];
        this.playerTurnReversed = false;
        this.createPlayerTurnOrder();
        this.registerAbilityClick();
        this.removeAllAbilitiesFromPlayers();
        //this.mockPick(); // For testing
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

    handlePlayerAbilityClicked(playerID: PlayerID, abilityName: string) {
        if (playerID === this.playerTurn) {
            // Assign ability to player
            const player = PlayerResource.GetPlayer(playerID)!;
            player.GetAssignedHero().AddAbility(abilityName);

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
        let allPlayersHaveSelectedAbilities = true;
        for (let i = 0; i < DOTA_MAX_TEAM_PLAYERS; i++) {
            const playerID = i;
            if (PlayerResource.IsValidPlayerID(playerID)) {
                const hero =
                    PlayerResource.GetPlayer(playerID)?.GetAssignedHero();
                if (hero && hero.GetAbilityCount() < 4) {
                    allPlayersHaveSelectedAbilities = false;
                    break;
                }
            }
        }
        if (allPlayersHaveSelectedAbilities) {
            //print("All players have selected abilities");
            // TODO - Dispatch an event to the UI to remove Ability Selection HUD
        }
    }

    mockPick() {
        let playerCount = 5;
        let abilityCountTotal = playerCount * 4;
        for (let i = 0; i < abilityCountTotal; i++) {
            this.handlePlayerAbilityClicked(
                this.playerTurn,
                "earthshaker_aftershock"
            );
        }
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
