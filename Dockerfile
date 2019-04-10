FROM node:10-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN mkdir -p /home/node/app/node_modules && \
    chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY --chown=node:node . .

RUN npm install

EXPOSE 8000

CMD [ "npm", "start" ]
