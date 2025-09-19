from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Association table for the many-to-many relationship between users and reviews (likes)
review_likes = db.Table('review_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('review_id', db.Integer, db.ForeignKey('review.id'), primary_key=True)
)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    # Role can be 'admin' or 'student'
    role = db.Column(db.String(20), nullable=False, default='student')

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role
        }

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    author = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_filename = db.Column(db.String(120), nullable=True)
    genre = db.Column(db.String(50))
    language = db.Column(db.String(50))
    reviews = db.relationship('Review', backref='book', lazy=True)

    def to_dict(self):
        # The frontend will combine the server URL with this image_url
        # e.g., http://127.0.0.1:5000/uploads/images/1984.jpg
        base_url = "http://127.0.0.1:5000"
        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "description": self.description,
            "image_url": f"{base_url}/uploads/images/{self.image_filename}" if self.image_filename else None,
            "genre": self.genre,
            "language": self.language,
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    review_text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='reviews')
    likes = db.relationship('User', secondary=review_likes, backref=db.backref('liked_reviews', lazy='dynamic'))

    def to_dict(self):
        return {
            "id": self.id,
            "review_text": self.review_text,
            "timestamp": self.timestamp.isoformat(),
            "book_title": self.book.title,
            "reviewer_name": self.user.username,
            "likes": [user.id for user in self.likes]
        }
