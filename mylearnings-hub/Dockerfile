# Stage 1: Build books-viewer React app
FROM node:20-alpine AS books-builder

WORKDIR /app

COPY books-viewer/package.json books-viewer/pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY books-viewer/ ./
RUN pnpm build

# Stage 2: Final nginx + node hybrid container
FROM nginx:1.27-alpine

# Install Node.js for the books API server
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copy books server dependencies
COPY books-viewer/package.json ./
RUN npm install --omit=dev

# Copy books server code
COPY mylearnings-hub/server ./server

# Copy built React app
COPY --from=books-builder /app/dist /usr/share/nginx/html/books

# Copy all plan HTML files
COPY mylearnings-hub/plans /usr/share/nginx/html/plans

# Copy landing page
COPY mylearnings-hub/index.html /usr/share/nginx/html/index.html

# Copy nginx configuration
COPY mylearnings-hub/nginx.conf /etc/nginx/conf.d/default.conf

# Create a startup script to run both nginx and node
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'node /app/server/index.js &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 8000

ENV NODE_ENV=production

CMD ["/start.sh"]
