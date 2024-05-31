interface HPChangedEvent {
    playerID: PlayerID;
    hpPercentage: number;
}

class ExampleUI {
    // Instance variables
    panel: Panel;
    playerPanels: Partial<Record<PlayerID, PlayerPortrait>> = {};
    // ExampleUI constructor
    constructor(panel: Panel) {
        this.panel = panel;

        // Find container element
        const container = this.panel.FindChild("HeroPortraitsRight")!;
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

        $.Msg("Player panels are", this.playerPanels);

        GameEvents.Subscribe("on_think", () => {
            this.HandleHPBars();
        });
    }

    // Event handler for HP Changed event
    HandleHPBars() {
        // Get portrait for this player

        // Get all players and their current health
        const players = Game.GetAllPlayerIDs();
        players.forEach((playerID) => {
            let hero = Players.GetPlayerHeroEntityIndex(playerID);
            if (hero === -1) {
                return;
            }
            const hpPercentage = Entities.GetHealthPercent(hero);
            const playerPortrait = this.playerPanels[
                playerID
            ] as PlayerPortrait;
            //playerPortrait.SetHealthPercent(hpPercentage);
        });
    }
}

let ui = new ExampleUI($.GetContextPanel());
