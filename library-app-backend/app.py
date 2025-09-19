import os
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from sqlalchemy import event
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from werkzeug.utils import secure_filename
from models import db, User, Book, Review, review_likes

# Import models
from models import db, User, Book

# --- App Configuration ---
app = Flask(__name__)

# Make paths absolute
basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SECRET_KEY'] = 'a-very-secret-key-that-you-should-change'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'library.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads', 'images')
# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- Initialize Extensions ---
db.init_app(app)
bcrypt = Bcrypt(app)
CORS(app) # Allows your React app to talk to this server

# --- JWT Helper Functions & Decorators ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Bearer token malformed'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except Exception:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({'message': 'Admin privileges required!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# --- Routes ---

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    is_student = data.get('is_student', True) 

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user_role = 'student' if is_student else 'admin'

    new_user = User(username=username, password_hash=hashed_password, role=user_role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully", "user": new_user.to_dict()}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 401

    user = User.query.filter_by(username=username).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token, 'user': user.to_dict()})

# --- Book API Routes ---

@app.route('/api/books', methods=['GET'])
def get_all_books():
    books = Book.query.all()
    return jsonify([book.to_dict() for book in books])

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify(book.to_dict())

@app.route('/api/books', methods=['POST'])
@admin_required
def add_book(current_user):
    title = request.form.get('title')
    author = request.form.get('author')
    description = request.form.get('description')
    
    if not title or not author:
        return jsonify({'error': 'Title and author are required'}), 400

    image_filename = None
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            image_filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], image_filename))

    new_book = Book(title=title, author=author, description=description, image_filename=image_filename)
    db.session.add(new_book)
    db.session.commit()
    return jsonify(new_book.to_dict()), 201

# --- Check-in/out API Routes ---

@app.route('/api/readings/active', methods=['GET'])
@admin_required
def get_active_readings(current_user):
    readings = UserRead.query.filter_by(status='current').all()
    return jsonify([r.to_dict() for r in readings])

@app.route('/api/books/by-barcode/<string:barcode>', methods=['GET'])
@admin_required
def get_book_by_barcode(current_user, barcode):
    book = Book.query.filter_by(barcode=barcode).first()
    if not book:
        return jsonify({'error': 'Book not found for this barcode'}), 404
    return jsonify(book.to_dict())

@app.route('/api/check-in', methods=['POST']) # Check-in means loaning TO a student
@admin_required
def check_in_book(current_user):
    data = request.get_json()
    student_id = data.get('studentId')
    book_id = data.get('bookId')

    if not student_id or not book_id:
        return jsonify({'error': 'Student ID and Book ID are required'}), 400

    user = User.query.filter_by(student_id=student_id).first()
    if not user:
        return jsonify({'error': 'Student not found'}), 404

    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    if book.status != 'available':
        return jsonify({'error': 'Book is already borrowed'}), 409

    # Create a new reading record
    due_date = datetime.utcnow() + timedelta(days=14)
    new_read = UserRead(user_id=user.id, book_id=book.id, due_date=due_date)
    
    # Update book status
    book.status = 'borrowed'
    
    db.session.add(new_read)
    db.session.commit()

    return jsonify({'message': 'Book checked in successfully', 'reading': new_read.to_dict()}), 201

@app.route('/api/check-out', methods=['POST']) # Check-out means student returns a book
@admin_required
def check_out_book(current_user):
    data = request.get_json()
    book_id = data.get('bookId')

    if not book_id:
        return jsonify({'error': 'Book ID is required'}), 400

    book = Book.query.get_or_404(book_id)
    if book.status != 'borrowed':
        return jsonify({'error': 'Book is not currently borrowed'}), 409

    reading = UserRead.query.filter_by(book_id=book.id, status='current').first_or_404()
    reading.status = 'completed'
    reading.completion_date = datetime.utcnow()
    book.status = 'available'
    
    db.session.commit()
    return jsonify({'message': 'Book checked out successfully', 'reading': reading.to_dict()})

# --- Review API Routes ---

@app.route('/api/reviews', methods=['GET'])
@admin_required
def get_all_reviews(current_user):
    reviews = Review.query.order_by(Review.timestamp.desc()).all()
    return jsonify([review.to_dict() for review in reviews])

@app.route('/api/reviews/<int:review_id>/like', methods=['POST'])
@admin_required
def toggle_like_review(current_user, review_id):
    review = Review.query.get_or_404(review_id)
    
    # Check if the admin has already liked this review
    if current_user in review.likes:
        # Admin has liked it, so unlike it
        review.likes.remove(current_user)
        db.session.commit()
        return jsonify({'message': 'Like removed', 'review': review.to_dict()})
    else:
        # Admin has not liked it, so like it
        review.likes.append(current_user)
        db.session.commit()
        return jsonify({'message': 'Review liked', 'review': review.to_dict()})

@app.route('/api/reviews', methods=['POST'])
@token_required # Allow any logged-in user to post a review
def post_review(current_user):
    data = request.get_json()
    book_id = data.get('bookId')
    review_text = data.get('reviewText')

    if not book_id or not review_text:
        return jsonify({'error': 'Book ID and review text are required'}), 400

    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404

    new_review = Review(book_id=book_id, user_id=current_user.id, review_text=review_text)
    db.session.add(new_review)
    db.session.commit()

    return jsonify(new_review.to_dict()), 201

# --- Static File Serving for Images ---

@app.route('/uploads/images/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- Main Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
