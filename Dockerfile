FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

USER node

COPY --chown=node:node package* /app/
COPY --chown=node:node node_modules /app/node_modules

COPY --chown=node:node dist/src /app/dist
COPY --chown=node:node build /app/build

CMD [ "node", "dist/index.js"]