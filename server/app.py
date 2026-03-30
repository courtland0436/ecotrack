import os
from flask import Flask, make_response, jsonify, request, session
from flask_migrate import Migrate
from flask_cors import CORS
from sqlalchemy import text
from models import db, User, System, Task, bcrypt

app = Flask(__name__)
app.secret_key = b'\x17\xda\x02\x95\x89\xdbvH\xce\x1e\x12\x8f\x8d\x8d\xf5\x0c' 

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(BASE_DIR, 'instance', 'ecotrack.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False 

db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)
CORS(app)

def create_starter_data(user_id):
    hvac = System(name="HVAC Unit", user_id=user_id)
    kitchen = System(name="Kitchen Appliances", user_id=user_id)
    db.session.add_all([hvac, kitchen])
    db.session.commit() 

    db.session.add_all([
        Task(name="Replace Air Filter", system_id=hvac.id, service_date="2026-04-01"),
        Task(name="Flush Water Heater", system_id=hvac.id, service_date="2026-09-15"),
        Task(name="Clean Refrigerator Coils", system_id=kitchen.id, service_date="2026-06-20")
    ])
    db.session.commit()

def get_diy_advice(task_name):
    name = task_name.lower()
    smart_tips = {
        "hvac": "Change your air filters every 90 days to reduce energy bills.",
        "filter": "Write the installation date on your new filter.",
        "plumbing": "Avoid chemical drain cleaners; they can corrode older pipes.",
        "leak": "A leaky faucet can waste over 3,000 gallons of water a year.",
        "battery": "Change smoke detector batteries every 6 months.",
        "garden": "Water your lawn before 10 AM to prevent evaporation.",
        "electrical": "Always turn off the breaker—not just the switch.",
        "outlet": "If an outlet feels warm to the touch, stop using it immediately.",
        "roof": "Check your attic for water stains after a heavy storm.",
        "gutter": "Keep gutters clear to prevent 'ice dams' in winter.",
        "pest": "Seal cracks around windows and doors with caulk.",
        "floor": "Never use a soaking wet mop on hardwood floors.",
        "paint": "Remove painter's tape while the paint is still slightly tacky."
    }
    for keyword, tip in smart_tips.items():
        if keyword in name: return tip
    return "Great job staying on top of your maintenance!"

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    try:
        # Check if user already exists
        if User.query.filter_by(email=data.get('email')).first():
            return make_response(jsonify({"error": "User already exists"}), 422)

        new_user = User(email=data.get('email'))
        new_user.password_hash = data.get('password')
        db.session.add(new_user)
        db.session.commit()
        
        create_starter_data(new_user.id)
        
        session['user_id'] = new_user.id
        return make_response(jsonify(new_user.to_dict()), 201)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"error": "Could not create account"}), 422)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and user.authenticate(data.get('password')):
        session['user_id'] = user.id
        return make_response(jsonify(user.to_dict()), 200)
    return make_response(jsonify({"error": "Invalid email or password"}), 401)

@app.route('/logout', methods=['DELETE'])
def logout():
    session.pop('user_id', None)
    return {}, 204

@app.route('/check_session')
def check_session():
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            return make_response(jsonify(user.to_dict()), 200)
    return {}, 401

@app.route('/systems', methods=['GET', 'POST'])
def handle_systems():
    user_id = session.get('user_id')
    if not user_id:
        return {"error": "Unauthorized"}, 401
    
    if request.method == 'GET':
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 6, type=int)
        search_term = request.args.get('search', '', type=str)
        
        query = System.query.filter_by(user_id=user_id)
        if search_term:
            query = query.filter(System.name.ilike(f"%{search_term}%"))
            
        paginated_systems = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return make_response(jsonify({
            "systems": [s.to_dict() for s in paginated_systems.items],
            "total_pages": paginated_systems.pages,
            "current_page": paginated_systems.page,
            "has_next": paginated_systems.has_next,
            "has_prev": paginated_systems.has_prev
        }), 200)

    elif request.method == 'POST':
        data = request.get_json()
        new_system = System(name=data.get('name'), user_id=user_id)
        db.session.add(new_system)
        db.session.commit()
        return make_response(jsonify(new_system.to_dict()), 201)

@app.route('/reset', methods=['POST'])
def reset_app():
    user_id = session.get('user_id')
    if not user_id:
        return make_response(jsonify({"error": "Unauthorized"}), 401)
    try:
        user_systems = System.query.filter_by(user_id=user_id).all()
        for s in user_systems:
            db.session.delete(s)
        db.session.commit()

        create_starter_data(user_id)
        
        query = System.query.filter_by(user_id=user_id)
        paginated = query.paginate(page=1, per_page=6, error_out=False)
        return make_response(jsonify({
            "systems": [s.to_dict() for s in paginated.items],
            "total_pages": paginated.pages,
            "current_page": 1
        }), 200)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"error": str(e)}), 500)

@app.route('/tasks', methods=['POST'])
def create_task():
    user_id = session.get('user_id')
    data = request.get_json()
    
    system = System.query.filter_by(id=data.get('system_id'), user_id=user_id).first()
    if not system:
        return {"error": "Unauthorized system access"}, 403

    new_task = Task(
        name=data.get('name'), 
        system_id=data.get('system_id'), 
        service_date=data.get('service_date'),
        completed=False
    )
    db.session.add(new_task)
    db.session.commit()
    return make_response(jsonify(new_task.to_dict()), 201)

@app.route('/tasks/<int:id>', methods=['PATCH', 'DELETE'])
def handle_task_item(id):
    user_id = session.get('user_id')
    task = Task.query.get(id)
    if not task: return make_response(jsonify({"error": "Not found"}), 404)
    
    if task.system.user_id != user_id:
        return {"error": "Unauthorized"}, 403
    
    if request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return {}, 204
    
    data = request.get_json()
    if 'completed' in data:
        task.completed = data.get('completed')
    
    db.session.commit()
    resp_dict = task.to_dict()
    if task.completed:
        resp_dict['advice'] = get_diy_advice(task.name)
        
    return make_response(jsonify(resp_dict), 200)

@app.route('/systems/<int:id>', methods=['DELETE'])
def delete_system(id):
    user_id = session.get('user_id')
    system = System.query.filter_by(id=id, user_id=user_id).first()
    if not system: return {"error": "Not found or Unauthorized"}, 404
    
    db.session.delete(system)
    db.session.commit()
    return {}, 204

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(port=5555, debug=True)