# -------------------------------
# Base stage with Node and pnpm
# -------------------------------
    FROM node:23.11.1-slim AS base
    ENV PNPM_HOME="/pnpm"
    ENV PATH="$PNPM_HOME:$PATH"
    RUN corepack enable
    WORKDIR /app
    
    # -------------------------------
    # Dependencies stage
    # -------------------------------
    FROM base AS deps
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    # -------------------------------
    # Development stage
    # -------------------------------
    FROM base AS dev
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    EXPOSE 5173
    # Use host to allow Docker container access from host machine
    CMD ["pnpm", "run", "dev", "--host"]
    
    # -------------------------------
    # Build stage
    # -------------------------------
    FROM base AS build
    ARG VITE_API_URL
    ENV VITE_API_URL=${VITE_API_URL}
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    COPY . .
    RUN pnpm run build
    
    # -------------------------------
    # Production stage - static file server
    # -------------------------------
    FROM base AS runner
    
    # Copy build output
    COPY --from=build /app/dist ./dist
    
    # Install serve globally
    RUN npm install -g serve
    
    EXPOSE 80
    
    # Serve static files on port 80
    CMD ["serve", "-s", "dist", "-l", "80"]
    