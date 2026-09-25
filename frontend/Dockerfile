FROM docker.io/library/node:25-alpine AS build
ARG GIT_SHA=dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build && echo "$GIT_SHA" > dist/version.txt

FROM docker.io/nginxinc/nginx-unprivileged:1-alpine
LABEL org.opencontainers.image.source="https://github.com/szymon-grabowski/portfolio"
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
