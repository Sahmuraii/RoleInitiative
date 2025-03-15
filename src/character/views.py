from flask import render_template, Blueprint, request, redirect, url_for, jsonify
from flask_login import current_user, login_required
from sqlalchemy import select
from src.auth.models import User
from src.character.models import Character, Character_Class, DND_Class, DND_Race, DND_Background, Character_Details, Character_Stats, Character_Race, Character_Hit_Points, Character_Death_Saves, DND_Skill, DND_Class_Proficiency_Option, DND_Race_Proficiency_Option, Proficiency_List, Proficiencies, Character_Proficiency_Choices, Proficiency_Choice, Proficiency_Types
from src import db
import math, json

character_bp = Blueprint('character_bp', __name__, template_folder='../templates')

def get_character_info(request_char_id) -> dict:
    char_info = {}

    #Load Base Character Info
    char = Character.query.filter_by(char_id=request_char_id).first().__dict__
    char.pop('_sa_instance_state', None)
    char_info.update(char)

    #Load Character Race and Race Based Character Stats
    race = (db.session.execute(
            select(Character_Race.race_id, DND_Race.name, DND_Race.speed, DND_Race.size)
            .join(DND_Race, DND_Race.race_id == Character_Race.race_id)
            .where(Character_Race.char_id == request_char_id)
        ).first())
    char_info.update({'race_id':race[0], 'race_name':race[1], 'speed':race[2], 'size':race[3]})

    #Load Character Class(es)
    classes = (db.session.execute(
            select(Character_Class.class_id, Character_Class.class_level, DND_Class.name)
            .join(DND_Class, DND_Class.class_id == Character_Class.class_id)
            .where(Character_Class.char_id == request_char_id)
            .order_by(Character_Class.class_id)
        ))
    char_info.update({'classes': []})
    for cls in classes:
        char_info['classes'].append({'class_id':cls[0], 'level':cls[1], 'class_name':cls[2]})

    #Load Character Modifier Scores
    mods = (db.session.execute(
            select(Character_Stats)
            .where(Character_Race.char_id == request_char_id)
        ).first())
    mods = Character_Stats.query.filter_by(char_id=request_char_id).first().__dict__
    char_info.update({'modifier_scores': []})
    mods.pop('_sa_instance_state', None); mods.pop('char_id', None)
    for attribute in mods:
        char_info['modifier_scores'].append({'modifier_name': attribute, 'score': mods[attribute], 'value': math.floor((mods[attribute] - 10) / 2)})

    #Load Character Health
    char_hp = Character_Hit_Points.query.filter_by(char_id=request_char_id).first().__dict__
    char_hp.pop('_sa_instance_state', None)
    char_info.update(char_hp)

    #Load Character Death Saves
    char_death_saves = Character_Death_Saves.query.filter_by(char_id=request_char_id).first().__dict__
    char_death_saves.pop('_sa_instance_state', None)
    char_info.update(char_death_saves)

    #Load Character Skills
    skills = (db.session.execute(
            select(DND_Skill.skill_id, DND_Skill.skill_name, DND_Skill.modifier_type, DND_Skill.linked_proficiency_id)
            .where(DND_Skill.is_official == True)
            .order_by(DND_Skill.skill_name, DND_Skill.modifier_type, DND_Skill.skill_id)
        ))
    char_info.update({'skills': []})
    for skill in skills:
        mod_type_conversion = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
        mod_value = 0
        for mod in char_info['modifier_scores']:
            if mod['modifier_name'] != mod_type_conversion[skill[2]]: continue
            mod_value = mod['value']
        char_info['skills'].append({'skill_id':skill[0], 'skill_name':skill[1], 'modifier_type':mod_type_conversion[skill[2]], 'modifier_value': mod_value, 'linked_proficiency_id':skill[3], 'proficient':False})

    #Load Character Armor Class
    for mod in char_info['modifier_scores']:
        if mod['modifier_name'] != 'dexterity': continue
        char_info.update({'armor_class': mod['value'] + 10})

    #Load Character Initiative
    for mod in char_info['modifier_scores']:
        if mod['modifier_name'] != 'dexterity': continue
        char_info.update({'initiative': mod['value']})

    #Load Character Passive Perception
    for mod in char_info['modifier_scores']:
        if mod['modifier_name'] != 'wisdom': continue
        char_info.update({'passive_perception': mod['value'] + 10})

    #Load Character Proficiencies
    char_proficiencies = [row._asdict() for row in db.session.execute(
        select(Proficiencies.proficiency_id, Proficiencies.proficiency_name, Proficiency_Types.type_id, Proficiency_Types.type_name )
        .select_from(Character_Proficiency_Choices)
        .join(Proficiency_Choice, Proficiency_Choice.choice_list_id == Character_Proficiency_Choices.choice_list_id)
        .join(Proficiencies, Proficiencies.proficiency_id == Proficiency_Choice.proficiency_id)
        .join(Proficiency_Types, Proficiency_Types.type_id == Proficiencies.proficiency_type)
        .filter(Character_Proficiency_Choices.char_id == request_char_id)
    )]
    #print(char_proficiencies)
    char_info.update({'proficiencies': char_proficiencies})

    for proficiency in char_info['proficiencies']:
        for skill in char_info['skills']:
            if ('skill' in proficiency['type_name'].lower()) and (skill['skill_name'].lower() in proficiency['proficiency_name'].lower()):
                skill['proficient'] = True



    #print(char_info)
    return char_info

