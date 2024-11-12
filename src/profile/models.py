from src import db

class Character(db.Model):
    char_id = db.Column(db.Integer, primary_key=True, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    campaign_id = db.Column(db.Integer, nullable=True)
    name = db.Column(db.String(250), nullable=False)
    alignment = db.Column(db.String(50))
    faith = db.Column(db.String(50))
    proficency_bonus = db.Column(db.Integer, nullable=True)
    total_level = db.Column(db.Integer, nullable=True)


class Character_Race(db.Model):
    char_id = db.Column(db.Integer, db.ForeignKey('character.char_id'), primary_key=True, nullable=False)
    is_offical = db.Column(db.Boolean, nullable=True) 
    race_id = db.Column(db.Integer, db.ForeignKey('DND_Race.race_id', nullable=False))

class DND_Race(db.Model):
    race_id = db.Column(db.Integer, primary_key=True, nullable=False)
    features_id = db.Column(db.Integer, db.ForeignKey('DND_Race_Features.features_id'), nullable=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(250), nullable=False)
    speed = db.Column(db.Integer, nullable=False)
    size = db.Column(db.String(50), nullable=False)
    age = db.Column(db.String(50), nullable=False)

class Race_Proficiency_Option(db.Model):
    proficiency_list_id = db.Column(db.Integer, db.ForeignKey('Proficiency_List.proficiency_list_id'), primary_key=True, nullable=False)
    given_by_race = db.Column(db.Integer, db.ForeignKey(''), nullable=False)

class Character_Class(db.Model):
    char_id = db.Column(db.Integer, db.ForeignKey('character.char_id'), primary_key=True, nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('DND.class_id'), nullable=False)
    class_level = db.Column(db.Integer, nullable=False)

class DND_Class(db.Model):
    class_id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(250), nullable=False)
    hit_die = db.Column(db.Integer, nullable=False)
    is_offical = db.Column(db.Boolean)