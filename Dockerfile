ARG BUILD_IMAGE=node:22
ARG PRODUCTION_IMAGE=node:22-slim

# All dependencies stage
FROM $BUILD_IMAGE AS dependencies
WORKDIR /app
ADD package.json package-lock.json ./
RUN npm ci

# Build stage
FROM dependencies AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules /app/node_modules
ADD . .
RUN node ace build
RUN npm prune --omit=dev

# Production stage
FROM $PRODUCTION_IMAGE
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

# Note: Chromium installation temporarily disabled for faster deployments
# PDF generation will be re-enabled once deployment is stable

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build .
EXPOSE 8080
CMD ["node", "./bin/server.js"]