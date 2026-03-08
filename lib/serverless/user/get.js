import usersGetHandler from '../users/get.js';

// Backward-compatible alias for legacy `/api/user/get`.
export default async function handler(req, res) {
  return usersGetHandler(req, res);
}
