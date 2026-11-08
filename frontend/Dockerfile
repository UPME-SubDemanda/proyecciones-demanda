FROM node:22-slim
RUN corepack enable
WORKDIR /web
COPY . .
RUN pnpm install
CMD ["pnpm", "dev"]
