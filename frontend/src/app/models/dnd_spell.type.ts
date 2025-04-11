export type DND_Spell = {
    spell_id: number;
    spell_name: string;
    spell_level: number;
    spell_school: string;
    casting_time: string;
    attack_type: string | null;
    damage_slot_level: JSON | null;
    damage_char_level: JSON | null;
    damage_type: string | null;
    heal_slot_level: JSON | null;
    dc_type: string | null;
    dc_success: string | null;
    reaction_condition: string | null;
    is_ritual: boolean;
    is_concentration: boolean;
    area_type: string | null;
    area_size: string | null;
    range: string;
    components: string[];
    material: string | null;
    duration: string;
    description: string;
    higher_level: string | null;
    classes: string[];
    subclasses: string[];

}