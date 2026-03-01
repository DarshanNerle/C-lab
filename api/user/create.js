import connectDB from '../../lib/mongodb.js';
import getUserModel from '../../models/User.js';
import { allowMethods, normalizeEmail, safeServerError } from '../../lib/api-utils.js';
import { createMemUser, getMemUser } from '../../lib/inMemoryUserStore.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  const email = normalizeEmail(req.body?.email);
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 120) : '';

  if (!email) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  try {
    await connectDB();
    const User = getUserModel();

    let user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({ message: 'User already exists.', user, source: 'mongodb' });
    }

    user = await User.create({ email, name });
    return res.status(201).json({ message: 'User created successfully.', user, source: 'mongodb' });
  } catch (error) {
    console.warn('[API:user/create] Mongo unavailable, falling back to in-memory store.');
    try {
      const existing = getMemUser(email);
      if (existing) {
        return res.status(200).json({ message: 'User already exists.', user: existing, source: 'memory' });
      }
      const user = createMemUser({ email, name });
      return res.status(201).json({ message: 'User created successfully.', user, source: 'memory' });
    } catch (fallbackError) {
      return safeServerError(res, fallbackError, 'user/create');
    }
  }
}
