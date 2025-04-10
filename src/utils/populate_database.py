from src import db
import requests

from src.auth.models import User
from src.character.models import DND_Class, DND_Race, DND_Condition, DND_Class_Feature, DND_Skill, Proficiency_Types, Proficiencies, DND_Race_Proficiency_Option, DND_Class_Proficiency_Option, Proficiency_List, DND_Spell

DND_BASE_URL = "https://www.dnd5eapi.co"
API_BASE_URL = "https://www.dnd5eapi.co/api"
API_CLASS_URL = "https://www.dnd5eapi.co/api/classes"
API_RACE_URL = "https://www.dnd5eapi.co/api/races"
API_CONDITION_URL = "https://www.dnd5eapi.co/api/conditions"
API_CLASS_FEATURE_URL = "https://www.dnd5eapi.co/api/features"
API_SKILLS_URL = "https://www.dnd5eapi.co/api/skills"
API_PROFICIENCIES_URL = "https://www.dnd5eapi.co/api/proficiencies"
API_SPELLS_URL = "https://www.dnd5eapi.co/api/spells"

#Takes in a URL to an api, as well as any necessary headers
#Returns the success of the API call, and the returned response (if any)
def fetch_api_info(URL, headers) -> tuple[bool, requests.Response]:
    response = requests.get(URL, headers=headers)
    success = True

    if response.status_code != 200:
        print(f"Failed to fetch data from {URL}. Status Code: {response.status_code}")
        response = None
        success = False
    
    return (success, response)


def fetch_and_populate_classes():
    # Fetch all classes from the D&D API
    success, response = fetch_api_info(API_CLASS_URL, headers={"Accept": "application/json"})
    if not success: return
    
    # Extract the classes from the response
    classes = response.json().get("results", [])
    
    # Iterate over each class
    for cls in classes:
        # Check if the class already exists
        existing_class = DND_Class.query.filter_by(name=cls["name"]).first()
        if existing_class: continue #If exist, continue to next one

        # Fetch detailed information for each class
        success, api_details_response = fetch_api_info(f"{DND_BASE_URL}{cls['url']}", headers={"Accept": "application/json"})

        # Check if the request was successful. Skip to the next class
        if not success: continue

        class_details = api_details_response.json() # Extract the class details

        
        # Prepare the DND_Class object to be added to the database
        new_class = DND_Class(
            name=class_details["name"],
            description=class_details["desc"],
            hit_die=class_details["hit_die"],
            is_official=True
        )
        
        db.session.add(new_class)
    
    # Commit all changes to the database
    try:
        db.session.commit()
        print("Classes successfully populated!")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")

def fetch_and_populate_races(): 
    success, response = fetch_api_info(API_RACE_URL, headers={"Accept": "application/json"})
    if not success: return
    
    races = response.json().get("results", [])

    for race in races:
        # Check if the condition already exists
        existing_race = DND_Race.query.filter_by(name=race["name"]).first()
        if existing_race: continue #If exist, continue to next one

        # Fetch detailed information for each condition
        success, api_details_response = fetch_api_info(f"{DND_BASE_URL}{race['url']}", headers={"Accept": "application/json"})

        # Check if the request was successful. Skip to the next condition
        if not success: continue
        
        race_details = api_details_response.json() # Extract the class details
        
        # Prepare the DND_Class object to be added to the database
        new_race = DND_Race(
            name = race_details["name"],
            speed = race_details["speed"],
            ability_bonuses = [f"+{bonus['bonus']} {bonus['ability_score']['name']}" for bonus in race_details["ability_bonuses"]],
            alignment_description = race_details["alignment"],
            age_description = race_details["age"],
            size = race_details["size"],
            size_description = race_details["size_description"],
            languages = [language["name"] for language in race_details["languages"]],
            language_description = race_details["language_desc"],
            traits = [trait["name"] for trait in race_details["traits"]],
            subraces = [subrace["name"] for subrace in race_details["subraces"]],
            starting_proficiencies = [proficiency["name"] for proficiency in race_details["starting_proficiencies"]],
            is_official = True
        )
        
        existing_race = DND_Race.query.filter_by(name=race_details["name"]).first()  # Check if the class already exists

        if existing_race:
            continue
        else:
            db.session.add(new_race)
            continue
    
    try:
        db.session.commit()
        print("Races successfully populated!")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")

