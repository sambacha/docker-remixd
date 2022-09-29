#!/usr/bin/env bash

DOCKER_BUILDKIT=1 docker build -t sambacha/docker-remixd:latest .
sleep 1
exit 0
