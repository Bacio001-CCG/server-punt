# FROM node:22.6-slim

# # Install dependencies for sharp and other native modules
# RUN apt-get update && apt-get install -y \
#     python3 \
#     make \
#     g++ \
#     libvips-dev \
#     && rm -rf /var/lib/apt/lists/*

# # Install pnpm
# RUN npm install -g pnpm@latest

# # Set the working directory
# WORKDIR /app

# # Copy package files first for better caching
# COPY package.json pnpm-lock.yaml ./

# # Install dependencies
# RUN pnpm install --frozen-lockfile

# # Copy the rest of the application code
# COPY . .

# # Build the Next.js application for production
# ENV NEXT_TELEMETRY_DISABLED=1
# ENV NODE_OPTIONS="--max-old-space-size=4096"
# RUN pnpm run build

# # Start the application in production mode
# EXPOSE 3000
# CMD ["pnpm", "run", "start"]

FROM node:22.6-alpine3.19

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the Next.js application for production
RUN npm run build

# Expose the port the app runs on
EXPOSE 3011

# Start the application in production mode
CMD ["npm", "run", "start"]