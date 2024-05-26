class AbilityIcon {
  panel: Panel;
  abilityImage: ImagePanel;
  abilityTooltip: LabelPanel;

  constructor(parent: Panel, abilityName: string) {
      const panel = $.CreatePanel("Panel", parent, "");
      this.panel = panel;

      panel.BLoadLayoutSnippet("AbilityIcon");

      this.abilityImage = panel.FindChildInLayoutFile("AbilityImage") as any;
      this.abilityTooltip = panel.FindChildTraverse("AbilityTooltip") as LabelPanel;

      $.Msg("TEST", this.abilityImage)
      //this.abilityImage.SetImage("s2r://panorama/images/spellicons/" + abilityName + "_png.vtex");
      $.Msg("Att string", abilityName)
      //this.abilityImage.SetAttributeString("ability_name", abilityName);

      this.abilityImage.SetPanelEvent("onmouseover", () => {
          this.abilityTooltip.text = abilityName;
          this.abilityTooltip.visible = true;
      });

      this.abilityImage.SetPanelEvent("onmouseout", () => {
          this.abilityTooltip.visible = false;
      });
  }
}