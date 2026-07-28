# testing dockerfile
FROM python:3.10-slim

WORKDIR /inv_app

COPY . .

RUN pip install -r requirements.txt

RUN chmod 770 /inv_app/docker_init.sh
CMD ["/inv_app/docker_init.sh"]



