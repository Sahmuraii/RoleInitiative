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

import json


auth_bp = Blueprint("auth_bp", __name__, template_folder="templates")


@auth_bp.route("/register", methods=["POST"])
@logout_required
def register():
    try:
        data = request.get_json()

        # Log the received data to the frontend console
        #print(f"Received registration data: {json.dumps(data)}")

        # Validate request data
        if not data:
            return jsonify({"message": "Data not processed correctly"}), 400
        if "username" not in data or not data["username"].strip():
            return jsonify({"message": "Missing or invalid username"}), 400
        if "email" not in data or not data["email"].strip():
            return jsonify({"message": "Missing or invalid email"}), 400
        if "password" not in data or not data["password"].strip():
            return jsonify({"message": "Missing or invalid password"}), 400

        username = data["username"].strip()
        email = data["email"].strip().lower()  # Store emails in lowercase for consistency
        password = data["password"].strip()

        # Check if user already exists
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            return jsonify({"message": "Username or email already taken"}), 409  # Conflict status code

        # Hash the password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Create new user
        user = User(username=username, password=password_hash, email=email)
        db.session.add(user)
        db.session.commit()

        # Log in the new user automatically
        login_user(user)

        return jsonify({
            "message": "Registration successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username
            }
        }), 201  # Created status code

    except Exception as e:
        print(f"Error during registration: {str(e)}")  # Logs in the backend
        return jsonify({"message": "Internal server error"}), 500


@auth_bp.route("/inactive")
@login_required
def inactive():
    if current_user.is_confirmed:
        return redirect(url_for("core.home"))
    return render_template("auth/inactive.html")

@auth_bp.route("/forgot-password", methods=["POST"])
def forgotPassword():
    try:
        data = request.get_json()

        # Validate request data
        if not data:
            return jsonify({"message": "Data not processed correctly"}), 400
        if "email" not in data or not data["email"].strip():
            return jsonify({"message": "Missing or invalid email"}), 400

        email = data["email"].strip().lower()
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"message": "No account associated with that email."}), 404

        token = generate_token(email)
        reset_url = f"http://localhost:4200/reset-password/{token}"
        html = render_template("auth/reset_password_email.html", reset_url=reset_url)
        subject = "Password Reset Request - RoleInitiative"
        send_email(email, subject, html)

        return jsonify({"message": "If the email exists, a reset link will be sent."}), 200

    except Exception as e:
        print(f"Error during forgot password: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@auth_bp.route("/reset/<token>", methods=["POST"])
def reset_password(token):
    try:
        data = request.get_json()
        if not data or "password" not in data or not data["password"].strip():
            return jsonify({"message": "Missing or invalid password"}), 400

        password = data["password"].strip()
        email = confirm_token(token)

        if not email:
            return jsonify({"message": "Invalid or expired token"}), 400

        user = User.query.filter_by(email=email).first_or_404()
        user.password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        db.session.commit()

        return jsonify({"message": "Password has been reset successfully"}), 200

    except Exception as e:
        print(f"Error during password reset: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500


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