class PlayerPortrait {
  // Instance variables
  panel: Panel;
  heroImage: ImagePanel;
  playerLabel: LabelPanel;
  hpBar: Panel;

  constructor(parent: Panel, heroName: string, playerName: string) {
      // Create new panel
      const panel = $.CreatePanel("Panel", parent, "");
      this.panel = panel;

      // Load snippet into panel
      panel.BLoadLayoutSnippet("PlayerPortrait");

      // Find components
      this.heroImage = panel.FindChildTraverse("HeroImage") as ImagePanel;
      this.playerLabel = panel.FindChildTraverse("PlayerName") as LabelPanel;
      this.hpBar = panel.FindChildTraverse("HealthBar")!;

      // Set player name label
      this.playerLabel.text = playerName;

      // Set hero image
      this.heroImage.SetImage("s2r://panorama/images/heroes/" + heroName + "_png.vtex");

      // Initialise health at 100%
      this.SetHealthPercent(100);
  }

  // Set the health bar to a certain percentage (0-100)
  SetHealthPercent(percentage: number) {
      this.hpBar.style.width = Math.floor(percentage) + "%"; // wots
  }
}