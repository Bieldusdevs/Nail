FROM node:22.19.0-alpine AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm ci --ignore-scripts

FROM node:22.19.0-alpine AS build
WORKDIR /workspace
COPY --from=dependencies /workspace/node_modules ./node_modules
COPY --from=dependencies /workspace/apps/web/node_modules ./apps/web/node_modules
COPY apps/web apps/web
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_DEMO_MODE=false
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_DEMO_MODE=$NEXT_PUBLIC_DEMO_MODE NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=@lume/web

FROM node:22.19.0-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S web && adduser -S -G web -u 10001 web
COPY --from=build --chown=web:web /workspace/apps/web/.next/standalone ./
COPY --from=build --chown=web:web /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=web:web /workspace/apps/web/public ./apps/web/public
USER 10001
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
