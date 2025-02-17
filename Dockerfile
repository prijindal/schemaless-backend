FROM oven/bun:latest

ENV NODE_ENV=production

WORKDIR /app

USER bun

COPY --chown=bun:bun package* /app/
COPY --chown=bun:bun node_modules /app/node_modules

COPY --chown=bun:bun src /app/src

EXPOSE 3000/tcp
CMD [ "bun", "run", "src/index.ts"]
