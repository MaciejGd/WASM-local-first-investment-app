FROM mcr.microsoft.com/playwright:v1.62.0-noble

WORKDIR /playwright

# install dependencies
COPY package*.json ./

RUN npm ci
COPY . .

# CMD ["npx", "playwright", "test"]
CMD sh -c "npx playwright test; tail -f /dev/null"