import debug from 'debug';
import { deleteOldDeployments } from './deleteOldDeployments.js';

debug.enable('that:*');
const dlog = debug('that:vercel-cli');

dlog('starting...');

deleteOldDeployments().then(r => {
  dlog('output %O', r);
  dlog('done.');
});
