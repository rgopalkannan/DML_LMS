# API image. Build from the repository root: docker build -f server/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --workspace server --include-workspace-root=false
COPY server server
RUN npm run build -w server && npm prune --omit=dev --workspace server

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/server/prisma server/prisma
COPY --from=build /app/server/package.json server/
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/api/v1/health || exit 1
CMD ["sh", "-c", "cd server && npx prisma migrate deploy && node dist/main.js"]
