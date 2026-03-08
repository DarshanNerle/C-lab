import connectDB from '../../lib/mongodb.js';
import getUserModel from '../../models/User.js';
import { allowMethods, normalizeEmail, safeServerError } from '../../lib/api-utils.js';
import { getMemUser } from '../../lib/inMemoryUserStore.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;

  const email = normalizeEmail(req.query?.email);
  if (!email) {
    return res.status(400).json({ error: 'A valid email query parameter is required.' });
  }

  try {
    await connectDB();
    const User = getUserModel();
    const user = await User.findOne({ email }, { experiments: 1 });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.status(200).json({ experiments: Array.isArray(user.experiments) ? user.experiments : [], source: 'mongodb' });
  } catch (error) {
    console.warn('[API:user/get-experiments] Mongo unavailable, falling back to in-memory store.');
    try {
      const user = getMemUser(email);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      return res.status(200).json({ experiments: Array.isArray(user.experiments) ? user.experiments : [], source: 'memory' });
    } catch (fallbackError) {
      return safeServerError(res, fallbackError, 'user/get-experiments');
    }
  }
}
