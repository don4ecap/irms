FROM node:16-alpine

WORKDIR /irms-backend

# Set timezone to Singapore
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/Asia/Singapore /etc/localtime
RUN echo "Asia/Singapore" > /etc/timezone

COPY package.json .
COPY package-lock.json .
COPY packages/backend packages/backend
RUN npm ci --omit=dev -w irms-backend
# Run this with docker run command instead
# CMD [ "npm" "run" "start" "-w" "irms-backend"]
