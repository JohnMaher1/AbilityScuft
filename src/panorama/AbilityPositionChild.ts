class AbilityPositionChild {
    panel: Panel;
    abilityNameLabelPanel: LabelPanel;
    abilityImage: ImagePanel;
    textInputKey: TextEntry;
    abilityName: string;

    setImage(abilityName: string) {
        this.abilityImage.SetImage(
            "s2r://panorama/images/spellicons/" + abilityName + "_png.vtex"
        );
    }

    constructor(
        parent: Panel,
        abilityName: string,
        abilityPositionHud: AbilityPositionHud
    ) {
        // Create new panel
        this.abilityName = abilityName;
        const panel = $.CreatePanel("Panel", parent, "");
        this.panel = panel;
        panel.BLoadLayoutSnippet("AbilityPositionChild");

        this.abilityNameLabelPanel = this.panel.FindChildTraverse(
            "AbilityName"
        ) as LabelPanel;

        this.abilityImage = this.panel.FindChildTraverse(
            "AbilityImage"
        ) as ImagePanel;

        this.textInputKey = this.panel.FindChildTraverse(
            "AbilityKeyBindingTextEntry"
        ) as TextEntry;
        let setImage: boolean = false;
        try {
            this.abilityImage.SetImage(
                "s2r://panorama/images/spellicons/" + abilityName + "_png.vtex"
            );
            setImage = true;
            this.panel.SetPanelEvent("onactivate", () => {
                $.Msg("AbilityPositionChild onactivate: ", abilityName);
                abilityPositionHud.onChildAbilityClick(
                    Players.GetLocalPlayer(),
                    abilityName
                );
            });
        } catch (e) {
            $.Msg("Error setting image", e);
            this.abilityImage.RemoveAndDeleteChildren();
        }

        GameEvents.Subscribe("on_keybind_submit", (event) => {
            if (Players.GetLocalPlayer() === event.playerID) {
                // Get all players abilities
                GameEvents.SendCustomGameEventToServer("on_keybind_submit", {
                    playerID: event.playerID,
                    key: this.textInputKey.text,
                    abilityName: abilityName,
                });
                if (!this.textInputKey.text) {
                    return;
                }
            }
        });
    }
}

function onKeyBindSubmit() {
    GameEvents.SendCustomGameEventToAllClients("on_keybind_submit", {
        playerID: Players.GetLocalPlayer(),
        key: "",
        abilityName: "",
    });
}
