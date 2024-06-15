interface HPChangedEvent {
    playerID: PlayerID;
    hpPercentage: number;
}
const startingTurnTimeAmount = 30;
const turnTimeAmount = 20;

class PlayersContainer {
    panel: Panel;
    playerPanels: Partial<Record<PlayerID, PlayerPortrait>> = {};
    playerTurn: PlayerID = 0;
    playerTurnOrder: PlayerID[] = [];
    playerTurnReversed: boolean = false;
    currentTurnTime: number = startingTurnTimeAmount;
    onThinkListenerID: GameEventListenerID | undefined = undefined;
    constructor(panel: Panel) {
        $.Msg("PlayersContainer constructor");
        this.panel = panel;
        // Find container element
        let abilityImage = this.panel.FindChild(
            "AbilityBackgroundImage"
        )! as ImagePanel;
        abilityImage.SetImage(
            "file://{images}/custom_game/ability_background.jpg"
        );
        const tempContainer = this.panel.FindChild("HeroPortraitsRight")!;
        const tempContainer2 = this.panel.FindChild("HeroPortraitsLeft")!;
        tempContainer?.RemoveAndDeleteChildren();
        tempContainer2?.RemoveAndDeleteChildren();
        abilityImage?.RemoveAndDeleteChildren();

        // Get all players and make a playerPortrait for each
        const players = Game.GetAllPlayerIDs();
        players.forEach((playerID) => {
            const heroName = Players.GetPlayerSelectedHero(playerID);
            const playerName = Players.GetPlayerName(playerID);
            $.Msg("Hero name is", heroName);
            const team = Players.GetTeam(playerID);
            const containerToAppendTo =
                team === DOTATeam_t.DOTA_TEAM_BADGUYS
                    ? this.panel.FindChild("HeroPortraitsRight")!
                    : this.panel.FindChild("HeroPortraitsLeft")!;

            const playerPortrait = new PlayerPortrait(
                containerToAppendTo,
                heroName,
                `${playerName}`
            );
            this.playerPanels[playerID] = playerPortrait;
        });

        GameEvents.Subscribe("on_turn_change", (event) => {
            const players = Game.GetAllPlayerIDs();
            const playerTurnID = event.playerTurnID;
            players.forEach((playerID) => {
                const playerPanel = this.playerPanels[playerID];
                playerPanel.panel.RemoveClass(
                    playerID === playerTurnID ? "" : "IsPickTurn"
                );
                playerPanel.panel.AddClass(
                    playerID === playerTurnID ? "IsPickTurn" : ""
                );
            });
        });

        GameEvents.Subscribe("on_player_ability_select", (event) => {
            this.setImage(
                event.playerID,
                event.abilityPosition,
                event.abilityName
            );
            this.currentTurnTime = turnTimeAmount;
        });

        GameEvents.Subscribe("on_ability_pick_phase_completed", () => {
            this.clearPlayersContainer();
        });

        this.onThinkListenerID = GameEvents.Subscribe("on_think", () => {
            const timer = this.panel.FindChild("TurnLabel") as LabelPanel;
            this.handleTimer(timer);
        });

        GameEvents.Subscribe(
            "on_player_reconnect",
            (event: PlayerReconnectedEvent) => {
                const playerID = event.PlayerID;
                $.Msg("Player reconnected!!!!!!!!!!!!!!!");
                if (Players.GetLocalPlayer() === playerID) {
                    this.clearPlayersContainer();
                }
            }
        );
    }

    handleTimer(timer: LabelPanel) {
        this.currentTurnTime--;
        timer.text = `Remaining Time To Pick: ${this.currentTurnTime.toString()}`;
        if (this.currentTurnTime === 0) {
            // Force pick for the player and move to next item
            GameEvents.SendCustomGameEventToServer(
                "on_ability_time_allowed_expired",
                {} as never
            );
            this.currentTurnTime = turnTimeAmount;
        }
    }

    clearPlayersContainer() {
        if (this.onThinkListenerID !== undefined) {
            GameEvents.Unsubscribe(this.onThinkListenerID);
        }
        const tempContainer = this.panel.FindChild("HeroPortraitsRight")!;
        tempContainer?.RemoveAndDeleteChildren();
        const tempContainer2 = this.panel.FindChild("HeroPortraitsLeft")!;
        tempContainer2?.RemoveAndDeleteChildren();
        const tempContainer3 = this.panel.FindChild(
            "AbilityBackgroundImage"
        )! as ImagePanel;
        tempContainer3?.GetParent()?.RemoveAndDeleteChildren();
        const timer = this.panel.FindChild("TurnLabel");
        timer?.RemoveAndDeleteChildren();
    }

    setImage(playerID: PlayerID, abilityPosition: number, abilityName: string) {
        const playerPanel = this.playerPanels[playerID];
        playerPanel.setAbilityImage(abilityPosition, abilityName);
        const abilityPanel = this.getAbilityPanel(playerPanel, abilityPosition);
        abilityPanel.SetPanelEvent("onmouseover", () => {
            $.DispatchEvent(
                "DOTAShowAbilityTooltip",
                abilityPanel,
                abilityName
            );
        });
        abilityPanel.SetPanelEvent("onmouseout", () => {
            $.DispatchEvent("DOTAHideAbilityTooltip");
        });
    }

    getAbilityPanel(
        playerPortait: PlayerPortrait,
        abilityPosition: number
    ): ImagePanel {
        switch (abilityPosition) {
            case 1:
                return playerPortait.ability1.imagePanel;
            case 2:
                return playerPortait.ability2.imagePanel;
            case 3:
                return playerPortait.ability3.imagePanel;
            case 4:
                return playerPortait.ability4.imagePanel;
            case 5:
                return playerPortait.ability5.imagePanel;
            default:
                return null;
        }
    }
}

let ui = new PlayersContainer($.GetContextPanel());
