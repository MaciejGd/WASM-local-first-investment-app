import os 
from flask import Flask, jsonify
from flask_cors import CORS

def create_app(test_config=None):
    # create and configure app instance
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'application.sqlite') # TODO, change that with some proxy etc.
    )
    # load init configuration of the app
    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)

    from . import db
    db.init_app(app)

    @app.route("/hello")
    def hello():
        return jsonify({"first" : "hello", "second" : "world"})
    
    from . import auth
    app.register_blueprint(auth.bp)

    # register CORS so that react app can access server
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    return app