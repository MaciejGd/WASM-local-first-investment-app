make format:
	ruff format ./inv_app ./tests

make check:
	ruff check ./inv_app ./tests

make test:
	pytest ./tests/unit/


make all:
	ruff check ./inv_app
	ruff format ./inv_app
	pytest ./tests
	pyright