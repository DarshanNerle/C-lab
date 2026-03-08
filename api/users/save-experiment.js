import connectDB from '../../lib/mongodb.js';
import getUserModel from '../../models/User.js';
import { allowMethods, normalizeEmail, sanitizeExperiment, safeServerError } from '../../lib/api-utils.js';
import { getMemUser, updateMemUser } from '../../lib/inMemoryUserStore.js';

const upsertExperiment = (list, experiment) => {
  const experiments = Array.isArray(list) ? [...list] : [];
  const index = experiments.findIndex((item) => item?.id === experiment.id);
  if (index >= 0) {
    experiments[index] = { ...experiments[index], ...experiment };
  } else {
    experiments.unshift(experiment);
  }
  return experiments.slice(0, 300);
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;

  const email = normalizeEmail(req.body?.email);
  const experiment = sanitizeExperiment(req.body?.experiment);
  if (!email || !experiment) {
    return res.status(400).json({ error: 'Valid email and experiment are required.' });
  }

  try {
    await connectDB();
    const User = getUserModel();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.experiments = upsertExperiment(user.experiments, experiment);
    await user.save();
    return res.status(200).json({ ok: true, experiment, source: 'mongodb' });
  } catch (error) {
    console.warn('[API:user/save-experiment] Mongo unavailable, falling back to in-memory store.');
    try {
      const existing = getMemUser(email);
      if (!existing) return res.status(404).json({ error: 'User not found.' });
      const user = updateMemUser(email, (record) => {
        record.experiments = upsertExperiment(record.experiments, experiment);
        return record;
      });
      return res.status(200).json({ ok: true, experiment, experiments: user.experiments, source: 'memory' });
    } catch (fallbackError) {
      return safeServerError(res, fallbackError, 'user/save-experiment');
    }
  }
}
