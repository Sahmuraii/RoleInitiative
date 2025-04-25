export type ModifierType =
  | 'Custom'
  | 'Bonus'
  | 'Damage'
  | 'Advantage'
  | 'Disadvantage'
  | 'Resistance'
  | 'Immunity'
  | 'Vulnerability'
  | 'Sense'
  | 'Set'
  | 'Proficiency'
  | 'Language'
  | 'Expertise'
  | 'Half proficiency'
  | 'Feat'
  | 'Carrying capacity'
  | 'Natural weapon'
  | 'Stealth disadvantage'
  | 'Speed reduction'
  | 'Melee weapon attack'
  | 'Ranged weapon attack'
  | 'Weapon property'
  | 'Half proficiency round up'
  | 'Favored enemy'
  | 'Ignore'
  | 'Eldritch blast'
  | 'Replace damage type'
  | 'Twice proficiency'
  | 'Protection'
  | 'Stacking bonus'
  | 'Set base'
  | 'Ignore weapon property'
  | 'Size'
  | 'Weapon mastery'
  | 'Enable feature'
  | 'Replace weapon ability';

export type ModifierSubtypes = {
  [key in ModifierType]?: string[];
};

export type CurrencyType = 'CP' | 'SP' | 'EP' | 'GP' | 'PP' | 'Custom';
export type WeaponCategory = 'Simple' | 'Martial';
export type WeaponRangeType = 'Melee' | 'Ranged';

export interface AmmoDetails {
  type: string;
  capacity: number;
}

export const modifierSubtypes: ModifierSubtypes = {
  'Custom': [],
  'Bonus': ['Attack Rolls', 'Damage Rolls', 'Ability Checks', 'Saving Throws', 'AC', 'Speed', 'Hit Points', 'Spell Attack Rolls', 'Spell Save DC', 'Spell Damage', 'Initiative', 'Other'],
  'Damage': ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'],
  'Advantage': ['Attack Rolls', 'Ability Checks', 'Saving Throws', 'Initiative', 'Death Saving Throws', 'Concentration'],
  'Disadvantage': ['Attack Rolls', 'Ability Checks', 'Saving Throws', 'Initiative', 'Death Saving Throws', 'Concentration'],
  'Resistance': ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'],
  'Immunity': ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder', 'Condition'],
  'Vulnerability': ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'],
  'Sense': ['Blindsight', 'Darkvision', 'Tremorsense', 'Truesight'],
  'Set': ['Ability Score', 'AC', 'Speed', 'Hit Points', 'Initiative'],
  'Proficiency': ['Weapon', 'Armor', 'Tool', 'Skill', 'Saving Throw', 'Vehicle'],
  'Language': ['Common', 'Elvish', 'Dwarvish', 'Draconic', 'Infernal', 'Celestial', 'Abyssal', 'Undercommon', 'Primordial', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc', 'Sylvan', 'Deep Speech', 'Thieves\' Cant', 'Druidic'],
  'Expertise': ['Skill', 'Tool'],
  'Half proficiency': ['Skill', 'Tool', 'Saving Throw', 'Ability Check'],
  'Feat': [],
  'Carrying capacity': ['Multiply', 'Add', 'Set'],
  'Natural weapon': ['Unarmed Strike', 'Claws', 'Bite', 'Slam', 'Gore', 'Tentacle'],
  'Stealth disadvantage': [],
  'Speed reduction': ['Walking', 'Swimming', 'Flying', 'Climbing', 'Burrowing'],
  'Melee weapon attack': ['Simple', 'Martial', 'Natural', 'Unarmed'],
  'Ranged weapon attack': ['Simple', 'Martial', 'Natural'],
  'Weapon property': ['Ammunition', 'Finesse', 'Heavy', 'Light', 'Loading', 'Reach', 'Special', 'Thrown', 'Two-Handed', 'Versatile'],
  'Half proficiency round up': ['Skill', 'Tool', 'Saving Throw', 'Ability Check'],
  'Favored enemy': ['Aberrations', 'Beasts', 'Celestials', 'Constructs', 'Dragons', 'Elementals', 'Fey', 'Fiends', 'Giants', 'Monstrosities', 'Oozes', 'Plants', 'Undead', 'Humanoid'],
  'Ignore': ['Difficult Terrain', 'Heavy Armor Movement Penalty', 'Weapon Property', 'Spell Components'],
  'Eldritch blast': ['Range', 'Damage Type', 'Effect'],
  'Replace damage type': ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'],
  'Twice proficiency': ['Skill', 'Tool', 'Ability Check'],
  'Protection': ['Against damage type', 'Against condition', 'Against spell'],
  'Stacking bonus': ['AC', 'Attack Rolls', 'Saving Throws', 'Ability Checks', 'Damage Rolls'],
  'Set base': ['AC', 'Ability Score', 'Initiative', 'Speed'],
  'Ignore weapon property': ['Ammunition', 'Finesse', 'Heavy', 'Light', 'Loading', 'Reach', 'Special', 'Thrown', 'Two-Handed', 'Versatile'],
  'Size': ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'],
  'Weapon mastery': ['Simple', 'Martial', 'Specific Weapon'],
  'Enable feature': ['Fly', 'Swim', 'Darkvision', 'Truesight', 'Blindsight', 'Water Breathing', 'Climb Speed', 'Burrow Speed', 'Amphibious', 'Spellcasting', 'Sneak Attack', 'Rage', 'Channel Divinity', 'Extra Attack'],
  'Replace weapon ability': ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
};

export function getModifierSubtypes(type: ModifierType): string[] {
  return modifierSubtypes[type] || [];
}

export const allModifierTypes: ModifierType[] = [
  'Custom',
  'Bonus',
  'Damage',
  'Advantage',
  'Disadvantage',
  'Resistance',
  'Immunity',
  'Vulnerability',
  'Sense',
  'Set',
  'Proficiency',
  'Language',
  'Expertise',
  'Half proficiency',
  'Feat',
  'Carrying capacity',
  'Natural weapon',
  'Stealth disadvantage',
  'Speed reduction',
  'Melee weapon attack',
  'Ranged weapon attack',
  'Weapon property',
  'Half proficiency round up',
  'Favored enemy',
  'Ignore',
  'Eldritch blast',
  'Replace damage type',
  'Twice proficiency',
  'Protection',
  'Stacking bonus',
  'Set base',
  'Ignore weapon property',
  'Size',
  'Weapon mastery',
  'Enable feature',
  'Replace weapon ability'
];