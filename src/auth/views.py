from flask import render_template, request, redirect, url_for, Blueprint, flash
from flask_login import login_user, logout_user, login_required, current_user
from flask import jsonify

import bcrypt
from src.auth.models import User

from .forms import LoginForm, RegisterForm
from src import db
from src.utils.decorators import logout_required
from src.auth.token import generate_token, confirm_token

from datetime import datetime

from ..utils.email import send_email


auth_bp = Blueprint("auth_bp", __name__, template_folder="templates")


@auth_bp.route("/register", methods=["GET", "POST"])
@logout_required
def register():
    form = RegisterForm(request.form)
    if form.validate_on_submit():
        # Grab information from the form
        requested_username = form.username.data
        requested_password = form.password.data
        requested_email = form.email.data

        # Encrypt the password. We can check against this later during log in
        password_hash = bcrypt.hashpw(requested_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        user = User(username=requested_username, password=password_hash, email=requested_email)
        db.session.add(user)
        db.session.commit()

        login_user(user)

        return redirect(url_for("auth_bp.send_confirmation"))
    return render_template("auth/register.html", form=form)


@auth_bp.route("/inactive")
@login_required
def inactive():
    if current_user.is_confirmed:
        return redirect(url_for("core.home"))
    return render_template("auth/inactive.html")


@auth_bp.route("/send_confirmation")
@login_required
def send_confirmation():
    if current_user.is_confirmed:
        flash("Your account has already been confirmed.", "success")
        return redirect(url_for("core.home"))
    token = generate_token(current_user.email)
    confirm_url = url_for("auth_bp.confirm_email", token=token, _external=True)
    html = render_template("auth/confirm_email.html", confirm_url=confirm_url)
    subject = "RoleInitiative confirmation email"
    send_email(current_user.email, subject, html)
    flash("A confirmation email has been sent to your provided email.", "success")
    return redirect(url_for("auth_bp.inactive"))


@auth_bp.route("/confirm/<token>")
@login_required
def confirm_email(token):
    if current_user.is_confirmed:
        flash("Account already confirmed.", "success")
        return redirect(url_for("core.home"))
    email = confirm_token(token)
    user = User.query.filter_by(email=current_user.email).first_or_404()
    if user.email == email:  # Compare current email against the email that generated the token
        user.is_confirmed = True
        user.confirmed_on = datetime.now()
        db.session.add(user)
        db.session.commit()
        flash("You have confirmed your account.", "success")
    else:
        flash("The confirmation link is invalid or has expired.", "danger")
    return redirect(url_for("core.home"))


@auth_bp.route("/login", methods=["GET", "POST"])
@logout_required
def login():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"message": "Missing email or password"}), 400

    email = data["email"]
    password = data["password"]

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "Invalid email"}), 401

    if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        login_user(user)
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username
            }
        })
    else:
        return jsonify({"message": "Invalid password"}), 401


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("auth_bp.login"))
