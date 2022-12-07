# ITOOLS

## Overview

This repository holds all [iTools](https://wiki.4ecap.com/4ECwiki/Category:ITools) applications, both backend and frontend. Mostly use NodeJS.

## Project structure

Because mostly using NodeJS, the project structure uses a monorepo structure with the help of [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

- iRMS
  - [iRMS Backend](apps/irms/backend/)
  - [iRMS Frontend](apps/irms/frontend/)
- iTrade
  - [iTrade Backend](apps/itrade/backend/)
  - [iTrade Frontend](apps/itrade/frontend/)

## Requirements

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

For more details to setup iTools app, please check their respective readme in their folder. (See [Project structure](#project-structure) for the link)
