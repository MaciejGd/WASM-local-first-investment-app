FROM mcr.microsoft.com/playwright:v1.50.0-noble

WORKDIR /playwright

# install dependencies
COPY pakcage*.json ./

RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]