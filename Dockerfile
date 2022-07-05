# syntax=docker/dockerfile-upstream:master-experimental
FROM node:14.19.3-bullseye

ENV LC_ALL=en_US.UTF-8

USER root

# save list of currently installed packages for later so we can clean up
RUN set -eux; \
	savedAptMark="$(apt-mark showmanual)"; \
	apt-get update; \
    DEBIAN_FRONTEND=noninteractive apt-get install -qqy --assume-yes --no-install-recommends \
    ca-certificates \
    git \
    curl; \
    apt-get clean; \
	rm -rf /var/lib/apt/lists/*; \
	apt-mark auto '.*' > /dev/null; \
	[ -z "$savedAptMark" ] || apt-mark manual $savedAptMark; \
	apt-get purge -y -qq --auto-remove -o APT::AutoRemove::RecommendsImportant=false;

RUN npm install -g @remix-project/remixd

RUN sed -i s/127.0.0.1/0.0.0.0/g /usr/local/lib/node_modules/\@remix-project/remixd/websocket.js

COPY origins.json /usr/local/lib/node_modules/\@remix-project/remixd/

EXPOSE 65520 8080 8000 65522

STOPSIGNAL SIGQUIT


ENTRYPOINT ["/usr/local/bin/remixd", "-s", "/app"]

LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.name="Remixd" \
      org.label-schema.description="Remixd Toolchain" \
      org.label-schema.url="https://ggithub.com/sambacha/docker-remixd" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url="https://github.com/sambacha/docker-remixd.git" \
      org.label-schema.vendor="CommodityStream, Inc" \
      org.label-schema.version=$VERSION \
      org.label-schema.schema-version="1.0"
