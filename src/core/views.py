from flask import Blueprint, render_template
from flask_login import login_required

from src.utils.decorators import check_is_confirmed

core_bp = Blueprint("core", __name__, template_folder="templates")

data = {
    "id": "foundId",
    "email": "foundEmail",
    "username": "foundUsername",
    "password": "foundPassword",
    "created_on": "1/1/24",
    "is_admin": False,
    "is_confirmed": False,
    "confirmed_on": "no date"
}


@core_bp.route("/")
@login_required
@check_is_confirmed
def home():
    return render_template("core/home.html")