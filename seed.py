from app import app
from models import db, User, System, Task

with app.app_context():
    print("Deleting existing data...")
    # This clears the tables in the correct order to avoid foreign key errors
    Task.query.delete()
    System.query.delete()
    User.query.delete()

    print("Creating starter user...")
    # We create one user so the systems have someone to belong to
    user1 = User(email="student@flatiron.edu", password_hash="password123")
    db.session.add(user1)
    db.session.commit()

    print("Creating starter systems...")
    hvac = System(name="HVAC System", user_id=user1.id)
    plumbing = System(name="Plumbing & Water", user_id=user1.id)
    db.session.add_all([hvac, plumbing])
    db.session.commit()

    print("Creating starter tasks...")
    tasks = [
        Task(name="Change Air Filter", system_id=hvac.id, completed=False),
        Task(name="Check Thermostat Batteries", system_id=hvac.id, completed=False),
        Task(name="Inspect P-Traps for leaks", system_id=plumbing.id, completed=False),
        Task(name="Flush Water Heater", system_id=plumbing.id, completed=False)
    ]
    
    db.session.add_all(tasks)
    db.session.commit()

    print("✅ Reset complete! Your app is back to its starter state.")