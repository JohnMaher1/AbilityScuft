class AbilityIconsContainer {
    panel: Panel;
    labelPanel: LabelPanel;
    abilityIcons: Partial<AbilityIcon> = {};
    classSize: ClassSize;

    constructor(
        parent: Panel,
        abilityNames: AbilityInformation[],
        classSize: ClassSize
    ) {
        const panel = $.CreatePanel("Panel", parent, "");
        this.panel = panel;
        panel.BLoadLayoutSnippet("AbilityIconsContainer");
        this.panel.AddClass(classSize);

        this.labelPanel = this.panel.FindChild(
            "AbilityIconsLabel"
        ) as LabelPanel;
        this.labelPanel.AddClass(classSize);
        const abilityIcons = this.panel.FindChild("AbilityIcons") as Panel;
        abilityIcons.AddClass(classSize);
        for (let index = 0; index < abilityNames.length; index++) {
            const abilityIcon = new AbilityIcon(
                abilityIcons,
                abilityNames[index],
                this.classSize
            );
            abilityIcon.panel.AddClass(classSize);
            this.abilityIcons[index] = abilityIcon;
        }
    }
}
