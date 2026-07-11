format:
	ruff format ./inv_app ./tests

check:
	ruff check ./inv_app ./tests

test:
	pytest ./tests/unit/ ./tests/integration/


all:
	ruff check ./inv_app
	ruff format ./inv_app
	pytest ./tests
	pyright