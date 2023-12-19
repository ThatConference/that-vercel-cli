import nodeFetch from 'node-fetch';
import fetchRetry from 'fetch-retry';
import debug from 'debug';
import appConfig from './appConfig.js';
import { logger } from './logger.js';

const dlog = debug('that:vercel-cli:vercel-api');

// vercel rate limits:
// https://vercel.com/docs/limits/overview#rate-limits
const fetch = fetchRetry(nodeFetch, {
  retries: 5,
  retryDelay: (attempt, error, response) => {
    if (response?.status === 429) {
      dlog('retry on 429, attempt # %d', attempt);
      const retryAfter = response.headers.get('retry-after');
      if (retryAfter) {
        const delay = Number.parseInt(retryAfter, 10) * 1000;
        dlog('delay', delay);
        return delay > 0 ? delay : 1000;
      }
    }
    dlog('retry other %s, attempt # %d', response?.status, attempt);
    return 2000 * (attempt + 1);
  },
  retryOn: (attempt, error, response) => {
    if (response?.status === 429 || response?.status >= 500 || error) {
      return true;
    }
    return false;
  },
});

const teamId = appConfig.vercel.teamId ?? '';

const headers = {
  'content-type': 'application/json',
  Authorization: `Bearer ${appConfig.vercel.token}`,
};

export function fetchDeployments(beforeEpoch) {
  dlog('fetch deployments called');
  // fetching default, 20 records
  const q = new URLSearchParams();
  q.append('limit', 10);
  if (beforeEpoch && Number.isInteger(beforeEpoch)) {
    q.append('until', beforeEpoch);
  }
  if (teamId) {
    q.append('teamId', teamId);
  }

  const options = {
    method: 'GET',
    headers,
  };
  const url = `${appConfig.vercel.baseUrl}/v6/deployments?${q.toString()}`;
  dlog('url: %s', url);
  return fetch(url, options)
    .then(r => r.json())
    .catch(err => {
      logger.error(err);
      throw new Error(err);
    });
}

export async function deleteDeployment(deploymentId) {
  dlog('deleteDeployment %s', deploymentId);
  const childlogger = logger.child({ function: 'deleteDeployment' });
  childlogger.info({ deploymentId, teamId }, 'deleteDeployment called');

  const q = new URLSearchParams();
  if (teamId) {
    q.append('teamId', teamId);
  }
  const options = {
    method: 'DELETE',
    headers,
  };
  let url = `${appConfig.vercel.baseUrl}/v13/deployments/${deploymentId}`;
  if (q.size > 0) {
    url += `?${q.toString()}`;
  }
  childlogger.trace({ url, options }, 'sending to fetch');

  const result = await fetch(url, options);
  const response = await result.json();
  if (result.ok) {
    childlogger.info({ deploymentId }, 'delete succeeded');
  } else {
    childlogger.info(
      {
        deploymentId,
        status: result.status,
        statusText: result.statusText,
        response,
      },
      'delete failed',
    );
  }
}
