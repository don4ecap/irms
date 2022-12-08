# IRMS

## Overview

iRMS application both [backend](packages/backend/) and [frontend](packages/frontend/).

## Project structure

The project structure uses a monorepo structure with the help of [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to manage the development.

- [iRMS Backend](packages/backend/)
- [iRMS Frontend](packages/frontend/)

## Minimum requirements

The following general requirements must be provided to run iRMS:

1. NodeJS 16 and above
2. NPM 7.24.2 and above

## Setup

### Mount the public drive

Before going to the installation step, make sure you have mounted the public drive to your local machine.

```sh
mkdir -p /mnt/public
mount -t cifs -o rw,user="guest",pass="",uid=91,gid=91 //10.153.64.10/Public /mnt/public/
```

### Install dependencies

Because it uses monorepo. we have to install all dependencies from the root directory of the project.

```sh
npm install
```

### IRMS Backend

#### Build for production

```sh
# Build
npm run build --workspace irms-backend
# Run
node packages/backend/build
```

or

```sh
# Build and run
npm run start --workspace irms-backend
```

#### Compiles and hot-reloads for development

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

#### Testing

```sh
# Run test
npm run test --workspace irms-backend
```

#### Docker

> NOTE: Make sure you already mount public drive to your local machine. See [Mount the public folder](#mount-the-public-drive)

```sh
# Build docker image
./build_docker_backend.sh
# Create and run irms-backend container
docker run -d --restart unless-stopped -v /mnt/public/GLibs/FourElementsConfig/iRMS:/mnt/public/GLibs/FourElementsConfig/iRMS/ --name irms-backend -p 8000:8000 alphien/irms-backend node packages/backend/build

```

### IRMS Frontend

#### Build for production

```sh
# Build
npm run build --workspace irms-frontend
# Serve the build
npx --workspace irms-frontend http-server build
```

#### Compiles and hot-reloads for development

```sh
# Run development server
npx --workspace irms-frontend vite
```
