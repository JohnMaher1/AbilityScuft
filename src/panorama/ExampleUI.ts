interface HPChangedEvent {
  playerID: PlayerID,
  hpPercentage: number
}

class ExampleUI {
  // Instance variables
  panel: Panel;
  playerPanels: Partial<Record<PlayerID, PlayerPortrait>> = {};
  // ExampleUI constructor
  constructor(panel: Panel) {
      this.panel = panel;

      // Find container element
      const container = this.panel.FindChild("HeroPortraits")!;
      container.RemoveAndDeleteChildren();

      // Get all players and make a playerPortrait for each
      const players = Game.GetAllPlayerIDs();
      // players.forEach((playerID) => {
      //   const heroName = Players.GetPlayerSelectedHero(playerID);
      //   $.Msg("Hero name is", heroName);
      //   const playerPortrait = new PlayerPortrait(container, heroName, `Player${playerID}`);
      //   this.playerPanels[playerID] = playerPortrait;
      // });

      $.Msg("Player panels are", this.playerPanels);

      GameEvents.Subscribe("on_think", () => {
        this.HandleHPBars()
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
      const playerPortrait = this.playerPanels[playerID] as PlayerPortrait;
      //playerPortrait.SetHealthPercent(hpPercentage);
    });

}
}

let ui = new ExampleUI($.GetContextPanel());