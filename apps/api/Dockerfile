# -------- build stage --------
FROM node:20-alpine AS build

# Install curl and bash, then Bun
RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

WORKDIR /app

# Copy the entire workspace for proper dependency resolution
COPY . .

# Install dependencies for the entire workspace
RUN bun install --frozen-lockfile

# Generate Prisma client and build the API
RUN cd apps/api && bun run db:generate
RUN cd apps/api && bun run build

# -------- runtime stage --------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy the built application
COPY --from=build /app/apps/api/dist ./dist

# Copy package files and production node_modules
COPY --from=build /app/apps/api/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/prisma ./prisma

# Copy shared packages that the dist code imports
COPY --from=build /app/packages ./packages

EXPOSE 3333
CMD ["node", "dist/src/main.js"]
