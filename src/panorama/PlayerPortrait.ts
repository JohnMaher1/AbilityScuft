interface AbilityImagePanel {
    abilityName: string;
    imagePanel: ImagePanel;
}

class PlayerPortrait {
    // Instance variables
    panel: Panel;
    heroImage: ImagePanel;
    playerLabel: LabelPanel;
    hpBar: Panel;
    ability1: AbilityImagePanel;
    ability2: AbilityImagePanel;
    ability3: AbilityImagePanel;
    ability4: AbilityImagePanel;

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
        this.ability1 = {
            abilityName: "",
            imagePanel: null,
        };
        this.ability2 = {
            abilityName: "",
            imagePanel: null,
        };
        this.ability3 = {
            abilityName: "",
            imagePanel: null,
        };
        this.ability4 = {
            abilityName: "",
            imagePanel: null,
        };
        this.ability1.imagePanel = panel.FindChildTraverse(
            "Ability1"
        ) as ImagePanel;
        this.ability2.imagePanel = panel.FindChildTraverse(
            "Ability2"
        ) as ImagePanel;
        this.ability3.imagePanel = panel.FindChildTraverse(
            "Ability3"
        ) as ImagePanel;
        this.ability4.imagePanel = panel.FindChildTraverse(
            "Ability4"
        ) as ImagePanel;

        // Set player name label
        this.playerLabel.text = playerName;

        // Set hero image
        this.heroImage.SetImage(
            "s2r://panorama/images/heroes/" + heroName + "_png.vtex"
        );
    }

    setAbilityImage(abilityPosition: number, abilityName: string) {
        switch (abilityPosition) {
            case 1:
                this.ability1.imagePanel.SetImage(
                    this.getImagePath(abilityName)
                );
                this.ability1.abilityName = abilityName;
                break;
            case 2:
                this.ability2.imagePanel.SetImage(
                    this.getImagePath(abilityName)
                );
                this.ability2.abilityName = abilityName;
                break;
            case 3:
                this.ability3.imagePanel.SetImage(
                    this.getImagePath(abilityName)
                );
                this.ability3.abilityName = abilityName;
                break;
            case 4:
                this.ability4.imagePanel.SetImage(
                    this.getImagePath(abilityName)
                );
                this.ability4.abilityName = abilityName;
                break;
        }
    }
    getImagePath(abilityName: string) {
        return "s2r://panorama/images/spellicons/" + abilityName + "_png.vtex";
    }

    // Set the health bar to a certain percentage (0-100)
    // SetHealthPercent(percentage: number) {
    //     this.hpBar.style.width = Math.floor(percentage) + "%"; // wots
    // }
}