def fetch_and_populate_conditions(): 
    success, response = fetch_api_info(API_CONDITION_URL, headers={"Accept": "application/json"})
    if not success: return
    
    conditions = response.json().get("results", [])

    for condition in conditions:
        # Check if the condition already exists
        existing_condition = DND_Condition.query.filter_by(condition_name=condition["name"]).first()
        if existing_condition: continue #If exist, continue to next one

        # Fetch detailed information for each condition
        success, api_details_response = fetch_api_info(f"{DND_BASE_URL}{condition['url']}", headers={"Accept": "application/json"})

        # Check if the request was successful. Skip to the next condition
        if not success: continue
        
        condition_details = api_details_response.json() # Extract the condition details

        # Prepare the DND_Condition object to be added to the database
        new_condition = DND_Condition(
            condition_name = condition_details["name"],
            condition_description = "\n".join(condition_details["desc"])
        )
        
        db.session.add(new_condition)
    
    try:
        db.session.commit()
        print("Conditions successfully populated!")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")


def fetch_and_populate_skills(): 
    success, response = fetch_api_info(API_SKILLS_URL, headers={"Accept": "application/json"})
    if not success: return
    
    skills = response.json().get("results", [])

    for skill in skills:
        # Check if the skill already exists
        existing_skill = DND_Skill.query.filter_by(skill_name=skill["name"]).first()
        if existing_skill: continue #If exist, continue to next one

        # Fetch detailed information for each condition
        success, api_details_response = fetch_api_info(f"{DND_BASE_URL}{skill['url']}", headers={"Accept": "application/json"})

        # Check if the request was successful. Skip to the next skill
        if not success: continue
        
        skill_details = api_details_response.json() # Extract the skill details

        # Prepare the DND_Skill object to be added to the database
        mod_type_conversion = {'str':0, 'dex':1, 'con':2, 'int':3, 'wis':4, 'cha':5}
        new_skill = DND_Skill(
            skill_name = skill_details["name"],
            modifier_type = mod_type_conversion[skill_details['ability_score']['index']],
            linked_proficiency_id = None,
            is_official = True
        )
        
        db.session.add(new_skill)
    
    try:
        db.session.commit()
        print("Skills successfully populated!")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")


def fetch_and_populate_class_features():
    success, response = fetch_api_info(API_CLASS_FEATURE_URL, headers={"Accept": "application/json"})
    if not success: return

    features = response.json().get("results", [])

    for feature in features:
        # Check if the condition already exists
        existing_feature = DND_Class_Feature.query.filter_by(feature_name=feature["name"]).first()
        if existing_feature: continue #If exist, continue to next one

        # Fetch detailed information for each condition
        success, api_details_response = fetch_api_info(f"{DND_BASE_URL}{feature['url']}", headers={"Accept": "application/json"})

        # Check if the request was successful. Skip to the next condition
        if not success: continue
        
        feature_details = api_details_response.json() # Extract the condition details

        # Prepare the DND_Condition object to be added to the database
        new_feature = DND_Class_Feature(
            feature_name = feature_details["name"],
            feature_description = "\n".join(feature_details["desc"]),
            feature_prerequisite = feature_details["prerequisites"],
            feature_required_level = feature_details["level"],
            feature_base_class = DND_Class.query.filter_by(name=feature_details["class"]["name"]).first().class_id
        )
        
        db.session.add(new_feature)
    
    try:
        db.session.commit()
        print("Features successfully populated!")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")


def populate_proficiency_types():
    #Note: This function does not populate based on an api...
    proficiency_types = (
        {'id': 0, 'name':'#Unknown-Type'},
        {'id': 1, 'name':'Skills'},
        {'id': 2, 'name':'Weapons'},
        {'id': 3, 'name':'Tool'},
        {'id': 4, 'name':'Armor'},
        {'id': 5, 'name':'Saving-Throw'},
        {'id': 6, 'name':'Spell'},
        {'id': 7, 'name':'Equipment'},
        {'id': 8, 'name':'Ability-Scores'}
    )

    for proficiency_type in proficiency_types:
        # Check if the proficiency already exists
        existing_proficiency = Proficiency_Types.query.filter_by(type_name=proficiency_type["name"]).first()
        if existing_proficiency: continue #If exist, continue to next one

        new_proficiency_type = Proficiency_Types(
            type_id = proficiency_type['id'],
            type_name = proficiency_type['name']
        )

        db.session.add(new_proficiency_type)
    
    try:
        db.session.commit()
        print("Proficiency Types successfully populated!")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")


