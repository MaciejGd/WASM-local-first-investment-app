# build container
FROM node:20 AS build

# create /app dir and set as workdir in build container
WORKDIR /app

# copy packages json and install them in the container
COPY ./front-end/package*.json ./
RUN npm ci

# copy application files and build
COPY ./front-end .
RUN npm run build

# Runtime stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
