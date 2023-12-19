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
    - `vercel.fetchDeploymentLimit`, int, number of deployment records to fetch per request.
    - `vercel.nextDeploymentFetchDelay`, int, milliseconds, how long to wait before fetching the next set of deployments for deletion.
    - `vercel.deleteRequestDelay`, int, milliseconds, delay added to each delete request.
    - `logDirectoryName`, default, 'logs'. This folder is part of .gitconfig to keep logs out of the repo.

### Vercel Rate Limiting

Vercel rate limit information can be found here, (https://vercel.com/docs/limits/overview#rate-limits)[https://vercel.com/docs/limits/overview#rate-limits]. Vercel doesn't explicitly list a limit for deployment deletes, but, through testing, it appears to be similar to Domain Deletion, which is 60 ever 60 seconds.

To avoid hitting the limit the setting should be around:

- `appConfig.vercel.fetchDeploymentLimit`: 30
- `appConfig.vercel.deleteRequestDelay`: 1000
- `appConfig.vercel.nextDeploymentFetchDelay`: 1000
  
## Executing the script

Run the script in one of two ways:

1. `node src/index.js`
1. `npm run start`

## Requirements

node 20+  
written as node esm, no transpiler.
