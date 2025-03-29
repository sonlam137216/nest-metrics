# Build stage
FROM node:lts AS builder
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . ./
RUN yarn build

# Production stage
FROM node:lts AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production
ARG PORT=3000

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE $PORT
CMD ["yarn", "start:prod"]
