export function isSpecialAbility(abilityName: string): boolean {
  return abilityName.includes("special_bonus")
} 

export function HasHiddenAbility(abilityBehaviourString: string): boolean {
  return abilityBehaviourString.includes("DOTA_ABILITY_BEHAVIOR_HIDDEN")
} 

export function HasInateAbility(abilityBehaviourString: string): boolean {
  return abilityBehaviourString.includes("DOTA_ABILITY_BEHAVIOR_INNATE_UI")
}

export function HasInateTag(abilityTags: AnyNotNil[]) : boolean {
  let hasInnateFlag: boolean = false
  abilityTags.forEach((tag) => {
    
    if (typeof tag === "string" && tag.includes("Innate")) {
      print("tag", tag)
      hasInnateFlag = true 
    }
  })
  return hasInnateFlag;
  
}