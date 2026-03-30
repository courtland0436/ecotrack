from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy_serializer import SerializerMixin
from flask_bcrypt import Bcrypt

metadata = MetaData(naming_convention={
    "ix": "ix_%(column_0_label)s",
    "cq": "cq_%(table_name)s_%(constraint_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
})

db = SQLAlchemy(metadata=metadata)
bcrypt = Bcrypt()

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)
    
    # Relationship with cascade to clean up systems if a user is deleted
    systems = db.relationship('System', back_populates='user', cascade='all, delete-orphan')
    
    serialize_rules = ('-_password_hash', '-systems.user',)

    @hybrid_property
    def password_hash(self):
        # Raising an error prevents the hash from being accidentally read/leaked
        raise AttributeError('Password hashes may not be viewed.')

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))


class System(db.Model, SerializerMixin):
    __tablename__ = 'systems'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    user = db.relationship('User', back_populates='systems')
    
    # CRITICAL: This cascade ensures Tasks are wiped when the System is deleted
    tasks = db.relationship('Task', back_populates='system', cascade='all, delete-orphan')
    
    serialize_rules = ('-user', '-tasks.system',)


class Task(db.Model, SerializerMixin):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    service_date = db.Column(db.String) 
    system_id = db.Column(db.Integer, db.ForeignKey('systems.id'))
    
    system = db.relationship('System', back_populates='tasks')
    
    serialize_rules = ('-system',)