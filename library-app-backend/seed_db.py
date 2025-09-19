import json
import os
from app import app, db, bcrypt
from models import Book, User, Review, UserRead

def seed_database():
    # Ensure the instance folder exists before doing anything else.
    os.makedirs(app.instance_path, exist_ok=True)

    with app.app_context():
        # Drop all tables and recreate them (for a fresh start)
        db.drop_all()
        db.create_all()

        # --- Seed Books ---
        try:
            with open('books.json', 'r') as f:
                books_data = json.load(f)
            
            for book_data in books_data:
                new_book = Book(
                    title=book_data['title'],
                    author=book_data['author'],
                    description=book_data['description'],
                    image_filename=book_data.get('image_filename'),
                    genre=book_data.get('genre'),
                    language=book_data.get('language'),
                    barcode=book_data.get('barcode')
                )
                db.session.add(new_book)
            print("Books seeded successfully.")
        except Exception as e:
            print(f"Could not seed books: {e}")

        # --- Seed a Default Admin User ---
        admin_username = 'admin'
        if not User.query.filter_by(username=admin_username).first():
            hashed_password = bcrypt.generate_password_hash('admin').decode('utf-8')
            admin_user = User(username=admin_username, password_hash=hashed_password, role='admin', student_id='ADMIN001')
            db.session.add(admin_user)
            print(f"Default admin user '{admin_username}' created with password 'admin'.")

        # Commit all changes
        db.session.commit()
        print("Database seeding complete.")

if __name__ == '__main__':
    seed_database()
