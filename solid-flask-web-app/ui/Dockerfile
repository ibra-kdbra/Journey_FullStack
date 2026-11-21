FROM node:26-slim AS build

# The Cypress binary is only needed for e2e tests, not for the production build.
ENV CYPRESS_INSTALL_BINARY=0

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build


FROM nginx:1

COPY --from=build /app/dist /usr/share/nginx/html
