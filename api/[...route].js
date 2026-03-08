import routeApiRequest from '../lib/serverless/router.js';

export default async function handler(req, res) {
  return routeApiRequest(req, res);
}
