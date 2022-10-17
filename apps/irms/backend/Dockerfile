FROM node:16-alpine

WORKDIR /irms-backend
COPY . .
RUN npm ci
RUN npm run build -w irms-backend
# Run this with docker run command instead
# CMD [ "npm" "run" "start" "-w" "irms-backend"]
