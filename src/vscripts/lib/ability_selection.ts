import { GameRulesState } from "../gamemodeadditions/functions/game_rules_state";
import { hero_ability_kv_HandleScepterShardUpgrade } from "./ability_kv_helper";
import { reloadable } from "./tstl-utils";

interface PlayerAbilityCounts {
    playerID: PlayerID;
    abilityCount: number;
    hasPickedInnate: boolean;
}
@reloadable
export class AbilitySelection {
    playerMaxAbilities = 5;
    playerTurn: PlayerID = 0;
    playerTurnOrder: PlayerID[] = [];
    playerTurnReversed: boolean = false;
    canPickAgain: boolean = false;
    abilities: AbilityInformation[] = [];
    maxMockTurns = 10 * this.playerMaxAbilities + 1;
    currentMockTurn = 0;
    playerAbilityCounts: PlayerAbilityCounts[] = [];
    forceRandomAbilities: boolean = false;
    allPlayersHaveSelectedAbilities: boolean = false;
    allPlayersHaveSelectedAnInnate: boolean = false;
    onAbilitySelectionComplete: () => void;
    abilitiesPicked: string[] = [];
    turnTimeAmount = 20;
    currentTurnTime: number = 30; // 30 for starting player, 20 for all other players
    hasCreatedEndTurnTimer: boolean = false;
    constructor(
        abilities: AbilityInformation[],
        onAbilitySelectionComplete: () => void,
        forceRandomAbilities: boolean
    ) {
        this.abilities = abilities;
        this.onAbilitySelectionComplete = onAbilitySelectionComplete;
        this.forceRandomAbilities = forceRandomAbilities;
    }

    init() {
        print("Ability Selection initialized");
        this.playerTurnOrder = [];
        this.playerTurnReversed = false;
        this.createPlayerTurnOrder();
        this.registerAbilityClick();
        this.removeAllAbilitiesFromPlayers();
        this.registerListeners();
    }

    isInnate(ability: AbilityInformation) {
        return (
            ability.abilityType !== AbilityTypes.BASIC &&
            ability.abilityType !== AbilityTypes.ULTIMATE &&
            ability.abilityType !== AbilityTypes.HIDDEN
        );
    }

    handleTimer() {
        if (
            this.allPlayersHaveSelectedAbilities &&
            this.allPlayersHaveSelectedAnInnate &&
            this.hasCreatedEndTurnTimer === false
        ) {
            this.currentTurnTime = 10;
            this.hasCreatedEndTurnTimer = true;
            Timers.CreateTimer(IsInToolsMode() ? 1 : 10, () => {
                GameRulesState.getInstance().canRunAbilitySelectionOnThink =
                    false;
            });
        }
        this.currentTurnTime--;
        CustomGameEventManager.Send_ServerToAllClients(
            "on_ability_selection_timer_change",
            { currentTimeRemaining: this.currentTurnTime }
        );
        if (this.currentTurnTime === 0) {
            this.currentTurnTime = this.turnTimeAmount;
            this.mockPick();
        }
    }

    onThink() {
        this.handleTimer();
    }

