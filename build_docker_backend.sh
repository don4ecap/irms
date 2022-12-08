#!/usr/bin/env sh

workspace_name=irms-backend

# Clean all builds folder
npm run clean -ws --if-present

# Lint
npm run lint -w $workspace_name --if-present &&
    # Typescript check
    npm run ts:check -w $workspace_name --if-present &&
    # Build
    npm run build -w $workspace_name --if-present &&
    # Run test
    npm run test -w $workspace_name --if-present &&
    # Build docker image
    docker build -f ./backend.Dockerfile --rm -t "alphien/$workspace_name" .
