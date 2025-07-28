FROM node:20-slim

WORKDIR /app

COPY package*.json ./

COPY apps/indexer/package*.json ./apps/indexer/

RUN npm ci --omit=dev

COPY apps/indexer ./apps/indexer
COPY packages ./packages

WORKDIR /app/apps/indexer
RUN npm run build

CMD ["node", "dist/index.js"]