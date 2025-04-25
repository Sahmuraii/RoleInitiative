from flask import Blueprint, jsonify
from src.character.models import DND_Class, DND_Race, Proficiencies, Proficiency_List, DND_Class_Proficiency_Option, DND_Spell
from src import db
from sqlalchemy import select


json_bp = Blueprint("json_bp", __name__)


#retrieves json for all stored classes
@json_bp.route("/json/classes")
def returnClassJson():
    classes = []
    for dndclass in DND_Class.query.all():
        classes.append(dndclass.serialize())

    return jsonify(classes)

#retrieves json for all stored races
@json_bp.route("/json/races")
def returnRaceJson():
    races = []
    for dndrace in DND_Race.query.all():
        races.append(dndrace.serialize())

    return jsonify(races)

@json_bp.route("/json/classproficiencies")
def returnClassProficiencies():
    class_proficiency_lists = [
        {**row._asdict(), 'proficiency_options':[
                              {'id': proficiency.proficiency_id, 'name': proficiency.proficiency_name, 'type': proficiency.proficiency_type} 
                                for proficiency in Proficiencies.query.join(Proficiency_List, Proficiencies.proficiency_id==Proficiency_List.proficiency_id).filter(Proficiency_List.proficiency_list_id=={**row._asdict()}['proficiency_list_id']).all()
                            ]} 
            for row in db.session.execute(
                select("*").select_from(DND_Class_Proficiency_Option).join(DND_Class, DND_Class.class_id == DND_Class_Proficiency_Option.given_by_class)
            )]
    return jsonify(class_proficiency_lists)

@json_bp.route("/json/dnd_spells")
def returnDNDSpells():
    spells = []
    for dndspell in DND_Spell.query.order_by(DND_Spell.spell_name).all():
        spells.append(dndspell.serialize())

    return jsonify(spells)