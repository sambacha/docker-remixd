# syntax=docker/dockerfile-upstream:master-experimental
FROM node:16.17.0-bullseye-slim

ENV LC_ALL=en_US.UTF-8

USER root

RUN set -eux; \
	savedAptMark="$(apt-mark showmanual)"; \
	apt-get update; \
        DEBIAN_FRONTEND=noninteractive apt-get install -qqy --assume-yes --no-install-recommends \
	ca-certificates \
        curl; \
	apt-get clean; \
	rm -rf /var/lib/apt/lists/*; \
	apt-mark auto '.*' > /dev/null; \
	[ -z "$savedAptMark" ] || apt-mark manual $savedAptMark; \
	apt-get purge -y -qq --auto-remove -o APT::AutoRemove::RecommendsImportant=false;

ENV LANG=en_US.UTF-8 
ENV LANGUAGE=en_US:en 
ENV LC_ALL=en_US.UTF-8

RUN yes | adduser --disabled-password remix && mkdir -p /app
USER remix
WORKDIR /home/remix


RUN npm install -g @remix-project/remixd@0.6.5

RUN sed -i s/127.0.0.1/0.0.0.0/g /usr/local/lib/node_modules/\@remix-project/remixd/websocket.js

COPY origins.json /usr/local/lib/node_modules/\@remix-project/remixd/

EXPOSE 65520 8080 8000 65522

STOPSIGNAL SIGQUIT

ENTRYPOINT ["/usr/local/bin/remixd", "-s", "/app"]

LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.name="Remixd" \
      org.label-schema.description="Remixd Toolchain" \
      org.label-schema.url="https://github.com/sambacha/docker-remixd" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url="https://github.com/sambacha/docker-remixd.git" \
      org.label-schema.vendor="CommodityStream, Inc" \
      org.label-schema.version=$VERSION \
      org.label-schema.schema-version="1.0"
