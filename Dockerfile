FROM node:20.16-alpine3.19 AS base

WORKDIR /build

COPY package*.json ./

FROM base AS dev

# Dev target includes nodemon for live reload.
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM base AS production

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]