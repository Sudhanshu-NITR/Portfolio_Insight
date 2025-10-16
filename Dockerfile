FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV=production

# COPY .env .env

EXPOSE 3000
CMD ["npm", "start"]
