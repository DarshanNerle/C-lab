import connectDB from '../../lib/mongodb.js';
import getUserModel from '../../models/User.js';
import { allowMethods, normalizeEmail, sanitizeLabState, sanitizeSettings, safeServerError } from '../../lib/api-utils.js';
import { getMemUser, updateMemUser } from '../../lib/inMemoryUserStore.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  const email = normalizeEmail(req.body?.email);
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 120) : undefined;
  const settings = req.body?.settings ? sanitizeSettings(req.body.settings) : null;
  const currentLabState = req.body?.currentLabState ? sanitizeLabState(req.body.currentLabState) : null;

  if (!email) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  try {
    await connectDB();
    const User = getUserModel();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (typeof name === 'string') user.name = name;
    if (settings) user.settings = { ...user.settings?.toObject?.(), ...settings };
    if (currentLabState) user.currentLabState = currentLabState;

    await user.save();
    return res.status(200).json({ message: 'User updated successfully.', user, source: 'mongodb' });
  } catch (error) {
    console.warn('[API:user/update] Mongo unavailable, falling back to in-memory store.');
    try {
      const existing = getMemUser(email);
      if (!existing) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const user = updateMemUser(email, (record) => {
        if (typeof name === 'string') record.name = name;
        if (settings) record.settings = { ...record.settings, ...settings };
        if (currentLabState) record.currentLabState = currentLabState;
        return record;
      });

      return res.status(200).json({ message: 'User updated successfully.', user, source: 'memory' });
    } catch (fallbackError) {
      return safeServerError(res, fallbackError, 'user/update');
    }
  }
}
