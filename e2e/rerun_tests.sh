#!/usr/bin/bash

# COPY all tests to playwright docker container
# this allows us to run tests changes without calling docker compose up --build which is time expensive
playwright_container=$(docker ps --format "table {{.Names}}" | grep "playwright")

function copy_test() {
    docker cp $1 $playwright_container:/playwright/tests/
}

# find all playwright testcases in current directory, excluding files from node_modules
test_files=$(find . \
  -path "*/node_modules" -prune -o \
  -type f -name "*.spec.js" -print)
echo "Found test files: $test_files"

# copy test files to the docker container
for item in $test_files; do
    echo "Copying file $item test files to playwright container: $playwright_container"
    copy_test $item
done

# rerun tests
docker exec $playwright_container npx playwright test --project=chromium