# that-vercel-cli

**beta** version software.  
This basic cli will delete old deployments from a vercel account.

## Setup

There are two places to configure the application

1. `.env`, two keys are needed in the .env file.
    1. VERCEL_TOKEN, Bearer token for accessing the Vercel API.
    1. VERCEL_TEAM_ID, required for team accounts. If the API is not authorizing you it's probably due to a missing team id.

1. `appConfig.js` file. This file reads in environment variables and contains other needed values.
    - `vercel.baseUrl`, Vercel API's base url.
    - `vercel.deployMonthsToKeep`, int, number of months of deployments to keep around. Any deployments older than this term will be deleted. 
    - `logDirectoryName`, default, 'logs'. This folder is part of .gitconfig to keep logs out of the repo.
  
## Executing the script

Run the script in one of two ways:

1. `node src/index.js`
1. `npm run start`

## Requirements

node 20+  
written as node esm, no transpiler.
