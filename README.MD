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

The project uses a monorepo structure and utilizes [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to simplify development.

- iRMS Backend (located in the `packages/backend` folder)
- iRMS Frontend (located in the `packages/frontend` folder)

## Minimum requirements

To run iRMS, the following minimum requirements must be met:

1. NodeJS version 16 or higher
2. NPM version 7.24.2 or higher

## Setup

### Mount the public drive

Before going to the installation step, make sure you have mounted the public drive to your local machine.

```sh
# Create a directory for the public drive
mkdir -p /mnt/public
# Mount the drive
mount -t cifs -o rw,user="guest",pass="",uid=91,gid=91 //10.153.64.10/Public /mnt/public/
```

### Install dependencies

To install the dependencies for the backend and frontend, run the following command from the root directory of the project:

```sh
npm install
```

### IRMS Backend

The iRMS backend uses [Fastify](https://www.fastify.io/) as the web server and [MariaDB Node.js connector](https://www.npmjs.com/package/mariadb) as the database client.

#### Build for production

To build the iRMS backend for production, run either of the following commands:

- Build and then run:

  ```sh
  npm run build --workspace irms-backend
  node packages/backend/build
  ```

- Build and run in one command:

  ```sh
  npm run start --workspace irms-backend
  ```

#### Compiles and hot-reloads for development

To compile and hot-reload the iRMS backend for development, run the following two commands simultaneously:

- Watch and compile TypeScript files on demand:

  ```sh
  npm run ts:watch --workspace irms-backend
  ```

- Run the compiled JavaScript:

  ```sh
  npm run js:watch --workspace irms-backend
  ```

#### Testing

To run tests for the iRMS backend, use the following command:

```sh
npm run test --workspace irms-backend
```

#### Docker

To build and run the iRMS backend as a Docker container, follow these steps:

1. Make sure the public drive has been mounted to your local machine.
2. Build the backend code:

   ```sh
   npm run build --workspace irms-backend
   ```

3. Build the Docker image:

   ```sh
   docker build -f ./backend.Dockerfile --rm -t alphien/irms-backend .
   ```

4. Create and run the iRMS backend container:

   ```sh
   docker run -d --restart unless-stopped -e IRMS_BACKEND_PORT=8000 -v /mnt/public/GLibs/FourElementsConfig/iRMS:/mnt/public/GLibs/FourElementsConfig/iRMS/ --name irms-backend -p 8181:8000 alphien/irms-backend node packages/backend/build
   ```

### IRMS Frontend

The iRMS frontend uses the following technologies:

- [ViteJS](https://vitejs.dev/): Build tool
- [VueJS](https://vuejs.org/): JavaScript framework
- [JqxWidgets](https://www.jqwidgets.com/): UI library

#### Build for production

To build the iRMS frontend for production:

1. Configure the [`.env.production`](packages/frontend/.env.production) file.
2. Build the frontend:

   ```sh
   npm run build --workspace irms-frontend
   ```

3. Test the build:

   ```sh
   npx --workspace irms-frontend http-server dist
   ```

4. Upload the build to the .78 machine:

   ```sh
   rsync -ra ./packages/frontend/dist/* username@10.153.64.78:/var/www/itools/irms
   ```

### Build for UAT/beta testing

To build the iRMS frontend for UAT/beta testing:

1. Ensure the [`.env.beta`](packages/frontend/.env.beta) file is correctly configured
2. Run the following command to build the frontend:

   ```sh
   npm run build-beta --workspace irms-frontend
   ```

3. Then, upload the build to the .83 machine using the following command:

   ```sh
   rsync -ra ./packages/frontend/dist/* username@10.153.64.83:/var/www/itools/irms-fe
   ```

#### Compiles and hot-reloads for development

To start the development server for the iRMS frontend, use the following command:

```sh
npx --workspace irms-frontend vite
```
