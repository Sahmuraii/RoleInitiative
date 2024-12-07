from src import db
import requests

from src.auth.models import User
from src.character.models import DND_Class, DND_Race, DND_Condition, DND_Class_Feature, DND_Skill

DND_BASE_URL = "https://www.dnd5eapi.co"
API_BASE_URL = "https://www.dnd5eapi.co/api"
API_CLASS_URL = "https://www.dnd5eapi.co/api/classes"
API_RACE_URL = "https://www.dnd5eapi.co/api/races"
API_CONDITION_URL = "https://www.dnd5eapi.co/api/conditions"
API_CLASS_FEATURE_URL = "https://www.dnd5eapi.co/api/features"
API_SKILLS_URL = "https://www.dnd5eapi.co/api/skills"

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
            is_offical=True
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
            is_offical = True
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
            is_offical = True
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
        

def repopulate_empty_tables():
    fetch_and_populate_classes()
    fetch_and_populate_races()
    fetch_and_populate_conditions()
    fetch_and_populate_skills()
    fetch_and_populate_class_features()