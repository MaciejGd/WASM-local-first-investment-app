import os

from flask import Flask, jsonify
from flask_cors import CORS


def create_app(test_config=None, instance_path=None):
    # create and configure app instance
    app = Flask(__name__, instance_relative_config=True, instance_path=instance_path)
    # get mongo db url, from the environment variables
    mongo_db = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
    db_path = os.getenv(
        "DATABASE_PATH", os.path.join(app.instance_path, "application.sqlite")
    )

    app.config.from_mapping(
        SECRET_KEY="dev",
        SESSION_COOKIE_SAMESITE="None",
        SESSION_COOKIE_SECURE=True,
        DATABASE=db_path,
        MONGO_URI=mongo_db,
    )
    # load init configuration of the app
    if test_config is None:
        app.config.from_pyfile("config.py", silent=True)
    else:
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)

    # init main database
    from . import db

    db.init_app(app)

    # example, testing endpoint
    @app.route("/api/health")
    def health():
        return jsonify({"health": "ok"})

    # init authentication module
    from .endpoints import auth

    app.register_blueprint(auth.bp)

    # init finance api
    from .endpoints import finance

    app.register_blueprint(finance.bp)

    # register sync endpoints
    from .endpoints import sync

    app.register_blueprint(sync.bp)

    # register CORS so that react app can access server
    CORS(
        app,
        origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        supports_credentials=True,
    )

    return app
