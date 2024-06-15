"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateLocalizationData = void 0;
function GenerateLocalizationData() {
    // This section can be safely ignored, as it is only logic.
    //#region Localization logic
    // Arrays
    var Abilities = new Array();
    var Modifiers = new Array();
    var StandardTooltips = new Array();
    // Create object of arrays
    var localization_info = {
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
    // Return data to compiler
    return localization_info;
}
exports.GenerateLocalizationData = GenerateLocalizationData;
