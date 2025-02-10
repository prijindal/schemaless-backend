FROM node:22-alpine

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

WORKDIR /app

USER node

COPY --chown=node:node package* /app/
COPY --chown=node:node node_modules /app/node_modules

COPY --chown=node:node dist /app/dist

CMD [ "dumb-init", "node", "dist/index.js"]
