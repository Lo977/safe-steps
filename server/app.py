from flask import request
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_restful import Resource
from datetime import date

from config import app, db, api
from models import (
    User, UserSchema,
    SupportLog, SupportLogSchema, SupportLogSchemaSlim,
    Resource as SupportResource, ResourceSchema,
    UrgencyLevel, UrgencyLevelSchema
)

CORS(app, supports_credentials=True)


login_manager = LoginManager()
login_manager.init_app(app)

@app.route('/')
def index():
    return '<h1>SafeSteps Server Running</h1>'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# =============================
# Authentication Routes
# =============================

class CheckSessionResource(Resource):
    def get(self):
        if current_user.is_authenticated:
            return UserSchema().dump(current_user), 200
        return {'message': 'Unauthorized'}, 401


class SignupResource(Resource):
    def post(self):
        data = request.get_json()
        name = data.get('name')
        password = data.get('password')

        if User.query.filter_by(name=name).first():
            return {'error': 'User already exists'}, 400

        new_user = User(name=name)
        new_user.password = password
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return UserSchema().dump(new_user), 201

class SigninResource(Resource):
    def post(self):
        data = request.get_json()
        name = data.get('name')
        password = data.get('password')

        user = User.query.filter_by(name=name).first()
        if user and user.check_password(password):
            login_user(user)
            return UserSchema().dump(user), 200
        return {'error': 'Invalid credentials'}, 401

class LogoutResource(Resource):
    @login_required
    def delete(self):
        logout_user()
        return {}, 204

# =============================
# Support Logs Resource
# =============================

class SupportLogResource(Resource):
    @login_required
    def get(self, log_id=None):
        if log_id is not None:
            log = SupportLog.query.get_or_404(log_id)
            if log.user_id != current_user.id:
                return {'error': 'Unauthorized'}, 403
            return SupportLogSchemaSlim().dump(log), 200  

        logs = SupportLog.query.filter_by(user_id=current_user.id).all()
        return SupportLogSchemaSlim(many=True).dump(logs), 200  

    @login_required
    def post(self):
        data = request.get_json()
        new_log = SupportLog(
            notes=data['notes'],
            date=date.today(),
            user_id=current_user.id,
            resource_id=data['resource_id'],
            urgency_level_id=data['urgency_level_id']
        )
        db.session.add(new_log)
        db.session.commit()
        return SupportLogSchema().dump(new_log), 201

    @login_required
    def patch(self, log_id):
        log = SupportLog.query.get_or_404(log_id)
        if log.user_id != current_user.id:
            return {'error': 'Unauthorized'}, 403

        data = request.get_json()
        log.notes = data.get('notes', log.notes)
        log.resource_id = data.get('resource_id', log.resource_id)
        log.urgency_level_id = data.get('urgency_level_id', log.urgency_level_id)

        db.session.commit()

       
        updated_log = SupportLog.query.get(log.id)

        return SupportLogSchema().dump(updated_log), 200

    @login_required
    def delete(self, log_id):
        log = SupportLog.query.get_or_404(log_id)
        if log.user_id != current_user.id:
            return {'error': 'Unauthorized'}, 403
        db.session.delete(log)
        db.session.commit()
        return {}, 204

# =============================
# Filtered Static Lists
# =============================

class ResourceListResource(Resource):
    @login_required
    def get(self):
       
        user_logs = SupportLog.query.filter_by(user_id=current_user.id).all()
        resource_ids = {log.resource_id for log in user_logs}
        resources = SupportResource.query.filter(SupportResource.id.in_(resource_ids)).all()
        return ResourceSchema(many=True).dump(resources), 200
    
class AllResourcesResource(Resource):
    @login_required
    def get(self):
        return ResourceSchema(many=True).dump(SupportResource.query.all()), 200




class UrgencyLevelListResource(Resource):
    @login_required
    def get(self):
        user_logs = SupportLog.query.filter_by(user_id=current_user.id).all()
        urgency_ids = {log.urgency_level_id for log in user_logs}
        levels = UrgencyLevel.query.filter(UrgencyLevel.id.in_(urgency_ids)).all()
        return UrgencyLevelSchema(many=True).dump(levels), 200

class AllUrgencyLevelsResource(Resource):
    @login_required
    def get(self):
        all_levels = UrgencyLevel.query.all()
        return UrgencyLevelSchema(many=True).dump(all_levels), 200


# =============================
# Route Registration
# =============================

api.add_resource(CheckSessionResource, '/check_session')
api.add_resource(SignupResource, '/signup')
api.add_resource(SigninResource, '/signin')
api.add_resource(LogoutResource, '/logout')
api.add_resource(SupportLogResource, '/logs', '/logs/<int:log_id>')
api.add_resource(ResourceListResource, '/resources')
api.add_resource(AllResourcesResource, '/all-resources', endpoint='all_resources')
api.add_resource(UrgencyLevelListResource, '/urgency-levels')
api.add_resource(AllUrgencyLevelsResource, '/all-urgency-levels')


if __name__ == '__main__':
    app.run(port=5555, debug=True)
