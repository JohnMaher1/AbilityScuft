class SelectScreen {
  panel: Panel;
  abilityIcons: Partial<AbilityIcon> = {};
  abilityImage: ImagePanel;

  convertToAbilityInformation(event: {[key: number]: {
    abilityName: string;
    abilityNumber: number;
  }})
  {
    const abilities: AbilityInformation[] = [];
    for (const key in event) {
      const ability = event[key];
      $.Msg("ability", ability)
      abilities.push({
        abilityName: ability.abilityName,
        abilityNumber: ability.abilityNumber
      });
    }
    return abilities
    
  }


  constructor(panel: Panel) {
      this.panel = panel;
      const container = this.panel.FindChild("AbilityIcons")!;
      $.Msg("SelectScreen constructor", container)
      GameEvents.Subscribe("on_abilities_load", (event) => {
        //$.Msg("on_abilities_load")
        //$.Msg(event)
        const AbilityInformation = this.convertToAbilityInformation(event)
        OnAbilitesLoad(AbilityInformation)
      })

      const OnAbilitesLoad = (abilities: AbilityInformation[]) : void => {
        this.abilityIcons = {}
        const maxCount = 10
        abilities
        abilities.forEach((ability, index) => {
          if (index >= maxCount) {
            return
          }
          // Check ability has an image
          $.Msg("tt", ability.abilityName)
          $.Msg("tt", ability.abilityNumber)
          //this.abilityImage.SetImage("s2r://panorama/images/spellicons/" + ability.abilityName + "_png.vtex");

          // Check if file exists
          
          $.Msg("abilityName", ability.abilityName)
          // Get hero ability is associated with

          const abilityIcon = new AbilityIcon(container, ability.abilityName);
          this.abilityIcons[index] = abilityIcon;
        })
      }
  }

}

let selectScreenUi = new SelectScreen($.GetContextPanel());

