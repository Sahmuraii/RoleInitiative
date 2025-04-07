from flask import render_template, Blueprint, request, redirect, url_for, jsonify
from src import db
from src.character.models import (UserBackground, UserSpell, UserMonster,
                                  UserMonster_Actions, UserMonster_BonusActions, UserMonster_DamageAdjustments,
                                  UserMonster_Reactions, UserMonster_SpecialAbilitys, UserMonster_Traits)
import os 
import uuid 
import json

from src.homebrew.models import SavedHomebrew

homebrew_bp = Blueprint('homebrew_bp', __name__, template_folder='../templates')

@homebrew_bp.route('/create_homebrew', methods=['GET', 'POST'])
def create_homebrew():
    if request.method == 'POST':
        return redirect(url_for('homebrew_bp.create_homebrew'))
    return render_template('homebrew/create_homebrew.html')

@homebrew_bp.route('/create_background', methods=['GET', 'POST'])
def create_background():
    print("Received a request to /create_background")
    print("Request method:", request.method)
    print("Request headers:", request.headers)
    print("Request data:", request.get_json())
    if request.method == 'POST':
        print("Method = Post")
        # Parse JSON data from the request
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract data from the JSON payload
        user_id = data.get('user_id')  # Get the user ID to tie the background to a user
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        name = data.get('name')  # Get the name of the background
        description = data.get('description')  # Get the description of the background

        skill_proficiencies = data.get('skillProficiencies', [])  # Get the skill proficiencies
        tool_proficiencies = data.get('toolProficiencies', [])  # Get the tool proficiencies
        language_proficiencies = data.get('languageProficiencies', [])  # Get the language proficiencies
        equipment = data.get('equipment', [])  # Get the equipment

        feature_name = data.get('featureName')  # Get the name of the feature
        feature_description = data.get('featureDescription')  # Get the description of the feature

        personality_traits = data.get('personalityTraits', [])  # Get the personality traits
        ideals = data.get('ideals', [])  # Get the ideals
        bonds = data.get('bonds', [])  # Get the bonds
        flaws = data.get('flaws', [])  # Get the flaws

        # Suggested Characteristics JSON
        suggested_characteristics = {
            "personality_traits": personality_traits,
            "ideals": ideals,
            "bonds": bonds,
            "flaws": flaws
        }

        # Optional: If this is a modified version of an existing background
        original_background_id = data.get('original_background_id')  # Get the original background ID (if applicable)

        # Create a new UserBackground object
        new_background = UserBackground(
            user_id=user_id,  # Tie the background to the user
            background_name=name,
            background_description=description,
            skill_proficiencies=skill_proficiencies,
            tool_proficiencies=tool_proficiencies,
            language_proficiencies=language_proficiencies,
            equipment=equipment,
            feature_name=feature_name,
            feature_effect=feature_description,
            suggested_characteristics=suggested_characteristics,
            specialty_table=None,
        )

        # Add to the database session and commit
        try:
            db.session.add(new_background)
            db.session.commit()
            print(f"Background {name} successfully added to the database.")
            return jsonify({"message": "Background created successfully!"}), 201
        except Exception as e:
            db.session.rollback()
            print(f"Error adding background to the database: {e}")
            return jsonify({"error": "Failed to create background"}), 500

    # Handle GET request (if needed)
    return render_template('homebrew/create_background.html')

@homebrew_bp.route('/backgrounds', methods=['GET'])
def get_backgrounds():
    user_id = request.args.get('userID')   # Get the user ID from the query parameters
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        backgrounds = UserBackground.query.filter_by(user_id=user_id).all()
        # Extract the background data from the query results
        background_data = [
            {
                "background_name": background.background_name,
                "background_description": background.background_description,
            }
            for background in backgrounds
        ]

        return jsonify(background_data), 200
    except Exception as e:
        print(f"Error fetching backgrounds: {e}")
        return jsonify({"error": "Failed to fetch backgrounds"}), 500

