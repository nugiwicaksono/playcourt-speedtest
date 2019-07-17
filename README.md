Speedtest

a very lightweight Speedtest implemented in Javascript, using XMLHttpRequest and Web Workers. Forked from adolfintel to be adapted to OpenShift Origin environment.


Requirement


nodeJS (tested with 8.10)
npm or yarn



Build & run locally


Install the node dependencies by executing npm i or yarn (depending on which Package Manager you use)
Start the Speedtest Server: npm start



Deployment


Creating new app (1st deployment)



Open OpenShift Origin Web Console

Choose Node.js from catalog
Provide application name and git url of this repo
Click "create"



Updating existing app



Open Build page

Choose build item that refer to this repo and selected branch
Click "start build"