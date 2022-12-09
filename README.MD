# IRMS

## Table of contents

- [Overview](#overview)
- [Project structure](#project-structure)
- [Minimum requirements](#minimum-requirements)
- [Setup](#setup)
  - [Mount the public drive](#mount-the-public-drive)
  - [Install dependencies](#install-dependencies)
  - [IRMS Backend](#irms-backend)
    - [Build for production](#build-for-production)
    - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
    - [Testing](#testing)
    - [Docker](#docker)
  - [IRMS Frontend](#irms-frontend)
    - [Build for production](#build-for-production)
    - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)

## Overview

iRMS application both [backend](packages/backend/) and [frontend](packages/frontend/).

## Project structure

The project structure uses monorepo structure with the help of [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to manage the development.

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

Because it uses monorepo. we have to install all dependencies for backend and frontend from the root directory of the project.

```sh
npm install
```

### IRMS Backend

iRMS backend is using [Fastify](https://www.fastify.io/) as web server and [MariaDB Node.js connector](https://www.npmjs.com/package/mariadb) as database client.

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

You need to run both of the commands below at the same time.

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

> NOTE: Make sure you already mount the public drive to your local machine. See [Mount the public folder](#mount-the-public-drive)

```sh
# Build docker image
./build_docker_backend.sh
# Create and run irms-backend container
docker run -d --restart unless-stopped -v /mnt/public/GLibs/FourElementsConfig/iRMS:/mnt/public/GLibs/FourElementsConfig/iRMS/ --name irms-backend -p 8000:8000 alphien/irms-backend node packages/backend/build

```

### IRMS Frontend

iRMS frontend is using [ViteJS](https://vitejs.dev/) as build tool, [VueJS](https://vuejs.org/) as framework and [JqxWidgets](https://www.jqwidgets.com/) as user interface library.

#### Build for production

Make sure the [`.env.production`](packages/frontend/.env.production) file already configured correctly. Then build and deploy.

```sh
# Build
npm run build --workspace irms-frontend
# Serve the build to test
npx --workspace irms-frontend http-server dist
# Upload the build to .83 machine
rsync -ra ./packages/frontend/dist/* username@10.153.64.83:/var/www/itools/irms-fe
```

#### Compiles and hot-reloads for development

```sh
# Run development server
npx --workspace irms-frontend vite
```
