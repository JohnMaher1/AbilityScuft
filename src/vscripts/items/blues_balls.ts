import { BaseItem, registerAbility } from "../lib/dota_ts_adapter";

@registerAbility()
export class item_blues_balls extends BaseItem {
    caster: CDOTA_BaseNPC = this.GetCaster();

    private isStateOne: boolean = false;

    Activate() {
        if (!this.isStateOne) {
            this.caster.SetBaseMoveSpeed(this.caster.GetBaseMoveSpeed() + 100);
        } else {
            // Remove move speed buff
            this.caster.SetBaseMoveSpeed(this.caster.GetBaseMoveSpeed() - 100);

            this.caster.SetBaseManaRegen(this.caster.GetManaRegen() + 100);
            // Disarm the caster for 5 seconds
            this.caster.AddNewModifier(
                this.caster,
                undefined,
                "modifier_disarmed",
                {
                    duration: 5,
                }
            );
            Timers.CreateTimer(5, () => {
                this.caster.SetBaseManaRegen(this.caster.GetManaRegen() - 100);
            });
        }

        // Toggle the state
        this.isStateOne = !this.isStateOne;
    }
}
