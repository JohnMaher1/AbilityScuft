interface HPChangedEvent {
    playerID: PlayerID;
    hpPercentage: number;
}

class PlayersContainer {
    panel: Panel;
    playerPanels: Partial<Record<PlayerID, PlayerPortrait>> = {};
    playerTurn: PlayerID = 0;
    playerTurnOrder: PlayerID[] = [];
    playerTurnReversed: boolean = false;
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

        let container = this.panel.FindChild("HeroPortraitsRight")!;
        container?.RemoveAndDeleteChildren();
        container = this.panel.FindChild("HeroPortraitsLeft")!;
        container?.RemoveAndDeleteChildren();

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
        });

        GameEvents.Subscribe("on_ability_pick_phase_completed", () => {
            const tempContainer = this.panel.FindChild("HeroPortraitsRight")!;
            tempContainer?.RemoveAndDeleteChildren();
            const tempContainer2 = this.panel.FindChild("HeroPortraitsLeft")!;
            tempContainer2?.RemoveAndDeleteChildren();
            const tempContainer3 = this.panel.FindChild(
                "AbilityBackgroundImage"
            )! as ImagePanel;
            tempContainer3?.GetParent()?.RemoveAndDeleteChildren();
        });
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
