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
        this.panel = panel;
        // Find container element
        let container = this.panel.FindChild("HeroPortraitsRight")!;
        container.RemoveAndDeleteChildren();
        container = this.panel.FindChild("HeroPortraitsLeft")!;
        container.RemoveAndDeleteChildren();

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
                playerPanel.panel.style.border =
                    playerID === playerTurnID
                        ? "3px solid lime"
                        : "0px solid blue";
            });
        });
    }
}

let ui = new PlayersContainer($.GetContextPanel());
