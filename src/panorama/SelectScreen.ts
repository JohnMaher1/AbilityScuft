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
    abilityInfo: AbilityInformation[] = [];
    allowPassives: boolean = true;
    triggeredAbilitiesLoad: boolean = false;

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
            const AbilityInformation = this.convertToAbilityInformation(event);
            this.abilityInfo = AbilityInformation;
            OnAbilitesLoad(this.abilityInfo, this.allowPassives);
        });

        const OnAbilitesLoad = (
            abilities: AbilityInformation[],
            allowPassives: boolean
        ): void => {
            if (this.triggeredAbilitiesLoad) {
                return;
            }
            this.triggeredAbilitiesLoad = true;
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

            if (allowPassives) {
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
            }

            this.abilityIconContainers[Container.Basics] =
                new AbilityIconsContainer(
                    container,
                    abilities.filter(
                        (ability) =>
                            ability.abilityType ===
                            ABILITY_TYPES.ABILITY_TYPE_BASIC
                    ),
                    allowPassives ? "ExtraLarge" : "ExtraLargePlus2"
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
        };

        SubscribeNetTableKey("setup_options", "allowPassives", (value) => {
            this.allowPassives = value.value === 1 ? true : false;
            // $.Schedule(5, () => {
            //     OnAbilitesLoad(this.abilityInfo, this.allowPassives);
            // });
        });

        GameEvents.Subscribe("on_ability_pick_phase_completed", () => {
            container.GetParent().RemoveAndDeleteChildren();
        });
    }
}

let selectScreenUi = new SelectScreen($.GetContextPanel());
