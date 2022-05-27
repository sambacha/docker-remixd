# syntax=docker/dockerfile-upstream:master-experimental
FROM node:14.18.2-bullseye-slim

ENV LC_ALL=en_US.UTF-8

USER root

RUN RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates git curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g @remix-project/remixd

RUN sed -i s/127.0.0.1/0.0.0.0/g /usr/local/lib/node_modules/\@remix-project/remixd/websocket.js


COPY origins.json /usr/local/lib/node_modules/\@remix-project/remixd/

EXPOSE 65520 8080 8000 65522

ENTRYPOINT ["/usr/local/bin/remixd", "-s", "/app"]
