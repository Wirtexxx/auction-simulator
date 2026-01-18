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
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    COPY . .
    RUN pnpm run build
    
    # -------------------------------
    # Production stage - nginx
    # -------------------------------
    FROM nginx:alpine AS runner
    
    # Copy build output
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Copy nginx configuration template
    # Nginx Docker image automatically processes templates in /etc/nginx/templates/
    # and substitutes environment variables using envsubst
    COPY nginx.conf /etc/nginx/templates/default.conf.template
    
    EXPOSE 80
    # Default CMD from nginx:alpine handles template processing automatically
    