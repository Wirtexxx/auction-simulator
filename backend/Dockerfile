# -------------------------------
# Base stage with Node and pnpm
# -------------------------------
    FROM node:23.11.1-alpine AS base

    # pnpm setup
    ENV PNPM_HOME="/pnpm"
    ENV PATH="$PNPM_HOME:$PATH"
    RUN corepack enable
    
    WORKDIR /app
    
    # -------------------------------
    # Dev stage - all dependencies
    # -------------------------------
    FROM base AS dev
    COPY package.json pnpm-lock.yaml ./
    # Install all dependencies (including dev)
    RUN pnpm install --frozen-lockfile --ignore-scripts
    # Copy source code
    COPY . .
    # Expose port for dev server
    EXPOSE 8080
    # Command for development
    CMD ["pnpm", "run", "start:dev"]
    
    # -------------------------------
    # Production dependencies stage
    # -------------------------------
    FROM base AS prod-deps
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --prod --frozen-lockfile --ignore-scripts
    
    # -------------------------------
    # Build stage - for production
    # -------------------------------
    FROM base AS build
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile --ignore-scripts
    COPY . .
    RUN pnpm run build
    
    # -------------------------------
    # Production runner stage
    # -------------------------------
    FROM node:23.11.1-alpine AS runner
    WORKDIR /app
    
    # Copy production dependencies and build output
    COPY --from=prod-deps /app/node_modules ./node_modules
    COPY --from=build /app/dist ./dist
    
    # Use non-root user
    USER node
    
    EXPOSE 8080
    
    # Command for production
    CMD ["node", "dist/index.js"]
    