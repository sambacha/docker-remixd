# syntax=docker/dockerfile:1
FROM node:15

USER root
RUN apt-get update && apt-get install -y git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/lib/node_modules/@remix-project/remixd
WORKDIR /usr/local/lib/node_modules/@remix-project/remixd
COPY package/ /usr/local/lib/node_modules/@remix-project/remixd
RUN npm install
RUN npm run build
RUN chmod +x /usr/local/lib/node_modules/@remix-project/remixd/out-tsc/bin/remixd.js

RUN sed -i s/127.0.0.1/0.0.0.0/g /usr/local/lib/node_modules/\@remix-project/remixd/out-tsc/websocket.js

COPY origins.json /usr/local/lib/node_modules/\@remix-project/remixd/out-tsc

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/remixd", "-s", "/app"]