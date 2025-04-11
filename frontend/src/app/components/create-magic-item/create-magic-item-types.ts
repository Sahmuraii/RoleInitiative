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
  'Bonus': ['Attack Rolls', 'Damage Rolls', 'Ability Checks', 'Saving Throws', 'AC', 'Speed', 'Other'],
  'Damage': ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'],
  'Resistance': ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'],
  'Immunity': ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder', 'Condition'],
  'Vulnerability': ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'],
  'Sense': ['Blindsight', 'Darkvision', 'Tremorsense', 'Truesight'],
  'Proficiency': ['Weapon', 'Armor', 'Tool', 'Skill', 'Saving Throw'],
  'Language': ['Common', 'Elvish', 'Dwarvish', 'Draconic', 'Infernal', 'Celestial', 'Abyssal', 'Undercommon', 'Primordial'],
  'Weapon property': ['Ammunition', 'Finesse', 'Heavy', 'Light', 'Loading', 'Reach', 'Special', 'Thrown', 'Two-Handed', 'Versatile'],
  'Size': ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'],
  'Enable feature': ['Fly', 'Swim', 'Darkvision', 'Truesight', 'Blindsight', 'Water Breathing', 'Climb Speed', 'Burrow Speed'],
  'Replace weapon ability': ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'],
  'Replace damage type': ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'],
  'Speed reduction': ['Walking', 'Swimming', 'Flying', 'Climbing', 'Burrowing']
};

export interface MagicItemModifier {
  type: ModifierType;
  subtype?: string;
  value?: string | number;
  description?: string;
  appliesTo?: string;
  condition?: string;
}

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