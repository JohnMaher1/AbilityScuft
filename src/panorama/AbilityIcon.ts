class AbilityIcon {
    panel: Panel;
    abilityImage: ImagePanel;
    abilityTooltip: LabelPanel;
    canBePicked: boolean = true;

    constructor(parent: Panel, abilityName: string) {
        const panel = $.CreatePanel("Panel", parent, "");
        this.panel = panel;
        panel.BLoadLayoutSnippet("AbilityIcon");

        this.abilityImage = panel.FindChildInLayoutFile("AbilityImage") as any;
        this.abilityTooltip = panel.FindChildTraverse(
            "AbilityTooltip"
        ) as LabelPanel;

        this.abilityImage.SetImage(
            "s2r://panorama/images/spellicons/" + abilityName + "_png.vtex"
        );
        this.abilityTooltip.style.width = "200px";
        this.abilityTooltip.style.height = "200px";

        this.panel.SetPanelEvent("onmouseover", () => {
            $.Msg("AbilityIcon onmouseover: ", abilityName);
            this.abilityTooltip.visible = true;
            $.DispatchEvent(
                "DOTAShowAbilityTooltip",
                this.abilityImage,
                abilityName
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
                abilityName: abilityName,
            });
        });

        GameEvents.Subscribe("on_player_ability_select", (event) => {
            if (event.abilityName === abilityName) {
                this.canBePicked = false;
                this.panel.AddClass("AbilityIconDisabled");
            }
        });
    }
}
