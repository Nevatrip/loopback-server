#!/bin/bash
MONGO_CONTAINER_NAME="mongodb_nevatrip"
REDIS_CONTAINER_NAME="redis_nevatrip"
docker rm -f $MONGO_CONTAINER_NAME $REDIS_CONTAINER_NAME