@homebrew_bp.route('/create_spell', methods=['GET', 'POST'])
def create_spell():
    print("Received a request to /create_spell")
    print("Request method:", request.method)
    print("Request headers:", request.headers)
    print("Request data:", request.get_json())

    if request.method == 'POST':
        print("Method = POST")
        # Parse JSON data from the request
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract data from the JSON payload
        user_id = data.get('userID')  # Get the user ID to tie the spell to a user
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        spell_name = data.get('name')  # Get the spell name
        version = data.get('version')  # Get the version (optional)
        level = data.get('level')  # Get the spell level
        school = data.get('school')  # Get the spell school
        casting_time = data.get('castingTime')  # Get the casting time
        reaction_description = data.get('reactionDescription')  # Get the reaction description (optional)
        components = data.get('components', [])  # Get the spell components
        materials_description = data.get('materialsDescription')  # Get the materials description (optional)
        spell_range_type = data.get('spellRangeType')  # Get the range type
        range = data.get('range')  # Get the range value (optional)
        area_length = data.get('areaLength')  # Get the area length (optional)
        area_type = data.get('areaType')  # Get the area type (optional)
        duration_type = data.get('durationType')  # Get the duration type
        duration = data.get('duration')  # Get the duration (optional)
        duration_time = data.get('durationTime')  # Get the duration time (optional)
        description = data.get('description')  # Get the spell description
        ritual_spell = data.get('ritualSpell')  # Get whether it's a ritual spell
        higher_level_description = data.get('higherLevelDescription')  # Get the higher-level description (optional)
        higher_level_scaling = data.get('HigherLevelScaling')  # Get the higher-level scaling (optional)
        classes = data.get('classes', [])  # Get the classes that can use the spell
        subclasses = data.get('subclasses', [])  # Get the subclasses that can use the spell
        isSaveOrAttack = data.get('isSaveOrAttack')  # Get whether it's a save or attack spell
        save_stat = data.get('saveStat')  # Get the save stat (optional)
        attack_type = data.get('attackType')  # Get the attack type (optional)
        damage = data.get('damage')  # Get the damage (optional)
        damage_type = data.get('damageType')  # Get the damage type (optional)
        effect = data.get('effect')  # Get the effect (optional)
        inflicts_conditions = data.get('inflictsConditions')  # Get whether it inflicts conditions
        conditions = data.get('conditions', [])  # Get the conditions inflicted (optional)

        # Create a new UserSpell object
        new_spell = UserSpell(
            user_id=user_id,  # Tie the spell to the user
            spell_name=spell_name,
            version=version,
            level=level,
            school=school,
            casting_time=casting_time,
            reaction_description=reaction_description,
            components=components,
            materials_description=materials_description,
            spell_range_type=spell_range_type,
            range=range,
            area_length=area_length,
            area_type=area_type,
            duration_type=duration_type,
            duration=duration,
            duration_time=duration_time,
            description=description,
            ritual_spell=ritual_spell,
            higher_level_description=higher_level_description,
            higher_level_scaling=higher_level_scaling,
            classes=classes,
            subclasses=subclasses,
            isSaveOrAttack=isSaveOrAttack,
            save_stat=save_stat,
            attack_type=attack_type,
            damage=damage,
            damage_type=damage_type,
            effect=effect,
            inflicts_conditions=inflicts_conditions,
            conditions=conditions
        )

        # Add to the database session and commit
        try:
            db.session.add(new_spell)
            db.session.commit()
            print(f"Spell {spell_name} successfully added to the database.")
            return jsonify({"message": "Spell created successfully!"}), 201
        except Exception as e:
            db.session.rollback()
            print(f"Error adding spell to the database: {e}")
            return jsonify({"error": "Failed to create spell"}), 500

    # Handle GET request (if needed)
    return render_template('homebrew/create_spell.html')

def clean_int(value):
    if value is None:
        return None
    if isinstance(value, str) and not value.strip():
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None

