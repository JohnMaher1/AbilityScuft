class SelectScreen {
    panel: Panel;
    abilityIcons: Partial<AbilityIcon> = {};
    abilityImage: ImagePanel;

    convertToAbilityInformation(event: {
        [key: number]: {
            abilityName: string;
            abilityNumber: number;
        };
    }) {
        const abilities: AbilityInformation[] = [];
        for (const key in event) {
            const ability = event[key];
            abilities.push({
                abilityName: ability.abilityName,
                abilityNumber: ability.abilityNumber,
            });
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

        const OnAbilitesLoad = (abilities: AbilityInformation[]): void => {
            this.abilityIcons = {};
            abilities.forEach((ability, index) => {
                // Check ability has an image
                // Get hero ability is associated with

                const abilityIcon = new AbilityIcon(
                    container,
                    ability.abilityName
                );
                this.abilityIcons[index] = abilityIcon;
            });
        };
    }
}

let selectScreenUi = new SelectScreen($.GetContextPanel());