@character_bp.route("/character/<int:character_id>/heal_hp/<int(signed=True):heal_amount>", methods=['GET','POST'])
def heal_character(character_id, heal_amount):
    user = current_user
    #if not current_user.is_authenticated:
    #    return "Unauthorized access", 403

    char = Character.query.filter_by(char_id=character_id).first()
    #char = Character.query.filter_by(owner_id=user.id, char_id=character_id).first()
    if not char:
        return "Character not found", 404

    hit_points = Character_Hit_Points.query.filter_by(char_id=character_id).first()

    # Test for damage, if so use temp_hp first
    if (heal_amount < 0) and ((heal_amount*-1) > hit_points.temp_hit_points):
        heal_amount = heal_amount + hit_points.temp_hit_points
        hit_points.temp_hit_points = 0

    # if hp is over max, cap at max hp
    if (hit_points.hit_points + heal_amount > hit_points.max_hit_points):
        hit_points.hit_points = hit_points.max_hit_points
        heal_amount = 0
    hit_points.hit_points = hit_points.hit_points + heal_amount

    # if hp is below zero, cap at zero
    if hit_points.hit_points < 0:
        hit_points.hit_points = 0
    db.session.commit()
    return json.dumps({'hit_points':hit_points.hit_points, 'temp_hit_points': hit_points.temp_hit_points})


