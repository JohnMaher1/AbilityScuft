class SelectScreen {
    panel: Panel;
    abilityIcons: Partial<AbilityIcon> = {};
    abilityImage: ImagePanel;
    hudBackground: Panel;

    convertToAbilityInformation(event: { [key: number]: string }) {
        const abilities: string[] = [];
        for (const key in event) {
            const ability = event[key];
            abilities.push(ability);
        }
        return abilities;
    }

    constructor(panel: Panel) {
        this.panel = panel;
        const container = this.panel.FindChild("AbilityIcons")!;
        $.Msg("SelectScreen constructor", container);
        GameEvents.Subscribe("on_abilities_load", (event) => {
            container.RemoveAndDeleteChildren();
            //$.Msg("on_abilities_load")
            //$.Msg(event)
            const AbilityInformation = this.convertToAbilityInformation(event);
            OnAbilitesLoad(AbilityInformation);
        });

        const OnAbilitesLoad = (abilities: string[]): void => {
            this.abilityIcons = {};
            abilities.forEach((ability, index) => {
                // Check ability has an image
                // Get hero ability is associated with

                const abilityIcon = new AbilityIcon(container, ability);
                this.abilityIcons[index] = abilityIcon;
            });
        };

        GameEvents.Subscribe("on_ability_pick_phase_completed", () => {
            container.GetParent().RemoveAndDeleteChildren();
        });
    }
}

let selectScreenUi = new SelectScreen($.GetContextPanel());
