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
        classname: "DOTA_Tooltip_Ability_item_blues_balls_description",
        name: "<h1>Active: Nut</h1> Releases the blue balls, granting 120 bonus intelligence for 15 seconds and disabling the user for 5 seconds\n+30 Strength\n+30 Agility",
    });

    StandardTooltips.push({
        classname: "DOTA_Tooltip_modifier_post_nut_clarity",
        name: "Post Nut Clarity",
    });

    StandardTooltips.push({
        classname: "DOTA_Tooltip_modifier_post_nut_clarity_description",
        name: "You feel clarity after the nut, gaining 120 bonus intelligence for 15 seconds",
    });

    StandardTooltips.push({
        classname: "DOTA_Tooltip_modifier_the_balancer",
        name: "The Balancer",
    });

    StandardTooltips.push({
        classname: "DOTA_Tooltip_modifier_the_balancer_description",
        name: "Stop winning so hard loser, get balanced you absolute nerd. You are hexed and broken for 20 seconds.",
    });

    StandardTooltips.push({
        classname: "DOTA_Tooltip_Ability_item_the_balancer",
        name: "The Balancer",
    });

    StandardTooltips.push({
        classname: "DOTA_Tooltip_Ability_item_the_balancer_description",
        name: "<h1>Active: Balance</h1> Looks like you're losing, thats rough buddy, here's some help. This item hexes and breaks the target for 20 seconds. One time use.",
    });

    // Return data to compiler
    return localization_info;
}
