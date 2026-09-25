FROM docker.io/library/node:22-alpine AS build
ARG GIT_SHA=dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build && echo "$GIT_SHA" > dist/version.txt

FROM docker.io/nginxinc/nginx-unprivileged:1-alpine
# Security fixes released after the base image was built.
USER root
RUN apk upgrade --no-cache
USER 101
LABEL org.opencontainers.image.source="https://github.com/szymon-grabowski/portfolio"
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