@homebrew_bp.route('/create_monster', methods=['GET', 'POST'])
def create_monster(): 
    if request.method == 'POST':
        try:
            # Ensure request is JSON
            if not request.is_json:
                return jsonify({"error": "Request must be JSON"}), 415
            
            data = request.get_json()
            print("Received monster data:", data)

            # Validate required fields
            if not data:
                return jsonify({"error": "No data provided"}), 400
            
            user_id = data.get('userID')
            if not user_id:
                return jsonify({"error": "User ID is required"}), 400
            
            if not data.get('name'):
                return jsonify({"error": "Monster name is required"}), 400

            # Create the monster
            new_monster = UserMonster(
                user_id=user_id,
                name=data.get('name'),
                size=data.get('size'),
                type=data.get('type'),
                subtype=data.get('subtype'),
                alignment=data.get('alignment'),
                armor_class=clean_int(data.get('armorClass')),
                armor_type=data.get('armorType'),
                hit_points_die_count=clean_int(data.get('hitPointsDieCount')),
                hit_points_value=data.get('hitPointsValue'),
                hit_points_modifier=clean_int(data.get('hitPointsModifier')),
                average_hp=clean_int(data.get('averageHP')),
                speed=clean_int(data.get('speed')),
                strength=clean_int(data.get('strength')),
                dexterity=clean_int(data.get('dexterity')),
                constitution=clean_int(data.get('constitution')),
                intelligence=clean_int(data.get('intelligence')),
                wisdom=clean_int(data.get('wisdom')),
                charisma=clean_int(data.get('charisma')),
                initiative_bonus=clean_int(data.get('initiativeBonus')),
                proficiency_bonus=clean_int(data.get('proficiencyBonus')),
                passive_perception=clean_int(data.get('passivePerception')),
                saving_throws=data.get('savingThrows'),
                skills=data.get('skills'),
                damage_vulnerabilities=data.get('damageVulnerabilities'),
                damage_resistances=data.get('damageResistances'),
                damage_immunities=data.get('damageImmunities'),
                condition_immunities=data.get('conditionImmunities'),
                senses=data.get('senses'),
                languages=data.get('languages'),
                language_notes=data.get('languageNotes'),
                challenge_rating=data.get('challengeRating'),
                is_legendary=data.get('isLegendary', False),
                legendary_action_description=data.get('legendaryActionDescription'),
                is_mythic=data.get('isMythic', False),
                mythic_action_description=data.get('mythicActionDescription'),
                has_lair=data.get('hasLair', False),
                lair_xp=clean_int(data.get('lairXP')),
                lair_description=data.get('lairDescription'),
                monster_habitats=data.get('monsterHabitats'),
                gear=data.get('gear'),
                description=data.get('description'),
                traits_description=data.get('traitsDescription'),
                actions_description=data.get('actionsDescription'),
                bonus_actions_description=data.get('bonusActionsDescription'),
                reactions_description=data.get('reactionsDescription'),
                monster_characteristics_description=data.get('monsterCharacteristicsDescription')
            )

            db.session.add(new_monster)
            db.session.flush()  

            # Handle damage adjustments
            for adj in data.get('damageAdjustments', []):
                new_adj = UserMonster_DamageAdjustments(
                    monster_id=new_monster.id,
                    type=adj.get('type'),
                    adjustment_type=adj.get('adjustmentType'),
                    notes=adj.get('notes')
                )
                db.session.add(new_adj)

            # Handle traits
            for trait in data.get('traits', []):
                new_trait = UserMonster_Traits(
                    monster_id=new_monster.id,
                    name=trait.get('name'),
                    description=trait.get('description')
                )
                db.session.add(new_trait)

            # Handle special abilities
            for ability in data.get('specialAbilities', []):
                new_ability = UserMonster_SpecialAbilitys(
                    monster_id=new_monster.id,
                    name=ability.get('name'),
                    description=ability.get('description')
                )
                db.session.add(new_ability)

            # Handle actions
            for action in data.get('actions', []):
                new_action = UserMonster_Actions(
                    monster_id=new_monster.id,
                    name=action.get('name'),
                    description=action.get('description')
                )
                db.session.add(new_action)

            # Handle bonus actions
            for bonus_action in data.get('bonusActions', []):
                new_bonus_action = UserMonster_BonusActions(
                    monster_id=new_monster.id,
                    name=bonus_action.get('name'),
                    description=bonus_action.get('description')
                )
                db.session.add(new_bonus_action)

            # Handle reactions
            for reaction in data.get('reactions', []):
                new_reaction = UserMonster_Reactions(
                    monster_id=new_monster.id,
                    name=reaction.get('name'),
                    description=reaction.get('description')
                )
                db.session.add(new_reaction)

            db.session.commit()

            return jsonify({
                "status": "success",
                "message": "Monster created successfully",
                "monster_id": new_monster.id
            }), 201

        except Exception as e:
            db.session.rollback()
            print(f"Error creating monster: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Failed to create monster",
                "error": str(e)
            }), 500
        
    return render_template('homebrew/create_monster.html')


@homebrew_bp.route('/spells', methods=['GET'])
def get_spells():
    user_id = request.args.get('userID')  # Get the user ID from the query parameters
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        spells = UserSpell.query.filter_by(user_id=user_id).all()
        spells_data = [
            {
                "spell_name": spell.spell_name,
                "level": spell.level,
                "school": spell.school,
                "description": spell.description,
                "casting_time": spell.casting_time, 
                "spell_range": spell.range,
                "components": spell.components,
                "components_description": spell.materials_description,
                "duration": spell.duration
            }
            for spell in spells
        ]

        return jsonify(spells_data), 200
    except Exception as e:
        print(f"Error fetching spells: {e}")
        return jsonify({"error": "Failed to fetch spells"}), 500