@character_bp.route("/character/<character_id>", methods=['GET', 'POST'])
def character(character_id):
    user = current_user
    #if not current_user.is_authenticated:
    #    return "Unauthorized access", 403
    
    char = Character.query.filter_by(char_id=character_id).first()
    #char = Character.query.filter_by(owner_id=user.id, char_id=character_id).first()
    if not char:
        return "Character not found", 404

    # Get the current class and level of the character
    current_class_info = (
        db.session.execute(
            select(Character_Class.class_id, Character_Class.class_level, DND_Class.name)
            .join(DND_Class, DND_Class.class_id == Character_Class.class_id)
            .where(Character_Class.char_id == char.char_id)
        ).first()
    )

    current_class = current_class_info[2] if current_class_info else None  # Class name 
    current_level = current_class_info[1] if current_class_info else None  # Class level

    all_classes = [{k:v for k,v in row.__dict__.items() if k != "_sa_instance_state"} for row in DND_Class.query.all()]
    print(all_classes)

    if request.method == 'POST':
        # Get the selected class ID and class level from the form
        new_class_id = request.form.get('class_id')
        new_class_level = int(request.form.get('class_level', 1))  # Default level is 1

        # Update or insert the Character_Class entry
        char_class_entry = Character_Class.query.filter_by(char_id=char.char_id).first()
        if char_class_entry:
            # Update the existing entry
            char_class_entry.class_id = new_class_id
            char_class_entry.class_level = new_class_level
        else:
            # Create a new entry
            new_char_class = Character_Class(
                char_id=char.char_id,
                class_id=new_class_id,
                class_level=new_class_level
            )
            db.session.add(new_char_class)

        db.session.commit()  # Save the changes
        return redirect(url_for('character_bp.character', character_id=character_id))

    char_si = get_character_info(char.char_id)
    #return render_template('character/character.html', user=user, character=char, current_class=current_class, current_level=current_level, all_classes=all_classes, char_si=get_character_info(char.char_id))
    #return json.dumps({'character': jsonify(char.__dict__), 'current_class': jsonify(current_class), 'current_level(char.char_id)': jsonify(current_level), 'all_classes': jsonify(json.dumps(all_classes)), 'char_si': char_si})
    return json.dumps({'character': (char.__dict__), 'current_class': (current_class), 'current_level(char.char_id)': (current_level), 'all_classes': ((all_classes)), 'char_si': char_si})

