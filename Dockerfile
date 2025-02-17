FROM oven/bun

ENV NODE_ENV=production

WORKDIR /app

USER node

COPY --chown=node:node package* /app/
COPY --chown=node:node node_modules /app/node_modules

COPY --chown=node:node src /app/src

EXPOSE 3000/tcp
CMD [ "bun", "run", "src/index.ts"]
