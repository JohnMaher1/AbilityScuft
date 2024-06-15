class AbilityPositionHud {
    panel: Panel;
    abilityPositionChildren: AbilityPositionChild[] = [];
    abilitySelection1: AbilityPositionChild | undefined;
    abilitySelection2: AbilityPositionChild | undefined;
    constructor(panel: Panel) {
        this.panel = panel;
        this.subsribeToEvents();
        this.handleSwapAbilitiesButton();
        const swapAbilitiesButton = this.panel.FindChild(
            "AbilitySwapHideButton"
        ) as ToggleButton;
        swapAbilitiesButton.style.height = "0%";
    }
    handleSwapAbilitiesButton() {
        const container = this.panel.FindChild("AbilityReorderContainer")!;
        const swapAbilitiesButton = this.panel.FindChild(
            "AbilitySwapHideButton"
        ) as ToggleButton;
        swapAbilitiesButton.SetPanelEvent("onactivate", () => {
            const swapAbilitiesText = swapAbilitiesButton.FindChild(
                "AbilitySwapText"
            )! as LabelPanel;
            if (swapAbilitiesText.text === "Show Swap Abilities") {
                swapAbilitiesText.text = "Hide Swap Abilities";
                container.style.height = "70%";
            } else {
                swapAbilitiesText.text = "Show Swap Abilities";
                container.style.height = "0%";
            }
        });
        swapAbilitiesButton.SetPanelEvent("onmouseover", () => {
            $.DispatchEvent(
                "DOTAShowTextTooltip",
                swapAbilitiesButton,
                "<h1>Swap Abilities</h1> Click the first ability you want to swap, then click the second ability you want to swap with."
            );
        });
        swapAbilitiesButton.SetPanelEvent("onmouseout", () => {
            $.DispatchEvent("DOTAHideTextTooltip");
        });
    }

    onChildAbilityClick(playerID: PlayerID, abilityName: string) {
        if (Players.GetLocalPlayer() === playerID) {
            if (this.abilitySelection1 === undefined) {
                this.abilitySelection1 = this.abilityPositionChildren.find(
                    (child) => child.abilityName === abilityName
                );
                this.abilitySelection1.panel.style.border = "3px solid green";
            } else if (this.abilitySelection2 === undefined) {
                this.abilitySelection2 = this.abilityPositionChildren.find(
                    (child) => child.abilityName === abilityName
                );
                GameEvents.SendCustomGameEventToServer("on_ability_swap", {
                    abilityName1: this.abilitySelection1.abilityName,
                    abilityName2: this.abilitySelection2.abilityName,
                    playerID: Players.GetLocalPlayer(),
                });
                this.abilitySelection2.panel.style.border = "2px solid green";
                // Swap abilities
                const abilitySelection1Index =
                    this.abilityPositionChildren.indexOf(
                        this.abilitySelection1
                    );
                const abilitySelection2Index =
                    this.abilityPositionChildren.indexOf(
                        this.abilitySelection2
                    );
                // swap the two children
                const temp = this.abilitySelection1;
                this.abilityPositionChildren[abilitySelection1Index] =
                    this.abilitySelection2;
                this.abilityPositionChildren[abilitySelection2Index] = temp;
                this.abilitySelection1 = undefined;
                this.abilitySelection2 = undefined;

                const abilityNames = this.abilityPositionChildren.map(
                    (x) => x.abilityName
                );
                this.abilityPositionChildren = [];
                // Remove all abilities in container and regen with swapped abilities
                const container = this.panel.FindChild(
                    "AbilityReorderContainer"
                )! as Panel;
                container.RemoveAndDeleteChildren();
                abilityNames.forEach((abilityName) => {
                    const abilityPositionChild = new AbilityPositionChild(
                        container,
                        abilityName,
                        this
                    );
                    this.abilityPositionChildren.push(abilityPositionChild);
                });
            }
        }
    }

    subsribeToEvents() {
        GameEvents.Subscribe(
            "on_create_ability_swap_ui",
            (event: {
                [key: number]: {
                    abilities: {
                        [key: number]: string;
                    };
                    playerID: PlayerID;
                };
            }) => {
                const swapAbilitiesButton = this.panel.FindChild(
                    "AbilitySwapHideButton"
                ) as ToggleButton;
                swapAbilitiesButton.style.height = "32px";
                const container = this.panel.FindChild(
                    "AbilityReorderContainer"
                )! as Panel;
                const localPlayerID = Players.GetLocalPlayer();
                Object.entries(event).forEach(([key, value]) => {
                    const playerID = value.playerID;
                    if (localPlayerID === playerID) {
                        const abilities = value.abilities;
                        // Loop through abilities
                        Object.values(abilities).forEach((value) => {
                            const abilityPositionChild =
                                new AbilityPositionChild(
                                    container,
                                    value,
                                    this
                                );
                            this.abilityPositionChildren.push(
                                abilityPositionChild
                            );
                        });
                    }
                });
            }
        );
    }
}

let ui4 = new AbilityPositionHud($.GetContextPanel());
