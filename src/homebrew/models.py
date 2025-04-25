from src import db
from sqlalchemy.dialects.postgresql import ARRAY, JSON

from datetime import datetime

class SavedHomebrew(db.Model):
    __tablename__ = 'saved_homebrew'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content_type = db.Column(db.String(50), nullable=False)  # "spell", "race", etc.
    content_id = db.Column(db.Integer, nullable=False)  # ID from the related table
    saved_at = db.Column(db.DateTime, default=datetime.now())

    __table_args__ = (db.UniqueConstraint('user_id', 'content_type', 'content_id', name='uix_user_content'),)

class UserMagicItem(db.Model):
    __tablename__ = "user_magic_items"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Basic Information
    name = db.Column(db.String(100), nullable=False)
    rarity = db.Column(db.String(50), nullable=False)
    item_type = db.Column(db.String(50), nullable=False)
    magic_item_type = db.Column(db.String(50))
    size = db.Column(db.String(50))
    cost_amount = db.Column(db.Integer)
    cost_currency = db.Column(db.String(10))
    
    # Armor Properties
    armor_class = db.Column(db.Integer)
    dex_bonus = db.Column(db.String(10))
    strength_requirement = db.Column(db.Integer)
    stealth_check = db.Column(db.String(20))
    
    # Weapon Properties
    weapon_type = db.Column(db.String(50))
    weapon_category = db.Column(db.String(20))
    weapon_range_type = db.Column(db.String(20))
    weapon_range = db.Column(db.String(20))
    damage_dice = db.Column(db.String(20))
    damage_type = db.Column(db.String(20))
    weapon_properties = db.Column(ARRAY(db.String(50)))
    custom_property_name = db.Column(db.String(100))
    custom_property_description = db.Column(db.Text)
    ammo_type = db.Column(db.String(50))
    ammo_capacity = db.Column(db.Integer)
    
    # Attunement
    requires_attunement = db.Column(db.Boolean, default=False)
    attunement_description = db.Column(db.Text)
    
    # Modifiers
    modifiers = db.Column(JSON)  
    
    # Condition Immunities
    condition_immunities = db.Column(ARRAY(db.String(50)))
    
    # Spellcasting
    allows_spellcasting = db.Column(db.Boolean, default=False)
    spellcasting_ability = db.Column(db.String(20))
    spell_save_dc = db.Column(db.Integer)
    spell_attack_bonus = db.Column(db.Integer)
    spells = db.Column(JSON) 
    
    # Charges
    has_charges = db.Column(db.Boolean, default=False)
    max_charges = db.Column(db.Integer)
    charge_reset_condition = db.Column(db.String(100))
    charge_reset_description = db.Column(db.Text)
    
    # Additional Info
    weight_category = db.Column(db.String(20))
    notes = db.Column(db.Text)
    description = db.Column(db.Text)
    
    def __repr__(self):
        return f"<UserMagicItem {self.name} (ID: {self.id})>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'rarity': self.rarity,
            'item_type': self.item_type,
            'magic_item_type': self.magic_item_type,
            'size': self.size,
            'cost': {
                'amount': self.cost_amount,
                'currency': self.cost_currency
            },
            'armor_properties': {
                'armor_class': self.armor_class,
                'dex_bonus': self.dex_bonus,
                'strength_requirement': self.strength_requirement,
                'stealth_check': self.stealth_check
            } if self.item_type == 'Armor' else None,
            'weapon_properties': {
                'weapon_type': self.weapon_type,
                'category': self.weapon_category,
                'range_type': self.weapon_range_type,
                'range': self.weapon_range,
                'damage_dice': self.damage_dice,
                'damage_type': self.damage_type,
                'properties': self.weapon_properties,
                'custom_property': {
                    'name': self.custom_property_name,
                    'description': self.custom_property_description
                } if self.custom_property_name else None,
                'ammo': {
                    'type': self.ammo_type,
                    'capacity': self.ammo_capacity
                } if self.ammo_type else None
            } if self.item_type == 'Weapon' else None,
            'attunement': {
                'required': self.requires_attunement,
                'description': self.attunement_description
            },
            'modifiers': self.modifiers,
            'condition_immunities': self.condition_immunities,
            'spellcasting': {
                'allowed': self.allows_spellcasting,
                'ability': self.spellcasting_ability,
                'save_dc': self.spell_save_dc,
                'attack_bonus': self.spell_attack_bonus,
                'spells': self.spells
            } if self.allows_spellcasting else None,
            'charges': {
                'has_charges': self.has_charges,
                'max_charges': self.max_charges,
                'reset_condition': self.charge_reset_condition,
                'reset_description': self.charge_reset_description
            } if self.has_charges else None,
            'weight_category': self.weight_category,
            'notes': self.notes,
            'description': self.description
        }

class UserFeat(db.Model):
    __tablename__ = 'user_feats'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Basic Information
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    prerequisite_description = db.Column(db.Text)
    
    # Option fields
    option_name = db.Column(db.String(100))
    option_description = db.Column(db.Text)
    
    # Arrays of complex data stored as JSON
    modifiers = db.Column(JSON)
    spells = db.Column(JSON)
    actions = db.Column(JSON)
    creatures = db.Column(JSON)
    
    def __repr__(self):
        return f"<Feat {self.name} (ID: {self.id})>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'prerequisite_description': self.prerequisite_description,
            'option_name': self.option_name,
            'option_description': self.option_description,
            'modifiers': self.modifiers,
            'spells': self.spells,
            'actions': self.actions,
            'creatures': self.creatures
        }


class UserSpecies(db.Model):
    __tablename__ = 'user_species'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Basic Information
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Traits
    traits = db.Column(JSON)  # JSON field to store various traits
    size = db.Column(db.String(50), nullable=False)
    speed_walking = db.Column(db.Integer, default=0)
    speed_burrowing = db.Column(db.Integer, default=0)
    speed_climbing = db.Column(db.Integer, default=0)
    speed_flying = db.Column(db.Integer, default=0)
    speed_swimming = db.Column(db.Integer, default=0)
    short_description = db.Column(db.Text)
    species_group = db.Column(db.String(100))
    species_trait_introduction = db.Column(db.Text)
    species_options_bool = db.Column(db.Boolean, default=False)
    custom_size = db.Column(db.String(100))
    custom_species_group = db.Column(db.String(100))
    species_traits = db.Column(JSON)
    species_options = db.Column(JSON)
    species_variants = db.Column(JSON)
    
    def __repr__(self):
        return f"<Species {self.name} (ID: {self.id})>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'traits': self.traits,
            'option_name': self.option_name,
            'option_description': self.option_description,
            'modifiers': self.modifiers,
            'spells': self.spells
        }