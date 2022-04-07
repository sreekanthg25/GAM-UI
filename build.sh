#!/bin/bash

npm i && npm run build
echo "build successfull"

echo "docker build"

SERVICE_NAME="gam-ui"
REGISTRY_HOST_NAME="gcr.io"
PROJECT_ID="strategic-team-337809"
SOURCE_IMAGE="${SERVICE_NAME}"
TARGET_IMAGE_PATH="${REGISTRY_HOST_NAME}/${PROJECT_ID}/${SOURCE_IMAGE}"

dockerPush() {
  docker build --force-rm -t $SOURCE_IMAGE .
  
  docker tag $SOURCE_IMAGE $TARGET_IMAGE_PATH
  docker push $TARGET_IMAGE_PATH
  echo "image pushed to ${TARGET_IMAGE_PATH}"
}

dockerPush