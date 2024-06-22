type ClassSize = "Small" | "Medium" | "Large" | "ExtraLarge";

class AbilityIcon {
    panel: Panel;
    abilityImage: ImagePanel;
    abilityTooltip: LabelPanel;
    canBePicked: boolean = true;
    classSize: ClassSize;

    constructor(
        parent: Panel,
        ability: AbilityInformation,
        classSize: ClassSize
    ) {
        const panel = $.CreatePanel("Panel", parent, "");
        this.panel = panel;
        panel.BLoadLayoutSnippet("AbilityIcon");
        this.panel.AddClass(classSize);

        this.abilityImage = panel.FindChildInLayoutFile(
            "AbilityImage"
        ) as ImagePanel;
        this.abilityTooltip = panel.FindChildTraverse(
            "AbilityTooltip"
        ) as LabelPanel;

        if (
            ability.abilityType !== ABILITY_TYPES.ABILITY_TYPE_BASIC &&
            ability.abilityType !== ABILITY_TYPES.ABILITY_TYPE_HIDDEN &&
            ability.abilityType !== ABILITY_TYPES.ABILITY_TYPE_ULTIMATE
        ) {
            this.abilityImage?.SetImage(
                "s2r://panorama/images/heroes/" + ability.heroName + "_png.vtex"
            );
        } else {
            this.abilityImage?.SetImage(
                "s2r://panorama/images/spellicons/" +
                    ability.abilityName +
                    "_png.vtex"
            );
        }

        this.abilityTooltip.style.width = "100%";
        this.abilityTooltip.style.height = "100%";

        this.panel.SetPanelEvent("onmouseover", () => {
            $.Msg("AbilityIcon onmouseover: ", ability);
            this.abilityTooltip.visible = true;
            $.DispatchEvent(
                "DOTAShowAbilityTooltip",
                this.abilityImage,
                ability.abilityName
            );
        });

        // Listen to ability image onClick

        this.panel.SetPanelEvent("onmouseout", () => {
            $.DispatchEvent("DOTAHideAbilityTooltip");
        });

        this.abilityTooltip.SetPanelEvent("onactivate", () => {
            if (!this.canBePicked) {
                return;
            }
            const playerId = Players.GetLocalPlayer();
            GameEvents.SendCustomGameEventToServer("on_ability_clicked", {
                player: playerId,
                ability: ability,
            });
        });

        GameEvents.Subscribe("on_player_ability_select", (event) => {
            if (event.ability.abilityName === ability.abilityName) {
                this.canBePicked = false;
                this.panel.AddClass("AbilityIconDisabled");
                this.abilityImage.AddClass("AbilityIconDisabled");
                this.abilityTooltip.AddClass("AbilityIconDisabled");
            }
        });
    }
}
