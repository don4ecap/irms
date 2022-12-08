# IRMS

## Overview

This repository holds all iRMS applications, both backend and frontend.

## Project structure

Because mostly using NodeJS, the project structure uses a monorepo structure with the help of [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

- [iRMS Backend](packages/backend/)
- [iRMS Frontend](packages/frontend/)

## Minimum requirements

The following general requirements must be provided to run iTools:

1. NodeJS 16 and above
2. NPM 7.24.2 and above (which already supports the workspaces feature)

## Setup

### Mount the public folder

Before going to the installation stage, make sure you have mounted the public folder to your local machine.

```sh
mkdir -p /mnt/public
mount -t cifs -o rw,user="guest",pass="",uid=91,gid=91 //10.153.64.10/Public /mnt/public/
```

### Install dependencies

Because it uses monorepo. we have to install all dependencies from root directory of project

```sh
npm install
```

### IRMS Backend

#### Build for production

```sh
# Build
npm run build --workspace irms-backend
# Run
node backend/build
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
npm run test --workspace irms-backend
```

#### Docker

> NOTE: Make sure you already mount public drive to your local machine. See [Mount the public folder](#mount-the-public-folder)

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
## Serve the build
npx --workspace irms-frontend http-server build
```

#### Compiles and hot-reloads for development

```sh
# Run vite development server
npx -w irms-frontend vite
```
