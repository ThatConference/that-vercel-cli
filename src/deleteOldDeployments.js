import debug from 'debug';
import dayjs from 'dayjs';
import { logger } from './logger.js';
import appConfig from './appConfig.js';
import { fetchDeployments, deleteDeployment } from './vercelApi.js';

const dlog = debug('that:vercel-cli:d-old-deploy');
const childlogger = logger.child({ function: 'deleteOldDeployments' });

async function callVercelDeleteBatch(_deployments) {
  dlog('callVercelDelete on %d deployments', _deployments.length);
  const dateCheck = dayjs().subtract(appConfig.vercel.deployMonthsToKeep, 'M');
  const deleteFunctions = [];
  for (let i = 0; i < _deployments.length; i += 1) {
    const deployment = _deployments[i];

    const { uid: deploymentId, createdAt } = deployment;
    if (dayjs(createdAt) <= dateCheck) {
      const fn = new Promise(resolve =>
        setTimeout(async () => {
          const t = await deleteDeployment(deploymentId);
          resolve(t);
        }, appConfig.vercel.deleteRequestDelay * i),
      );

      deleteFunctions.push(fn);
      // deleteFunctions.push(deleteDeployment(deploymentId));
    } else {
      childlogger.info(
        { deploymentId, createdAt },
        'deployment too recent, skipping',
      );
    }
  }
  const r = await Promise.allSettled(deleteFunctions);
  const result = r.reduce(
    (acc, cur) => {
      if (cur.status === 'fulfilled') {
        acc.fulfilled += 1;
      } else {
        acc.rejected += 1;
      }
      return acc;
    },
    { fulfilled: 0, rejected: 0 },
  );
  childlogger.info({ result }, 'batch result');
}

export async function deleteOldDeployments() {
  dlog('deleteOldDeployments called');
  childlogger.info('starting deleteOldDeployments');
  const teamId = appConfig.vercel.teamId ?? '';
  const initialUntil = dayjs()
    .subtract(appConfig.vercel.deployMonthsToKeep, 'M')
    .valueOf();
  childlogger.info({ initialUntil, teamId }, 'initial');
  let until = initialUntil;
  let fetchedDeploys = 0;
  while (until) {
    childlogger.info({ until, teamId }, 'next until fetch value');
    const deployFetchResult = await fetchDeployments(until);
    if (deployFetchResult.error) {
      dlog('error fetching deployments, %o', deployFetchResult);
      childlogger.error(
        { deployFetchResult },
        'Error whiule fetching deployments',
      );
      return {};
    }

    const { deployments, pagination } = deployFetchResult;
    const { count, next, previous } = pagination;
    childlogger.info({ count, next, previous }, 'pagination values fetched');

    if (count > 0 && deployments.length > 0) {
      fetchedDeploys += count;
      const r = await callVercelDeleteBatch(deployments);
      childlogger.info({ until, r }, 'callVercelDelete returned');
    } else {
      dlog('Deployment length 0, nothing to work on');
      childlogger.info(
        { until, count },
        'Deployment length 0, nothing to work on',
      );
    }
    until = next; // next value to use to fetch deployments
    // delay to avoid rate limit
    await new Promise(resolve =>
      setTimeout(resolve, appConfig.vercel.nextDeploymentFetchDelay),
    );
  }

  childlogger.info({ fetchedDeploys }, 'deleteOldDeployments done');
  return { fetchedDeploys };
}
