FROM node:14.17.6-alpine3.13 AS builder

WORKDIR /app

RUN apk add --no-cache git python make g++

COPY package*.json ./

RUN npm install

# Production container
FROM node:14-stretch-slim

WORKDIR /app

COPY . /app

COPY --from=builder /app/node_modules /app/node_modules

RUN npm run compile

ENTRYPOINT ["npm", "run"]

CMD ["deploy", "--", "--f", "2"]
