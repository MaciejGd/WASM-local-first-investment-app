FROM mongo:7


# official mongo image already knows that it will execute everything on first init
COPY dump /docker-entrypoint-initdb.d/dump
COPY init.sh /docker-entrypoint-initdb.d/init.sh
RUN chmod +x /docker-entrypoint-initdb.d/init.sh

