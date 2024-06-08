import {
    AbilityLocalization,
    LocalizationData,
    ModifierLocalization,
    StandardLocalization,
} from "~generator/localizationInterfaces";
import { Language } from "../languages";

export function GenerateLocalizationData(): LocalizationData {
    // This section can be safely ignored, as it is only logic.
    //#region Localization logic
    // Arrays
    const Abilities: Array<AbilityLocalization> =
        new Array<AbilityLocalization>();
    const Modifiers: Array<ModifierLocalization> =
        new Array<ModifierLocalization>();
    const StandardTooltips: Array<StandardLocalization> =
        new Array<StandardLocalization>();

    // Create object of arrays
    const localization_info: LocalizationData = {
        AbilityArray: Abilities,
        ModifierArray: Modifiers,
        StandardArray: StandardTooltips,
    };
    //#endregion

    // Enter localization data below!
    StandardTooltips.push({
        classname: "Hello",
        name: "test",
    });

    StandardTooltips.push({
        classname: "DOTA_Tooltip_Ability_item_blues_balls",
        name: "Blue's Balls",
    });

    StandardTooltips.push({
        classname: "DOTA_Tooltip_modifier_post_nut_clarity",
        name: "Post Nut Clarity",
    });

    // Return data to compiler
    return localization_info;
}