def fetch_and_populate_proficiencies(): 
    success, response = fetch_api_info(API_PROFICIENCIES_URL, headers={"Accept": "application/json"})
    if not success: return
    
    proficiencies = response.json().get("results", [])

    proficiency_types = Proficiency_Types.query.order_by(Proficiency_Types.type_id).all()

    for proficiency in proficiencies:
        # Check if the proficiency already exists
        existing_proficiency = Proficiencies.query.filter_by(proficiency_name=proficiency["name"]).first()
        if existing_proficiency: continue #If exist, continue to next one

        # Fetch detailed information for each condition
        success, api_details_response = fetch_api_info(f"{DND_BASE_URL}{proficiency['url']}", headers={"Accept": "application/json"})

        # Check if the request was successful. Skip to the next proficiency
        if not success: continue
        
        proficiency_details = api_details_response.json() # Extract the proficiency details

        #proficiency_reference = fetch_api_info(f"{DND_BASE_URL}{proficiency_details['reference']['url']}", headers={"Accept": "application/json"})
        
        matching_type = [{'index':float('inf'), 'name': type.type_name.lower(), 'id': type.type_id} for type in proficiency_types]

        # Find appropraite proficiency category
        lowest_index = 0
        for i, match in enumerate(matching_type):
            try:
                match['index'] = str(proficiency_details['reference']['url']).index(match['name'])
            except:
                pass
            if match['index'] < matching_type[0]['index']:
                lowest_index = i
        print(f"'{matching_type[lowest_index]['name']}' in '{proficiency_details['reference']['url']}'")
        
        new_proficiency = Proficiencies(
            proficiency_name = proficiency_details['name'],
            proficiency_type = matching_type[lowest_index]['id'],
            is_official = True
        )
        
        db.session.add(new_proficiency)
    
    try:
        db.session.commit()
        print("Proficiencies successfully populated!")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")



def fetch_and_populate_class_proficiencies():
    # Fetch all classes from the D&D API
    success, response = fetch_api_info(API_CLASS_URL, headers={"Accept": "application/json"})
    if not success: return
    
    # Extract the classes from the response
    classes = response.json().get("results", [])
    
    # Iterate over each class
    for cls in classes:

        # Fetch detailed information for each class
        success, api_details_response = fetch_api_info(f"{DND_BASE_URL}{cls['url']}", headers={"Accept": "application/json"})

        # Check if the request was successful. Skip to the next class
        if not success: continue

        class_details = api_details_response.json() # Extract the class details

        class_referenced = DND_Class.query.filter_by(name=class_details['name']).first()
        

        for choice_list in class_details['proficiency_choices']:
            # Check if the classes proficiency list already exists
            existing_choice_list = DND_Class_Proficiency_Option.query.filter_by(given_by_class=class_referenced.class_id, list_description=choice_list['desc']).first()
            if existing_choice_list: continue #If exist, continue to next one

            max_list = Proficiency_List.query.filter(Proficiency_List.proficiency_list_id>=0).order_by(Proficiency_List.proficiency_list_id.desc()).first()
            new_list_id = 1 if max_list is None else max_list.proficiency_list_id + 1
            #print (new_list_id)

            if choice_list['from']['option_set_type'] != "options_array": continue

            for choice_option in choice_list['from']['options']:
                if choice_option['option_type'] != "reference": continue

                proficiency_referenced = Proficiencies.query.filter_by(proficiency_name=choice_option["item"]["name"]).first()
                if proficiency_referenced:

                    new_proficiency_list = Proficiency_List(
                        proficiency_list_id = new_list_id,
                        proficiency_id = proficiency_referenced.proficiency_id,
                        is_official = True
                    )

                    db.session.add(new_proficiency_list)
            
            #print (class_details)
            
            new_class_proficiency_list = DND_Class_Proficiency_Option(
                proficiency_list_id = new_list_id,
                given_by_class = class_referenced.class_id,
                max_choices = choice_list['choose'],
                list_description = choice_list['desc'],
                given_when_multiclass = False
            )

            db.session.add(new_class_proficiency_list)

    
    # Commit all changes to the database
    try:
        db.session.commit()
        print("Class Proficiency Lists successfully populated!")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")



