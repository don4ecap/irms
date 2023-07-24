# IRMS

## Table of contents

- [Overview](#overview)
- [Build for production](#build-for-production)
- [Build for UAT/beta testing](#build-for-uatbeta-testing)
- [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)

## Overview

iRMS frontend application. The iRMS frontend uses the following technologies:

- [ViteJS](https://vitejs.dev/): Build tool
- [VueJS](https://vuejs.org/): JavaScript framework
- [JqxWidgets](https://www.jqwidgets.com/): UI library

The iRMS backend itself available at [JavaApps](https://git.alphien.com/FourElementsJava/JavaApps) repository, under the [iRMS folder](https://git.alphien.com/FourElementsJava/JavaApps/src/branch/master/iRMS).

## Build for production

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

4. Upload the build to the `.78` machine:

   ```sh
   rsync -ra ./packages/frontend/dist/* <username>@10.153.64.78:/var/www/itools/irms
   ```

   > Note: change `<username>` with your domainuser username

## Build for UAT/beta testing

To build the iRMS frontend for UAT/beta testing:

1. Ensure the [`.env.beta`](packages/frontend/.env.beta) file is correctly configured
2. Run the following command to build the frontend:

   ```sh
   npm run build-beta --workspace irms-frontend
   ```

3. Then, upload the build to the `.83` machine using the following command:

   ```sh
   rsync -ra ./packages/frontend/dist/* username@10.153.64.83:/var/www/itools/irms-fe
   ```

   > Note: change `<username>` with your domainuser username

## Compiles and hot-reloads for development

To start the development server for the iRMS frontend, please make sure the [`.env.local`](packages/frontend/.env.local)
file is already configured and then run the following command:

```sh
npx --workspace irms-frontend vite
```
