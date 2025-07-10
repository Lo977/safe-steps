from config import db, bcrypt
from flask_login import UserMixin, current_user
from flask_marshmallow import Marshmallow
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields

ma = Marshmallow()

# ===========================
# Models
# ===========================

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False, unique=True)
    _password_hash = db.Column('password', db.String(128), nullable=False)

    support_logs = db.relationship('SupportLog', backref='user', cascade="all, delete")

    @property
    def password(self):
        raise AttributeError("Password is write-only")

    @password.setter
    def password(self, raw_password):
        self._password_hash = bcrypt.generate_password_hash(raw_password).decode('utf-8')

    def check_password(self, raw_password):
        return bcrypt.check_password_hash(self._password_hash, raw_password)

    @property
    def resources(self):
        return sorted({log.resource for log in self.support_logs}, key=lambda r: r.name.lower())

    @property
    def urgency_levels(self):
        return sorted({log.urgency_level for log in self.support_logs}, key=lambda u: u.level.lower())


class SupportLog(db.Model):
    __tablename__ = 'support_logs'

    id = db.Column(db.Integer, primary_key=True)
    notes = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    resource_id = db.Column(db.Integer, db.ForeignKey('resources.id'), nullable=False)
    urgency_level_id = db.Column(db.Integer, db.ForeignKey('urgency_levels.id'), nullable=False)


class Resource(db.Model):
    __tablename__ = 'resources'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    type = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(150))
    phone_number = db.Column(db.String(20))

    support_logs = db.relationship('SupportLog', backref='resource', cascade="all, delete")


class UrgencyLevel(db.Model):
    __tablename__ = 'urgency_levels'

    id = db.Column(db.Integer, primary_key=True)
    level = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(150))

    support_logs = db.relationship('SupportLog', backref='urgency_level', cascade="all, delete")

# ===========================
# Schemas
# ===========================

def filter_user_logs(logs):
    return [log for log in logs if log.user_id == current_user.id]


class SupportLogSchemaSlim(SQLAlchemyAutoSchema):
    class Meta:
        model = SupportLog

    resource = fields.Nested(lambda: ResourceSchema(only=("id", "name")))
    urgency_level = fields.Nested(lambda: UrgencyLevelSchema(only=("id", "level")))


class ResourceSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Resource

    support_logs = fields.Method("get_user_logs")

    def get_user_logs(self, obj):
        return SupportLogSchemaSlim(many=True).dump(filter_user_logs(obj.support_logs))


class UrgencyLevelSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = UrgencyLevel

    support_logs = fields.Method("get_user_logs")

    def get_user_logs(self, obj):
        return SupportLogSchemaSlim(many=True).dump(filter_user_logs(obj.support_logs))


class SupportLogSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = SupportLog

    resource = fields.Nested(ResourceSchema)
    urgency_level = fields.Nested(UrgencyLevelSchema)
    user = fields.Nested(lambda: UserSchema(only=("id", "name")))


class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        exclude = ("_password_hash",)

    
    resources = fields.Method("get_resources")
    urgency_levels = fields.Method("get_urgency_levels")

    def get_resources(self, obj):
        return ResourceSchema(many=True).dump(obj.resources)

    def get_urgency_levels(self, obj):
        return UrgencyLevelSchema(many=True).dump(obj.urgency_levels)
