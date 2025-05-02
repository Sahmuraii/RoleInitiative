from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy
from os import getenv
from dotenv import load_dotenv

from flask_migrate import Migrate
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from flask_cors import CORS

from datetime import timedelta

import requests

app = Flask(__name__)
CORS(app)

load_dotenv()

# Load configuration from config.py or environment variables
app.config["SQLALCHEMY_DATABASE_URI"] = 'postgresql://{user}:{pw}@{url}/{db}'.format(
    user=getenv('DATABASE_USER'),
    pw=getenv('DATABASE_PASSWORD'),
    url=getenv('DATABASE_URL'),
    db=getenv('DATABASE_NAME')
)
app.config["SECRET_KEY"] = getenv('FLASK_SECRET_KEY')
app.config["SECURITY_PASSWORD_SALT"] = getenv("SECURITY_PASSWORD_SALT", default="very-important")

app.config["FRONTEND_URL"] = "https://roleinitiative.unr.dev"

# Mail Settings
app.config["MAIL_DEFAULT_SENDER"] = "noreply@flask.com"
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USE_SSL"] = True
app.config["MAIL_DEBUG"] = False
app.config["MAIL_USERNAME"] = getenv("EMAIL_USER")
app.config["MAIL_PASSWORD"] = getenv("EMAIL_PASSWORD")

login_manager = LoginManager()
login_manager.init_app(app)
db = SQLAlchemy(app)

# Uncomment and run to verify proper URL for database
#print(app.config["SQLALCHEMY_DATABASE_URI"])
bcrypt = Bcrypt(app)

migrate = Migrate(app, db)
mail = Mail(app)

# Registering blueprints
from src.auth.views import auth_bp
from src.core.views import core_bp
from src.profile.views import profile_bp
from src.character.views import character_bp
from src.homebrew.views import homebrew_bp
from src.json.views import json_bp

app.register_blueprint(auth_bp)
app.register_blueprint(core_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(character_bp)
app.register_blueprint(homebrew_bp)
app.register_blueprint(json_bp)

from src.auth.models import User
from src.utils.populate_database import repopulate_empty_tables

login_manager.login_view = "auth_bp.login"
login_manager.login_message_category = "danger"

with app.app_context():
    db.create_all()
    #fetch_and_populate_classes()
    #fetch_and_populate_races()
    repopulate_empty_tables()


@login_manager.user_loader
def load_user(user_id):
    return User.query.filter(User.id == int(user_id)).first()

@app.before_request
def before_request():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=60)
    session.modified = True