@homebrew_bp.route('/monsters', methods=['GET'])
def get_monsters():
    user_id = request.args.get('userID')  # Get the user ID from the query parameters
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        # Get all monsters for the user
        monsters = UserMonster.query.filter_by(user_id=user_id).all()
        
        # Prepare the response data
        monsters_data = []
        for monster in monsters:
            # Get related data from join tables
            traits = UserMonster_Traits.query.filter_by(monster_id=monster.id).all()
            special_abilities = UserMonster_SpecialAbilitys.query.filter_by(monster_id=monster.id).all()
            actions = UserMonster_Actions.query.filter_by(monster_id=monster.id).all()
            bonus_actions = UserMonster_BonusActions.query.filter_by(monster_id=monster.id).all()
            reactions = UserMonster_Reactions.query.filter_by(monster_id=monster.id).all()
            damage_adjustments = UserMonster_DamageAdjustments.query.filter_by(monster_id=monster.id).all()

            # Build the monster object
            monster_obj = {
                "id": monster.id,
                "name": monster.name,
                "size": monster.size,
                "type": monster.type,
                "subtype": monster.subtype,
                "alignment": monster.alignment,
                "armorClass": monster.armor_class,
                "armorType": monster.armor_type,
                "hitPointsDieCount": monster.hit_points_die_count,
                "hitPointsValue": monster.hit_points_value,
                "hitPointsModifier": monster.hit_points_modifier,
                "averageHP": monster.average_hp,
                "speed": monster.speed,
                "strength": monster.strength,
                "dexterity": monster.dexterity,
                "constitution": monster.constitution,
                "intelligence": monster.intelligence,
                "wisdom": monster.wisdom,
                "charisma": monster.charisma,
                "initiativeBonus": monster.initiative_bonus,
                "proficiencyBonus": monster.proficiency_bonus,
                "passivePerception": monster.passive_perception,
                "savingThrows": monster.saving_throws,
                "skills": monster.skills,
                "damageVulnerabilities": monster.damage_vulnerabilities,
                "damageResistances": monster.damage_resistances,
                "damageImmunities": monster.damage_immunities,
                "conditionImmunities": monster.condition_immunities,
                "senses": monster.senses,
                "languages": monster.languages,
                "languageNotes": monster.language_notes,
                "challengeRating": monster.challenge_rating,
                "isLegendary": monster.is_legendary,
                "legendaryActionDescription": monster.legendary_action_description,
                "isMythic": monster.is_mythic,
                "mythicActionDescription": monster.mythic_action_description,
                "hasLair": monster.has_lair,
                "lairXP": monster.lair_xp,
                "lairDescription": monster.lair_description,
                "monsterHabitats": monster.monster_habitats,
                "gear": monster.gear,
                "description": monster.description,
                "traitsDescription": monster.traits_description,
                "actionsDescription": monster.actions_description,
                "bonusActionsDescription": monster.bonus_actions_description,
                "reactionsDescription": monster.reactions_description,
                "monsterCharacteristicsDescription": monster.monster_characteristics_description,
                "traits": [{"name": t.name, "description": t.description} for t in traits],
                "specialAbilities": [{"name": sa.name, "description": sa.description} for sa in special_abilities],
                "actions": [{"name": a.name, "description": a.description} for a in actions],
                "bonusActions": [{"name": ba.name, "description": ba.description} for ba in bonus_actions],
                "reactions": [{"name": r.name, "description": r.description} for r in reactions],
                "damageAdjustments": [{
                    "type": da.type,
                    "adjustmentType": da.adjustment_type,
                    "notes": da.notes
                } for da in damage_adjustments]
            }
            monsters_data.append(monster_obj)

        return jsonify(monsters_data), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error fetching monsters: {e}")
        return jsonify({"error": "Failed to fetch monsters"}), 500

@homebrew_bp.route('/save-homebrew', methods=['POST'])
def save_homebrew():
    user_id = request.args.get('userID')   # Get the user ID from the query parameters
    data = request.json
    content_type = data.get('content_type')
    content_id = data.get('content_id')

    if not content_type or not content_id:
        return jsonify({"error": "Missing content_type or content_id"}), 400

    existing = SavedHomebrew.query.filter_by(
        user_id=user_id,
        content_type=content_type,
        content_id=content_id
    ).first()

    if existing:
        return jsonify({"message": "Already saved"}), 200

    new_save = SavedHomebrew(
        user_id=user_id,
        content_type=content_type,
        content_id=content_id
    )
    db.session.add(new_save)
    db.session.commit()

    return jsonify({"message": "Saved!"}), 201

@homebrew_bp.route('/saved-homebrew', methods=['GET'])
def get_saved_homebrew():
    user_id = request.args.get('userID')   # Get the user ID from the query parameters
    saved_items = SavedHomebrew.query.filter_by(user_id=user_id).all()

    grouped = {"spell": [], "background": [], "monster": []}

    #print(f"User ID: {user_id}")
    #print(f"Saved items: {[{'type': i.content_type, 'id': i.content_id} for i in saved_items]}")

    for item in saved_items:
        model = None
        if item.content_type == "spell":
            #print(f"Trying to load spell with ID {item.content_id}")
            model = UserSpell.query.get(item.content_id)
        elif item.content_type == "background":
            model = UserBackground.query.get(item.content_id)
        elif item.content_type == "monster":
            model = UserMonster.query.get(item.content_id)

        if model:
            model_dict = model.__dict__.copy()
            model_dict.pop('_sa_instance_state', None)
            grouped[item.content_type].append(model_dict)
        #print(model) test to see full model

    return jsonify(grouped)
