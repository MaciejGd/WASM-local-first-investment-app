import pytest

import os

from inv_app import create_app


@pytest.fixture
def config_file(tmp_path):
    instance = tmp_path / "instance"
    file = instance / "config.py"
    file.write_text('DATABASE="test.db"')
    return file


def test_create_app_config_set():
    test_config = {"TESTING": True, "DATABASE": "test.db"}
    app = create_app(test_config)
    assert app.config["TESTING"]
    assert app.config["DATABASE"] == "test.db"


def test_create_app_default_mapping():
    app = create_app()
    expected_db = os.path.join(app.instance_path, "application.sqlite")
    assert app.config["SECRET_KEY"] == "dev"
    assert app.config["DATABASE"] == expected_db


def test_create_app_from_file(monkeypatch, tmp_path):
    instance = tmp_path / "instance"
    instance.mkdir()
    file = instance / "config.py"
    file.write_text('DATABASE="test.db"')
    # set current working dir
    monkeypatch.chdir(instance)
    app = create_app(instance_path=instance)
    assert app.config["DATABASE"] == "test.db"
