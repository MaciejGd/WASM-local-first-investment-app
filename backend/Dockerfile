# testing dockerfile
FROM python:3.10-slim

WORKDIR /inv_app

COPY . .

RUN pip install -r requirements.txt
CMD ["gunicorn", "-b", "0.0.0.0:5000", "inv_app:create_app()"]