    registerListeners() {
        CustomGameEventManager.RegisterListener(
            "on_ability_time_allowed_expired",
            (_, data) => {
                this.mockPick(data.PlayerID);
            }
        );
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
                    if (
                        ability?.GetAbilityName() &&
                        this.canAbilityBeRemovedFromPlayer(ability)
                    ) {
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
        if (this.forceRandomAbilities) {
            return;
        }

        CustomGameEventManager.RegisterListener(
            "on_ability_clicked",
            (_, data) => {
                this.handlePlayerAbilityClicked(data.player, data.ability);
            }
        );
    };

    handlePlayerAbilityCount(playerID: PlayerID, ability: AbilityInformation) {
        const playerAbilityCount = this.playerAbilityCounts.find(
            (playerAbilityCount) => playerAbilityCount.playerID === playerID
        );
        if (playerAbilityCount) {
            if (this.isInnate(ability)) {
                playerAbilityCount.hasPickedInnate = true;
            }
            playerAbilityCount.abilityCount++;
        } else {
            this.playerAbilityCounts.push({
                playerID: playerID,
                abilityCount: 1,
                hasPickedInnate: false,
            });
        }
    }

    onAddAbilityToPlayer(playerID: PlayerID, abilityName: string) {
        this.abilitiesPicked.push(abilityName);
        // Check if ability has a scepter upgrade
        hero_ability_kv_HandleScepterShardUpgrade(playerID, abilityName);
    }

    handlePlayerAbilityClicked(
        playerID: PlayerID,
        abilityInformation: AbilityInformation
    ) {
        if (playerID === this.playerTurn) {
            const playerAbilityCount = this.playerAbilityCounts.find(
                (x) => x.playerID === playerID
            );
            if (!this.allPlayersHaveSelectedAbilities) {
                if (this.isInnate(abilityInformation)) {
                    return;
                }
            }
            if (
                this.allPlayersHaveSelectedAbilities &&
                !this.allPlayersHaveSelectedAnInnate
            ) {
                if (!this.isInnate(abilityInformation)) {
                    return;
                }
            }
            if (!playerAbilityCount) {
                this.onAddAbilityToPlayer(
                    playerID,
                    abilityInformation.abilityName
                );
                this.handlePlayerAbilityCount(playerID, abilityInformation);
            }
            if (
                playerAbilityCount &&
                playerAbilityCount.abilityCount < this.playerMaxAbilities + 1 // 1 for innate
            ) {
                this.onAddAbilityToPlayer(
                    playerID,
                    abilityInformation.abilityName
                );
                this.handlePlayerAbilityCount(playerID, abilityInformation);
            }

            // Get position of ability
            let abilityPosition = playerAbilityCount?.abilityCount ?? 1;

            CustomGameEventManager.Send_ServerToAllClients(
                "on_player_ability_select",
                {
                    playerID: playerID,
                    ability: abilityInformation,
                    abilityPosition: abilityPosition,
                }
            );

            switch (true) {
                // Last player is normal order
                case !this.playerTurnReversed &&
                    this.playerTurn ===
                        this.playerTurnOrder[this.playerTurnOrder.length - 1]:
                    if (this.canPickAgain === false) {
                        this.canPickAgain = true;
                        this.handleSelectedAbilities();
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
                        this.handleSelectedAbilities();
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
            this.currentTurnTime = 20;
            CustomGameEventManager.Send_ServerToAllClients(
                "on_ability_selection_timer_change",
                { currentTimeRemaining: this.currentTurnTime }
            );
            // Dispatch an event to the UI to display the player turn order
            CustomGameEventManager.Send_ServerToAllClients("on_turn_change", {
                playerTurnID: this.playerTurn,
            });
        } else {
            //print("Not this player's turn. The turn is now: ", this.playerTurn);
            // TODO - Send a message to the player that it's not their turn
        }
    }

    handleSelectedAbilities() {
        const playerAbilityCountLength = this.playerAbilityCounts.length;
        if (playerAbilityCountLength === PlayerResource.GetPlayerCount()) {
            if (
                this.playerAbilityCounts.every(
                    (playerAbilityCount) =>
                        playerAbilityCount.abilityCount >=
                        this.playerMaxAbilities
                )
            ) {
                this.allPlayersHaveSelectedAbilities = true;
            }
            if (
                this.playerAbilityCounts.every(
                    (playerAbilityCount) => playerAbilityCount.hasPickedInnate
                )
            ) {
                this.allPlayersHaveSelectedAnInnate = true;
            }
        }
        this.handleSelectionEvents();
    }

    setPlayerTurn() {
        if (
            this.allPlayersHaveSelectedAbilities &&
            this.allPlayersHaveSelectedAnInnate
        ) {
            return;
        }
        this.playerTurn =
            this.playerTurnOrder[
                (this.playerTurnOrder.indexOf(this.playerTurn) + 1) %
                    this.playerTurnOrder.length
            ];

        // Check if all players have selected max abilites

        this.handleSelectedAbilities();
    }

    mockPick(playerID: PlayerID = -1) {
        if (this.playerTurn !== playerID && playerID !== -1) {
            return;
        }

        if (
            this.allPlayersHaveSelectedAbilities === true &&
            this.allPlayersHaveSelectedAnInnate === true
        ) {
            return;
        }
        let randomAbility: AbilityInformation;
        if (!this.allPlayersHaveSelectedAbilities) {
            const nonInnateAbilities = this.abilities.filter(
                (x) => this.isInnate(x) === false
            );
            randomAbility =
                nonInnateAbilities[
                    Math.floor(Math.random() * nonInnateAbilities.length)
                ];
            while (
                this.abilitiesPicked.includes(randomAbility.abilityName) ||
                this.isInnate(randomAbility)
            ) {
                randomAbility =
                    this.abilities[
                        Math.floor(Math.random() * this.abilities.length)
                    ];
            }
        } else {
            // Find a random innate ability
            const innateAbilities = this.abilities.filter((ability) =>
                this.isInnate(ability)
            );
            randomAbility =
                innateAbilities[
                    Math.floor(Math.random() * innateAbilities.length)
                ];
            while (this.abilitiesPicked.includes(randomAbility.abilityName)) {
                randomAbility =
                    innateAbilities[
                        Math.floor(Math.random() * innateAbilities.length)
                    ];
            }
        }

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

        this.playerTurn = playersByTeam[DotaTeam.GOODGUYS]?.[0] ?? 0;

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

    private canAbilityBeRemovedFromPlayer(ability: CDOTABaseAbility): boolean {
        let returnVal = true;
        const abilityName = ability.GetAbilityName();
        if (
            abilityName === "ability_capture" ||
            abilityName === "twin_gate_portal_warp" ||
            abilityName === "ability_lamp_use" ||
            abilityName === "ability_pluck_famango" ||
            abilityName === "abyssal_underlord_portal_warp"
        ) {
            return false;
        }

        const kvs = GetAbilityKeyValuesByName(abilityName);
        Object.entries(kvs).forEach(([key, value]) => {
            if (key === "AbilityBehavior") {
                const abilityBehavior = value as string;
                if (
                    abilityBehavior.includes("HIDDEN") ||
                    abilityBehavior.includes("NOT_LEARNABLE") ||
                    abilityBehavior.includes("INNATE_UI")
                ) {
                    returnVal = false;
                }
            }
            if (key === "AbilityType") {
                const abilityType = value as string;
                if (abilityType === "DOTA_ABILITY_TYPE_ATTRIBUTES") {
                    returnVal = false;
                }
            }
            if (key === "Innate") {
                returnVal = false;
            }
        });

        return returnVal;
    }

    handleSelectionEvents() {
        if (this.allPlayersHaveSelectedAbilities) {
            CustomGameEventManager.Send_ServerToAllClients(
                "on_all_players_selected_abilties",
                {} as never
            );
        }
        if (this.allPlayersHaveSelectedAnInnate) {
            CustomGameEventManager.Send_ServerToAllClients(
                "on_all_players_selected_innate",
                {} as never
            );

            Timers.CreateTimer(IsInToolsMode() ? 5 : 10, () => {
                CustomGameEventManager.Send_ServerToAllClients(
                    "on_ability_pick_phase_completed",
                    {} as never
                );
                this.onAbilitySelectionComplete();
            });
        }
    }
}
