class AbilityRerollChild {
    abilityName: string;
    panel: Panel;
    abilityImage: ImagePanel;
    abilityTooltip: LabelPanel;
    type: currentNewAbilityType;
    constructor(
        parent: Panel,
        abilityName: string,
        abilityRerollHud: AbilityRerollHud,
        type: currentNewAbilityType
    ) {
        this.type = type;
        const panel = $.CreatePanel("Panel", parent, "");
        this.panel = panel;
        this.abilityName = abilityName;
        panel.BLoadLayoutSnippet("AbilityRerollChild");
        this.abilityImage = panel.FindChildTraverse(
            "AbilityImage"
        ) as ImagePanel;
        this.abilityImage.SetImage(
            "s2r://panorama/images/spellicons/" + abilityName + "_png.vtex"
        );
        this.abilityTooltip = panel.FindChildTraverse(
            "AbilityTooltip"
        ) as LabelPanel;
        this.abilityTooltip.style.width = "100%";
        this.abilityTooltip.style.height = "100%";

        this.abilityTooltip.SetPanelEvent("onactivate", () => {
            abilityRerollHud.handleAbilityClick(abilityName, this.type);
        });

        this.panel.SetPanelEvent("onmouseover", () => {
            $.Msg("AbilityIcon onmouseover: ", abilityName);
            this.abilityTooltip.visible = true;
            $.DispatchEvent(
                "DOTAShowAbilityTooltip",
                this.abilityImage,
                abilityName
            );
        });

        this.panel.SetPanelEvent("onmouseout", () => {
            $.DispatchEvent("DOTAHideAbilityTooltip");
        });
    }
}
