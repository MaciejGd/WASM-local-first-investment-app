#!/bin/bash

set -e

echo "Restoring mongo-db from dump"

mongorestore --db StockData /docker-entrypoint-initdb.d/dump/StockData

echo "MongoDB restored"
