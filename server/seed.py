from app import app
from models import db, User, System, Task

def seed_database():
    with app.app_context():
        print("Emptying database...")
        # Deleting in this order prevents Foreign Key errors
        Task.query.delete()
        System.query.delete()
        User.query.delete()

        print("Creating a test user...")
        u1 = User(email="test@example.com")
        # Uses your Bcrypt setter in models.py to hash correctly
        u1.password_hash = "password123" 
        db.session.add(u1)
        db.session.commit()

        print("Creating household systems...")
        s1 = System(name="HVAC Unit", user_id=u1.id)
        s2 = System(name="Kitchen Appliances", user_id=u1.id)
        db.session.add_all([s1, s2])
        db.session.commit()

        print("Adding maintenance tasks...")
        db.session.add_all([
            Task(name="Replace Air Filter", system_id=s1.id, service_date="2026-04-01"),
            Task(name="Flush Water Heater", system_id=s1.id, service_date="2026-09-15"),
            Task(name="Clean Refrigerator Coils", system_id=s2.id, service_date="2026-06-20")
        ])
        db.session.commit()

        print("Database successfully seeded!")
        print("Login with: test@example.com / password123")

if __name__ == '__main__':
    seed_database()