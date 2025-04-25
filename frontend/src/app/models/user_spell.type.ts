export type User_Spell = {
    user_spell_id: number;
    user_id: number;
    spell_name: string;
    version: string;
    spell_level: string;
    spell_school: string;
    casting_time: string;
    reaction_condition: string;
    components: string[];
    material: string;
    spell_range_type: string;
    range: string;
    area_length: string;
    area_type: string;
    duration_type: string;
    duration: string;
    duration_time: string;
    description: string;
    ritual_spell: string;
    higher_level_description: string;
    higher_level_scaling: string;
    classes: string[];
    subclasses: string[];
    isSaveOrAttack: string;
    save_stat: string;
    attack_type: string;
    damage: string;
    damage_type: string;
    effect: string;
    inflicts_conditions: boolean;
    conditions: string[];


}