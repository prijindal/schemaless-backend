FROM node:22

ENV NODE_ENV=production

WORKDIR /app

USER node

COPY --chown=node:node package* /app/
COPY --chown=node:node node_modules /app/node_modules

COPY --chown=node:node dist /app/dist

CMD [ "node", "dist/index.js"]
