#!/bin/bash

if [ $DATABASE_PATH ]; then
    echo "Removing old db from path $DATABASE_PATH";
    rm -rf "$DATABASE_PATH"
fi

# create a new sqlite3 db
flask --app inv_app init-db

# host backend with gunicorn
gunicorn -b 0.0.0.0:5000 'inv_app:create_app()'
