class SelectScreen {
  panel: Panel;
  abilityIcons: Partial<AbilityIcon> = {};

  constructor(panel: Panel) {
      this.panel = panel;
      const container = this.panel.FindChild("AbilityIcons")!;
      $.Msg("SelectScreen constructor", container)
      GameEvents.Subscribe("on_abilities_load", (event) => {
        //$.Msg("on_abilities_load")
        //$.Msg(event)
        OnAbilitesLoad(event)
      })

      const OnAbilitesLoad = (abilities: {[key: number]: string}) : void => {
        const maxCount = 10
        const values = Object.values(abilities)
        values.forEach((abilityName: string, index: number) => {
            if (index >= maxCount) {
                return
            }
            $.Msg("abilityName", abilityName)
            const abilityIcon = new AbilityIcon(container, abilityName);
            this.abilityIcons[index] = abilityIcon;
        })
      }
  }

}

let selectScreenUi = new SelectScreen($.GetContextPanel());