def calculate_max_hp(character_id):
    character = Character.query.get(character_id) # Get the character by ID
    if not character:
        raise ValueError(f"Character with ID {character_id} not found.")

    constitution_score = int(Character_Stats.query.filter_by(char_id=character_id).first().constitution) # Constitution score
    constitution_modifier = (constitution_score - 10) // 2 # Constitution modifier

    character_classes = Character_Class.query.filter_by(char_id=character_id).all() # Get all classes for the character

    if not character_classes:
        raise ValueError("Character has no associated classes.")

    first_class = Character_Class.query.filter_by(char_id=character_id,is_initial_class=True).first()
    first_class_data = DND_Class.query.get(first_class.class_id)
    
    if not first_class_data:
        raise ValueError(f"Class with ID {first_class.class_id} not found.")

    hit_die = first_class_data.hit_die # Hit die for the first class
    first_level_hp = hit_die # First level HP is the max roll of the hit die

    additional_hp = 0
    total_levels = 0

    for char_class in character_classes: # 
        class_data = DND_Class.query.get(char_class.class_id) # Get class data
        if not class_data:
            continue

        levels = char_class.class_level - 1 if char_class == first_class else char_class.class_level # Subtract 1 for first class since we already calculated first level HP
        additional_hp += levels * (class_data.hit_die // 2 + 1)  # Average roll per level
        total_levels += levels # Total levels calculation

    con_bonus_hp = (total_levels + 1) * constitution_modifier # Add con bonus for each level

    max_hp = first_level_hp + additional_hp + con_bonus_hp
    return max(max_hp, 1)  # Ensure HP is at least 1

@character_bp.route("/character/create", methods=['GET', 'POST'])
def create():
    
    all_races = DND_Race.query.all()
    all_classes = DND_Class.query.all()
    all_backgrounds = DND_Background.query.all()
    # class_proficiency_lists = (
    #     db.session.query(DND_Class_Proficiency_Option)
    #     .join(DND_Class, DND_Class_Proficiency_Option.given_by_class == DND_Class.class_id)
    #     .order_by(DND_Class_Proficiency_Option.proficiency_list_id.asc(), DND_Class_Proficiency_Option.given_by_class.asc())
    #     ).all()
    class_proficiency_lists = [
        {**row._asdict(), 'proficiency_options':[
                              {'id': proficiency.proficiency_id, 'name': proficiency.proficiency_name, 'type': proficiency.proficiency_type} 
                                for proficiency in Proficiencies.query.join(Proficiency_List, Proficiencies.proficiency_id==Proficiency_List.proficiency_id).filter(Proficiency_List.proficiency_list_id=={**row._asdict()}['proficiency_list_id']).all()
                            ]} 
            for row in db.session.execute(
                select("*").select_from(DND_Class_Proficiency_Option).join(DND_Class, DND_Class.class_id == DND_Class_Proficiency_Option.given_by_class)
            )]

    race_proficiency_lists = DND_Race_Proficiency_Option.query.join(DND_Race, DND_Race.race_id==DND_Race_Proficiency_Option.given_by_race).all()

    if request.method == 'POST':
        #returns list of levels where the class is the index. will have to be changed in the future for homebrew content
        #compare indexes of users choices with indexes of classes. save chosen level along with class_id to an array
        levels = request.form.getlist("multiclass_level")
        classes = []
        for i in range(len(levels)):
            if levels[i] != "0":
                classes.append({'level':levels[i], 'class_id':f'{all_classes[i].class_id}'})
        initial_class = request.form.get('selectFirstClass')
        char_name = request.form.get('charname')
        #ruleset = request.form.get('ruleset')
        #xp_method = request.form.get('xp_method')
        #encumbrance = request.form.get('encumbrance')

        strength = request.form.get('final-str')
        dexterity = request.form.get('final-dex')
        constitution = request.form.get('final-con')
        intelligence = request.form.get('final-int')
        wisdom = request.form.get('final-wis')
        charisma = request.form.get('final-cha')

        #selected_background = request.form.get('background')
        alignment = request.form.get('alignment')
        personality = request.form.get('personality')
        height = request.form.get('height')
        weight = request.form.get('weight')
        skin_color = request.form.get('skin_color')
        hair_color = request.form.get('hair_color')
        eye_color = request.form.get('eye_color')
        age = request.form.get('age')
        faith = request.form.get('faith')
        appearance = request.form.get('appearance')
        backstory = request.form.get('backstory')
        bonds = request.form.get('bonds')
        misc_description = request.form.get('misc_description')

        race = request.form.get('charrace')

        #equipment = request.form.getlist('equipment')

        new_character = Character(
            owner_id=current_user.id,
            name=char_name,
            proficiency_bonus=math.ceil(sum(map(int, levels)) / 4) + 1,
            total_level=sum(map(int, levels)),
        )
        db.session.add(new_character)

        db.session.commit() #Code below breaks without this, as it relies on having a valid character id

        new_character_details = Character_Details(
            char_id = new_character.char_id,
            height = height,
            weight = weight,
            alignment = alignment,
            skin_color = skin_color,
            hair_color = hair_color,
            eye_color = eye_color,
            age = age,
            personality = personality,
            backstory = backstory,
            appearance = appearance,
            bonds = bonds,
            misc = misc_description,
            faith = faith,
        )
        db.session.add(new_character_details)

        new_character_stats = Character_Stats(
            char_id = new_character.char_id,
            strength = strength,
            dexterity = dexterity,
            constitution = constitution,
            intelligence = intelligence,
            wisdom = wisdom,
            charisma = charisma,
        )
        db.session.add(new_character_stats)

        new_character_race = Character_Race(
            char_id = new_character.char_id,
            race_id = race,
        )
        db.session.add(new_character_race)

        for new_class in classes:

            if initial_class == new_class['class_id']:
                    new_character_class = Character_Class(
                    char_id = new_character.char_id,
                    class_id = new_class['class_id'],
                    class_level = new_class['level'],
                    is_initial_class = True
                )
            else:
                new_character_class = Character_Class(
                    char_id = new_character.char_id,
                    class_id = new_class['class_id'],
                    class_level = new_class['level'],
                    is_initial_class = False
                )
            db.session.add(new_character_class)
        
        db.session.commit() # Needed in order to calculate max HP

        new_character_hp = Character_Hit_Points(
            char_id = new_character.char_id,
            hit_points = calculate_max_hp(new_character.char_id),
            max_hit_points = calculate_max_hp(new_character.char_id),
            temp_hit_points = 0
        )
        db.session.add(new_character_hp)

        #TODO: Save Character Death Saves (not just temp values)
        new_character_death_saves = Character_Death_Saves(
            char_id = new_character.char_id,
            success_throws = 0,
            fail_throws = 0
        )
        db.session.add(new_character_death_saves)


        class_proficiency_choices = request.form.getlist(f"class_proficiency_list_{initial_class}_ids")
        for list_id in class_proficiency_choices:
            max_choices = request.form.get(f"class_proficiency_list_{initial_class}_{list_id}_length")

            max_list = Proficiency_Choice.query.filter(Proficiency_Choice.choice_list_id>=0).order_by(Proficiency_Choice.choice_list_id.desc()).first()
            new_choice_list_id = 1 if max_list is None else max_list.choice_list_id + 1

            new_character_proficiency_choice_list = Character_Proficiency_Choices(
                char_id=new_character.char_id,
                proficiency_list_id=int(list_id),
                max_choices=int(max_choices),
                choice_list_id=new_choice_list_id
            )
            db.session.add(new_character_proficiency_choice_list)

            for i in range(int(max_choices)):
                user_proficiency_choice = request.form.get(f"class_proficiency_list_{initial_class}_{list_id}_{i}_selection")

                new_choice_proficiency = Proficiency_Choice(
                    choice_list_id = new_choice_list_id,
                    proficiency_id = int(user_proficiency_choice)
                )
                db.session.add(new_choice_proficiency)

        # Only commit once all character data is ready to be entered
        db.session.commit()
        
        return redirect(url_for('character_bp.character', character_id=new_character.char_id))
    
    return render_template("character/character_creator.html", all_backgrounds=all_backgrounds, all_classes=all_classes, all_races=all_races, class_proficiency_lists=class_proficiency_lists, race_proficiency_lists=race_proficiency_lists)

@character_bp.route('/delete_character/<character_id>', methods=['POST', 'GET'])
@login_required
def delete_character(character_id):
    if request.method == 'POST':
        # Find the character by ID
        character = Character.query.filter_by(char_id=character_id, owner_id=current_user.id).first()

        # This technically worked. But it's ugly so need some kind of solution to make it less ugly
        if not character:
            return jsonify({"error": "Character not found or unauthorized"}), 404
        try:
            # Delete the character from the database
            db.session.delete(character)
            db.session.commit()
            return redirect(url_for('core.home'))
            #return jsonify({"message": "Character deleted successfully"}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({"error": "An error occurred while deleting the character"}), 500
    if request.method == 'GET':
        return redirect(url_for('core_bp.home'))

#@character_bp.route('/characters', methods=['GET'])
#@login_required()
#def get_characters():
#    user = current_user
#    characters = Character.query.filter_by(owner_id=user.id).all()

#    if not characters:
#        return jsonify({"message": "No characters found"}), 404

#    characters_list = []
#    for char in characters:
#        characters_list.append({
#            "char_id": char.char_id,
#            "name": char.name,
#            "proficiency_bonus": char.proficiency_bonus,
#            "total_level": char.total_level,
#            "inspiration": char.inspiration
#        })

#    return jsonify(characters_list), 200

@character_bp.route("/characters/<int:user_id>", methods=['GET', 'POST'])
def characters(user_id):

    # Fetch all characters owned by the user and join with the User table for owner name
    user_chars = (
        db.session.query(
            Character.char_id,
            Character.name.label("character_name"),
            Character.owner_id,
            User.username.label("owner_name")
        )
        .join(User, User.id == Character.owner_id)
        .filter(Character.owner_id == user_id)
        .all()
    )

    if not user_chars:
        return json.dumps({"error": "No characters found"}), 404

    characters_data = []

    for char in user_chars:
        char_obj = Character.query.get(char.char_id)

        # Fetch class and level information
        class_info = [(cc.class_.name, cc.class_level) for cc in char_obj.charClass]
        classes = [entry[0] for entry in class_info]  # Class names
        levels = [entry[1] for entry in class_info]  # Corresponding levels
        # Compute sum of levels
        total_level = sum(entry[1] for entry in class_info)
        # Find the highest-level class
        highest_class = max(class_info, key=lambda x: x[1])[0] if class_info else "None"

        # Fetch race information
        race = char_obj.charRace[0].race.name if char_obj.charRace else "Unknown"

        characters_data.append({
            'character_id': char.char_id,
            'character_name': char.character_name,
            'owner_id': char.owner_id,
            'owner_name': char.owner_name,
            'race': race,
            'classes': classes,
            'levels': levels,
            'highest_class': highest_class,
            'total_level': total_level
        })

    # Fetch all available classes
    all_classes = [
        {k: v for k, v in row.__dict__.items() if k != "_sa_instance_state"}
        for row in DND_Class.query.all()
    ]

    if request.method == 'POST':
        # Handle character class updates
        character_id = request.form.get('character_id')
        new_class_id = request.form.get('class_id')
        new_class_level = int(request.form.get('class_level', 1))  # Default level is 1

        char = next((c for c in user_chars if str(c.char_id) == character_id), None)
        if not char:
            return json.dumps({"error": "Character not found"}), 404

        # Check if character already has a class entry
        char_class_entry = Character_Class.query.filter_by(char_id=char.char_id, class_id=new_class_id).first()
        if char_class_entry:
            char_class_entry.class_level = new_class_level
        else:
            db.session.add(Character_Class(char_id=char.char_id, class_id=new_class_id, class_level=new_class_level))

        db.session.commit()
        return redirect(url_for('core_bp.home'))

    return json.dumps({'characters': characters_data, 'all_classes': all_classes})

@character_bp.route("/all_characters", methods=['GET', 'POST'])
def all_characters():

    # Fetch all characters owned by the user and join with the User table for owner name
    all_chars = (
        db.session.query(
            Character.char_id,
            Character.name.label("character_name"),
            Character.owner_id,
            User.username.label("owner_name")
        )
        .join(User, User.id == Character.owner_id)
        .all()
    )

    if not all_chars:
        return json.dumps({"error": "No characters found"}), 404

    characters_data = []

    for char in all_chars:
        char_obj = Character.query.get(char.char_id)

        # Fetch class and level information
        class_info = [(cc.class_.name, cc.class_level) for cc in char_obj.charClass]
        classes = [entry[0] for entry in class_info]  # Class names
        levels = [entry[1] for entry in class_info]  # Corresponding levels
        # Compute sum of levels
        total_level = sum(entry[1] for entry in class_info)
        # Find the highest-level class
        highest_class = max(class_info, key=lambda x: x[1])[0] if class_info else "None"

        # Fetch race information
        race = char_obj.charRace[0].race.name if char_obj.charRace else "Unknown"

        characters_data.append({
            'character_id': char.char_id,
            'character_name': char.character_name,
            'owner_id': char.owner_id,
            'owner_name': char.owner_name,
            'race': race,
            'classes': classes,
            'levels': levels,
            'highest_class': highest_class,
            'total_level': total_level
        })

    # Fetch all available classes
    all_classes = [
        {k: v for k, v in row.__dict__.items() if k != "_sa_instance_state"}
        for row in DND_Class.query.all()
    ]

    if request.method == 'POST':
        # Handle character class updates
        character_id = request.form.get('character_id')
        new_class_id = request.form.get('class_id')
        new_class_level = int(request.form.get('class_level', 1))  # Default level is 1

        char = next((c for c in all_chars if str(c.char_id) == character_id), None)
        if not char:
            return json.dumps({"error": "Character not found"}), 404

        # Check if character already has a class entry
        char_class_entry = Character_Class.query.filter_by(char_id=char.char_id, class_id=new_class_id).first()
        if char_class_entry:
            char_class_entry.class_level = new_class_level
        else:
            db.session.add(Character_Class(char_id=char.char_id, class_id=new_class_id, class_level=new_class_level))

        db.session.commit()
        return redirect(url_for('core_bp.home'))

    return json.dumps({'characters': characters_data, 'all_classes': all_classes})

