import 'dotenv/config';

function configMissing(configKey) {
  throw new Error(`missing required .env setting for ${configKey}`);
}

const appConfig = () => ({
  vercel: {
    token: process.env.VERCEL_TOKEN ?? configMissing('VERCEL_TOKEN'),
    teamId: process.env.VERCEL_TEAM_ID ?? '', // configMissing('VERCEL_TEAM_ID'),
    baseUrl: 'https://api.vercel.com',
    deployMonthsToKeep: 3,
    fetchDeploymentLimit: 30,
    deleteRequestDelay: 1010,
    nextDeploymentFetchDelay: 3000,
  },
  cwd: process.cwd(),
  logDirectoryName: 'logs',
});

export default appConfig();