def fetch_and_populate_race_proficiencies():
    # Fetch all race from the D&D API
    success, response = fetch_api_info(API_RACE_URL, headers={"Accept": "application/json"})
    if not success: return
    
    # Extract the races from the response
    races = response.json().get("results", [])
    
    # Iterate over each race
    for race in races:

        # Fetch detailed information for each race
        success, api_details_response = fetch_api_info(f"{DND_BASE_URL}{race['url']}", headers={"Accept": "application/json"})

        # Check if the request was successful. Skip to the next race
        if not success: continue

        race_details = api_details_response.json() # Extract the race details

        race_referenced = DND_Race.query.filter_by(name=race_details['name']).first()

        #print (race_details)
        
        if 'starting_proficiency_options' in race_details:
            #If there is only one set of options, not formatted as a list, convert into list
            #Probably not necessary... Just change code to suit new style
            if isinstance(race_details['starting_proficiency_options'], dict):
                race_details['starting_proficiency_options'] = [race_details['starting_proficiency_options']]

            #print(race_details['starting_proficiency_options'])
            for choice_list in race_details['starting_proficiency_options']:

                default_description = "You get to pick from the following proficiency options."
                if not 'desc' in choice_list: choice_list.update({'desc':default_description})

                # Check if the races proficiency list already exists
                existing_choice_list = DND_Race_Proficiency_Option.query.filter_by(given_by_race=race_referenced.race_id, list_description=choice_list['desc']).first()
                if existing_choice_list: continue #If exist, continue to next one

                max_list = Proficiency_List.query.filter(Proficiency_List.proficiency_list_id>=0).order_by(Proficiency_List.proficiency_list_id.desc()).first()
                new_list_id = 1 if max_list is None else max_list.proficiency_list_id + 1
                #print (new_list_id)

                if choice_list['from']['option_set_type'] != "options_array": continue

                for choice_option in choice_list['from']['options']:
                    if choice_option['option_type'] != "reference": continue

                    proficiency_referenced = Proficiencies.query.filter_by(proficiency_name=choice_option["item"]["name"]).first()
                    if proficiency_referenced:

                        new_proficiency_list = Proficiency_List(
                            proficiency_list_id = new_list_id,
                            proficiency_id = proficiency_referenced.proficiency_id,
                            is_official = True
                        )

                        db.session.add(new_proficiency_list)
                
                new_race_proficiency_list = DND_Race_Proficiency_Option(
                    proficiency_list_id = new_list_id,
                    given_by_race = race_referenced.race_id,
                    max_choices = choice_list['choose'],
                    list_description = choice_list['desc']
                )

                db.session.add(new_race_proficiency_list)

        if 'starting_proficiencies' in race_details:
            race_details['starting_proficiencies'] = [race_details['starting_proficiencies']]
            for choice_list in race_details['starting_proficiencies']:

                default_description = "The following proficiencies are provided."

                # Check if the classes proficiency list already exists
                existing_choice_list = DND_Race_Proficiency_Option.query.filter_by(given_by_race=race_referenced.race_id, list_description=default_description).first()
                if existing_choice_list: continue #If exist, continue to next one

                max_list = Proficiency_List.query.filter(Proficiency_List.proficiency_list_id>=0).order_by(Proficiency_List.proficiency_list_id.desc()).first()
                new_list_id = 1 if max_list is None else max_list.proficiency_list_id + 1
                #print (new_list_id)

                for choice_option in choice_list:

                    proficiency_referenced = Proficiencies.query.filter_by(proficiency_name=choice_option['name']).first()
                    if proficiency_referenced:

                        new_proficiency_list = Proficiency_List(
                            proficiency_list_id = new_list_id,
                            proficiency_id = proficiency_referenced.proficiency_id,
                            is_official = True
                        )

                        db.session.add(new_proficiency_list)
                
                if len(choice_list) > 0:
                    new_race_proficiency_list = DND_Race_Proficiency_Option(
                        proficiency_list_id = new_list_id,
                        given_by_race = race_referenced.race_id,
                        max_choices = len(choice_list),
                        list_description = default_description
                    )

                    db.session.add(new_race_proficiency_list)

    
    # Commit all changes to the database
    try:
        db.session.commit()
        print("Race Proficiency Lists successfully populated!")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")


