import connectDB from '../../lib/mongodb.js';
import getUserModel from '../../models/User.js';
import { allowMethods, normalizeEmail, safeServerError } from '../../lib/api-utils.js';
import { getMemUser, updateMemUser } from '../../lib/inMemoryUserStore.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  const email = normalizeEmail(req.body?.email);
  const amount = Number(req.body?.amount);

  if (!email || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Valid email and positive XP amount are required.' });
  }

  try {
    await connectDB();
    const User = getUserModel();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const totalXp = user.xp + amount;
    user.xp = totalXp;
    user.level = Math.floor(totalXp / 100) + 1;
    await user.save();

    return res.status(200).json({ message: 'XP updated successfully.', xp: user.xp, level: user.level, source: 'mongodb' });
  } catch (error) {
    console.warn('[API:user/add-xp] Mongo unavailable, falling back to in-memory store.');
    try {
      const existing = getMemUser(email);
      if (!existing) return res.status(404).json({ error: 'User not found.' });

      const user = updateMemUser(email, (record) => {
        const totalXp = (record.xp || 0) + amount;
        record.xp = totalXp;
        record.level = Math.floor(totalXp / 100) + 1;
        return record;
      });

      return res.status(200).json({ message: 'XP updated successfully.', xp: user.xp, level: user.level, source: 'memory' });
    } catch (fallbackError) {
      return safeServerError(res, fallbackError, 'user/add-xp');
    }
  }
}
