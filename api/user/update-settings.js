import updateUserHandler from './update.js';

export default async function handler(req, res) {
  const method = req.method;
  if (method === 'PATCH') {
    req.method = 'POST';
    const result = await updateUserHandler(req, res);
    req.method = method;
    return result;
  }
  return updateUserHandler(req, res);
}
