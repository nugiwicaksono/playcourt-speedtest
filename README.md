# Speedtest

a very lightweight Speedtest implemented in Javascript, using XMLHttpRequest and Web Workers. Forked from [adolfintel](https://github.com/adolfintel/speedtest) to be adapted to OpenShift Origin environment.

## Requirement

- nodeJS (tested with 8.10)
- npm or yarn

## Build & run locally

1. Install the node dependencies by executing npm i or yarn (depending on which Package Manager you use)
2. Start the Speedtest Server: npm start

## Deployment

- Creating new app (1st deployment)

1. Open [OpenShift Origin Web Console](https://vsan-console.playcourt.id/console/)
2. Choose Node.js from catalog
3. Provide application name and git url of this repo
4. Click "create"

- Updating existing app

1. Open [Build page](https://vsan-console.playcourt.id/console/project/emago-speedtest-dev/browse/builds)
2. Choose build item that refer to this repo and selected branch
3. Click "start build"