# syntax=docker/dockerfile-upstream:master-experimental
FROM node:16.17.1-buster-slim

USER root

RUN set -eux; \
	apt-get update; \
	DEBIAN_FRONTEND=noninteractive apt-get install -qqy --assume-yes --no-install-recommends git ca-certificates curl; \
	apt-get clean; \
	rm -rf /var/lib/apt/lists/*;

RUN npm install -g @remix-project/remixd@0.6.6 && npm cache clean --force

RUN sed -i s/127.0.0.1/0.0.0.0/g /usr/local/lib/node_modules/@remix-project/remixd/src/websocket.js

COPY origins.json /usr/local/lib/node_modules/\@remix-project/remixd/

# 65522 = Hardhat
# 65520 = Remixd 
# 65525 = Foundry

EXPOSE 65520 8080 8000 65522 65525

STOPSIGNAL SIGQUIT

#CMD [ "node", "--max-old-space-size=768", "/usr/local/bin/remixd" ]

ENTRYPOINT ["/usr/local/bin/remixd", "-s", "/app"]

LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.name="Remixd" \
      org.label-schema.description="Remixd Toolchain" \
      org.label-schema.url="https://github.com/sambacha/docker-remixd" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url="https://github.com/sambacha/docker-remixd.git" \
      org.label-schema.vendor="Ethereum" \
      org.label-schema.version=$VERSION \
      org.label-schema.schema-version="1.0"
