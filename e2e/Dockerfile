FROM mcr.microsoft.com/playwright:v1.62.0-noble

WORKDIR /playwright

# install dependencies
COPY package*.json ./
# we need to install build essentials to get node deps
RUN apt-get update && apt-get install -y build-essential python3

RUN npm ci
COPY . .

# CMD ["npx", "playwright", "test"]
# CMD sh -c "npx playwright test --project=chromium; tail -f /dev/null"
CMD sh -c 'echo "Skip testing"; tail -f /dev/null'