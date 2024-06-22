enum Container {
    Ultimates,
    Passives,
    Basics,
    Innates,
}

class SelectScreen {
    panel: Panel;
    abilityIconContainers: AbilityIconsContainer[] = [];
    abilityImage: ImagePanel;
    hudBackground: Panel;

    convertToAbilityInformation(event: {
        [key: number]: {
            heroName: string;
            abilityName: string;
            abilityNumber: number;
            abilityType: AbilityTypes;
        };
    }) {
        const abilities: AbilityInformation[] = [];
        for (const key in event) {
            const ability = event[key];
            abilities.push(ability);
        }
        return abilities;
    }

    constructor(panel: Panel) {
        this.panel = panel;
        const container = this.panel.FindChild("AbilityIconsRootContainer")!;

        GameEvents.Subscribe("on_abilities_load", (event) => {
            container.RemoveAndDeleteChildren();
            //$.Msg("on_abilities_load")
            //$.Msg(event)
            const AbilityInformation = this.convertToAbilityInformation(event);
            OnAbilitesLoad(AbilityInformation);
        });

        const OnAbilitesLoad = (abilities: AbilityInformation[]): void => {
            this.abilityIconContainers[Container.Ultimates] =
                new AbilityIconsContainer(
                    container,
                    abilities.filter(
                        (ability) =>
                            ability.abilityType ===
                            ABILITY_TYPES.ABILITY_TYPE_ULTIMATE
                    ),
                    "Small"
                );

            this.abilityIconContainers[Container.Ultimates].labelPanel.text =
                "Ultimates";
            this.abilityIconContainers[Container.Passives] =
                new AbilityIconsContainer(
                    container,
                    abilities.filter(
                        (ability) =>
                            ability.abilityType ===
                            ABILITY_TYPES.ABILITY_TYPE_HIDDEN
                    ),
                    "Medium"
                );

            this.abilityIconContainers[Container.Passives].labelPanel.text =
                "Passives";
            this.abilityIconContainers[Container.Basics] =
                new AbilityIconsContainer(
                    container,
                    abilities.filter(
                        (ability) =>
                            ability.abilityType ===
                            ABILITY_TYPES.ABILITY_TYPE_BASIC
                    ),
                    "ExtraLarge"
                );

            this.abilityIconContainers[Container.Basics].labelPanel.text =
                "Basics";

            this.abilityIconContainers[Container.Innates] =
                new AbilityIconsContainer(
                    container,
                    abilities.filter(
                        (ability) =>
                            ability.abilityType !=
                                ABILITY_TYPES.ABILITY_TYPE_BASIC &&
                            ability.abilityType !=
                                ABILITY_TYPES.ABILITY_TYPE_HIDDEN &&
                            ability.abilityType !=
                                ABILITY_TYPES.ABILITY_TYPE_ULTIMATE
                    ),
                    "Medium"
                );
            this.abilityIconContainers[Container.Innates].labelPanel.text =
                "Innates";

            abilities.forEach((ability, index) => {
                // Check ability has an image
                // Get hero ability is associated with
                //const abilityIcon = new AbilityIcon(container, ability);
                //this.abilityIconContainers[index] = abilityIcon;
            });
        };

        GameEvents.Subscribe("on_ability_pick_phase_completed", () => {
            container.GetParent().RemoveAndDeleteChildren();
        });
    }
}

let selectScreenUi = new SelectScreen($.GetContextPanel());
