FROM node:16-alpine

WORKDIR /irms-backend
COPY package.json .
COPY package-lock.json .
COPY apps/irms/backend apps/irms/backend
RUN npm ci --omit=dev -w irms-backend
# Run this with docker run command instead
# CMD [ "npm" "run" "start" "-w" "irms-backend"]
