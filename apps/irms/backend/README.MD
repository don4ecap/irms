# IRMS-BACKEND

## Overview

iRMS backend source code.

### Install dependencies

```sh
npm install
```

### Build for production

```sh
# Build
npm run build --workspace irms-backend
# Run
node apps/irms/backend/build
```

or

```sh
# Build and run
npm run start --workspace irms-backend
```

### Compiles and hot-reloads for development

You need to run both command below at the same time

```sh
# To watch  and compile typescript files on demand
npm run ts:watch --workspace irms-backend
```

and

```sh
# To run the compiled javascript
npm run js:watch --workspace irms-backend
```

### Testing

```sh
npm run test --workspace irms-backend
```

### Docker

```sh
# Build docker image
./build_docker_irms_backend.sh
# Create and run irms-backend container
docker run -d --restart unless-stopped -v /mnt/public/GLibs/FourElementsConfig/iRMS:/mnt/public/GLibs/FourElementsConfig/iRMS/ --name irms-backend -p 8000:8000 alphien/irms-backend node apps/irms/backend/build

```
