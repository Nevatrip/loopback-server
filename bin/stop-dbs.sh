#!/bin/bash
MONGO_CONTAINER_NAME="mongodb_anytrip"
REDIS_CONTAINER_NAME="redis_anytrip"
docker rm -f $MONGO_CONTAINER_NAME $REDIS_CONTAINER_NAME


