from src import db

from datetime import datetime

class SavedHomebrew(db.Model):
    __tablename__ = 'saved_homebrew'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content_type = db.Column(db.String(50), nullable=False)  # "spell", "race", etc.
    content_id = db.Column(db.Integer, nullable=False)  # ID from the related table
    saved_at = db.Column(db.DateTime, default=datetime.now())

    __table_args__ = (db.UniqueConstraint('user_id', 'content_type', 'content_id', name='uix_user_content'),)
