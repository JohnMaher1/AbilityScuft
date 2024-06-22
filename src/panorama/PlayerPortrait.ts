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
    ability5: AbilityImagePanel;
    innateAbilityPanel: AbilityImagePanel;

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
        this.ability5 = {
            abilityName: "",
            imagePanel: null,
        };
        this.innateAbilityPanel = {
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
        this.ability5.imagePanel = panel.FindChildTraverse(
            "Ability5"
        ) as ImagePanel;
        this.innateAbilityPanel.imagePanel = panel.FindChildTraverse(
            "InnateAbility"
        ) as ImagePanel;

        // Set player name label
        this.playerLabel.text = playerName;

        // Set hero image
        this.heroImage.SetImage(
            "s2r://panorama/images/heroes/" + heroName + "_png.vtex"
        );
    }

    setAbilityImage(abilityPosition: number, ability: AbilityInformation) {
        switch (abilityPosition) {
            case 1:
                this.ability1.imagePanel.SetImage(this.getImagePath(ability));
                this.ability1.abilityName = ability.abilityName;
                break;
            case 2:
                this.ability2.imagePanel.SetImage(this.getImagePath(ability));
                this.ability2.abilityName = ability.abilityName;
                break;
            case 3:
                this.ability3.imagePanel.SetImage(this.getImagePath(ability));
                this.ability3.abilityName = ability.abilityName;
                break;
            case 4:
                this.ability4.imagePanel.SetImage(this.getImagePath(ability));
                this.ability4.abilityName = ability.abilityName;
                break;
            case 5:
                this.ability5.imagePanel.SetImage(this.getImagePath(ability));
                this.ability5.abilityName = ability.abilityName;
                break;
            case 6:
                this.innateAbilityPanel.imagePanel.SetImage(
                    this.getImagePath(ability)
                );
                this.innateAbilityPanel.abilityName = ability.abilityName;
                break;
            default:
                this.innateAbilityPanel.imagePanel.SetImage(
                    this.getImagePath(ability)
                );
                this.innateAbilityPanel.abilityName = ability.abilityName;
                break;
        }
    }
    getImagePath(ability: AbilityInformation) {
        if (
            ability.abilityType !== ABILITY_TYPES.ABILITY_TYPE_BASIC &&
            ability.abilityType !== ABILITY_TYPES.ABILITY_TYPE_HIDDEN &&
            ability.abilityType !== ABILITY_TYPES.ABILITY_TYPE_ULTIMATE
        ) {
            return (
                "s2r://panorama/images/heroes/" + ability.heroName + "_png.vtex"
            );
        }
        return (
            "s2r://panorama/images/spellicons/" +
            ability.abilityName +
            "_png.vtex"
        );
    }
}
