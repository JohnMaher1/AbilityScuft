type currentNewAbilityType = "existing" | "new";

class AbilityRerollHud {
    panel: Panel;
    existingAbilityRerollChild: AbilityRerollChild[] = [];
    newAbilityRerollChild: AbilityRerollChild[] = [];
    abilityToReplace: AbilityRerollChild | undefined;
    newAbilityChosen: AbilityRerollChild | undefined;
    abilityContainer: Panel | undefined;
    newAbilities: AbilityInformation[] = [];
    existingAbilities: string[] = [];
    constructor(panel: Panel) {
        this.panel = panel;
        this.subsribeToEvents();
    }

    subsribeToEvents() {
        GameEvents.Subscribe("on_ability_reroll", (event) => {
            this.newAbilities = this.mapToExistingAbilities(event.abilities);
            this.existingAbilities = Object.values(event.existingAbilities);
            this.initRerollScreen();
        });
    }

    initRerollScreen() {
        this.abilityContainer = this.panel.FindChild("AbilityRerollContainer")!;
        this.abilityContainer.style.visibility = "visible";
        const currentAbilities = this.abilityContainer.FindChild(
            "CurrentPlayerAbilities"
        )!;
        currentAbilities.RemoveAndDeleteChildren();
        const newAbilities = this.abilityContainer.FindChild("NewAbilities")!;
        newAbilities.RemoveAndDeleteChildren();
        this.existingAbilities.forEach((ability) => {
            const abilityRerollChild = new AbilityRerollChild(
                currentAbilities,
                ability,
                this,
                "existing"
            );
            this.existingAbilityRerollChild.push(abilityRerollChild);
        });
        this.newAbilities.forEach((ability) => {
            const abilityRerollChild = new AbilityRerollChild(
                newAbilities,
                ability.abilityName,
                this,
                "new"
            );
            this.newAbilityRerollChild.push(abilityRerollChild);
        });
    }

    handleAbilityClick(abilityName: string, type: currentNewAbilityType) {
        if (type === "existing") {
            this.abilityToReplace !== undefined &&
                this.abilityToReplace.panel.RemoveClass("Selected");
            this.abilityToReplace = this.existingAbilityRerollChild.find(
                (ability) => ability.abilityName === abilityName
            );
            this.abilityToReplace.panel.AddClass("Selected");
        } else {
            this.newAbilityChosen !== undefined &&
                this.newAbilityChosen.panel.RemoveClass("Selected");
            this.newAbilityChosen = this.newAbilityRerollChild.find(
                (ability) => ability.abilityName === abilityName
            );
            this.newAbilityChosen.panel.AddClass("Selected");
        }

        if (this.abilityToReplace && this.newAbilityChosen) {
            const playerID = Players.GetLocalPlayer();
            GameEvents.SendCustomGameEventToServer("on_ability_replace", {
                playerID: playerID,
                abilityName1: this.abilityToReplace.abilityName,
                abilityName2: this.newAbilityChosen.abilityName,
            });
            this.reset();
        }
    }

    reset() {
        this.existingAbilityRerollChild = [];
        this.newAbilityRerollChild = [];
        this.abilityToReplace = undefined;
        this.newAbilityChosen = undefined;
        this.newAbilities = [];
        this.existingAbilities = [];
        this.abilityContainer!.style.visibility = "collapse";
    }

    mapToExistingAbilities(abilities: {
        [key: number]: {
            heroName: string;
            abilityName: string;
            abilityNumber: number;
            abilityType: ABILITY_TYPES;
        };
    }): AbilityInformation[] {
        const abilityInformationArray: AbilityInformation[] = [];
        Object.values(abilities).map((ability) => {
            abilityInformationArray.push({
                heroName: ability.heroName,
                abilityName: ability.abilityName,
                abilityNumber: ability.abilityNumber,
                abilityType: ability.abilityType,
            });
        });
        return abilityInformationArray;
    }
}

let ui5 = new AbilityRerollHud($.GetContextPanel());