def fetch_and_populate_spells():
    #Fetch all spells from the D&D API
    success, response = fetch_api_info(API_SPELLS_URL, headers={"Accept": "application/json"})
    if not success: return


    # Extract the spells from the response
    spells = response.json().get("results", [])

    # Iterate over each spell
    for spell in spells:
        #fetch detailed information for each spell
        existing_spell = DND_Spell.query.filter_by(spell_name=spell["name"]).first()
        if existing_spell: continue

        

        success, api_details_response = fetch_api_info(f"{DND_BASE_URL}{spell['url']}", headers={"Accept": "application/json"})

        # Check if the request was successful. Skip to the next spell
        if not success: continue

        # Grab spell details JSON from API
        spell_details = api_details_response.json()

        # Assemble the description into one string
        full_description = ""
        for string in spell_details['desc']:
            full_description = full_description + string + " \n"

        # Assemble the class and subclass arrays
        classArray = []
        for dnd_class in spell_details['classes']:
            classArray.append(dnd_class['name'])

        subclassArray = []
        for dnd_subclass in spell_details['subclasses']:
            subclassArray.append(dnd_subclass['name'])
        
        attack_type = None
        try:
            attack_type = spell_details['attack_type']
        except:
            attack_type = None

        damage_slot_level = None
        try:
            damage_slot_level = spell_details['damage']['damage_at_slot_level']
        except:
            damage_slot_level = None

        damage_char_level = None
        try:
            damage_char_level = spell_details['damage']['damage_at_character_level']
        except:
            damage_char_level = None

        damage_type = None
        try:
            damage_type = spell_details['damage']['damage_type']['name']
        except:
            damage_type = None

        heal_slot_level = None
        try:
            heal_slot_level = spell_details['heal_at_slot_level']
        except:
            heal_slot_level = None

        dc_type = None
        try:
            dc_type = spell_details['dc']['dc_type']['index']
        except:
            dc_type = None

        dc_success = None
        try:
            dc_success = spell_details['dc']['dc_success']
        except:
            dc_success = None

        area_type = None
        try:
            area_type = spell_details['area_of_effect']['type']
        except:
            area_type = None

        area_size = None
        try:
            area_size = spell_details['area_of_effect']['size']
        except:
            area_size = None

        material = None
        try:
            material = spell_details['material']
        except:
            material = None

        higher_level = None
        try:
            material = spell_details['higher_level'][0]
        except:
            material = None

        

        new_spell = DND_Spell(
            spell_name = spell_details['name'],
            spell_level = spell_details['level'],
            spell_school = spell_details['school']['name'],
            casting_time = spell_details['casting_time'],
            attack_type = attack_type,
            damage_slot_level = damage_slot_level,
            damage_char_level = damage_char_level,
            damage_type = damage_type,
            heal_slot_level = heal_slot_level,
            dc_type = dc_type,
            dc_success = dc_success,
            reaction_condition = "Reactions have conditions. Refer to outside of the SRD",
            is_ritual = spell_details['ritual'],
            is_concentration = spell_details['concentration'],
            area_type = area_type,
            area_size = area_size,
            range = spell_details['range'],
            components = spell_details['components'],
            material = material,
            duration = spell_details['duration'],
            description = full_description,
            higher_level = higher_level,
            classes = classArray,
            subclasses = subclassArray
        )

        db.session.add(new_spell)

    # Commit all changes to the database
    try:
        db.session.commit()
        print("Spells successfully populated!")
    except Exception as e:
        db.session.rollback()
        print(f"An error occurred: {e}")
        

def repopulate_empty_tables():
    fetch_and_populate_classes()
    fetch_and_populate_races()
    fetch_and_populate_conditions()
    fetch_and_populate_skills()
    fetch_and_populate_class_features()
    populate_proficiency_types()
    fetch_and_populate_proficiencies()
    fetch_and_populate_class_proficiencies()
    fetch_and_populate_race_proficiencies()
    fetch_and_populate_spells()