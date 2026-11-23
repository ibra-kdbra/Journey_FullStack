#!/usr/bin/sh
if [ ! -f ./config.env ]; then
  echo "config.env not found. Copy config.env.example to config.env and edit it first." >&2
  exit 1
fi
docker-compose --env-file ./config.env up -d --build --force-recreate
