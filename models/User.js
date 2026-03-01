import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    badges: [String],
    currentLabState: {
      selectedChemicals: Array,
      volumes: Object,
      resultColor: String,
      experimentType: String,
    },
    aiHistory: [
      {
        question: String,
        answer: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    settings: {
      darkMode: { type: Boolean, default: true },
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      soundEnabled: { type: Boolean, default: true },
      soundVolume: { type: Number, min: 0, max: 1, default: 0.5 },
      immersiveMode: { type: Boolean, default: false },
      aiMode: { type: String, enum: ['mini_assistant', 'full_learning'], default: 'mini_assistant' },
      animationIntensity: { type: String, enum: ['normal', 'reduced'], default: 'normal' },
      voiceEnabled: { type: Boolean, default: false },
      speechRate: { type: Number, min: 0.5, max: 2, default: 1 },
      speechPitch: { type: Number, min: 0, max: 2, default: 1 },
      selectedVoice: { type: String, default: '' },
      voiceGender: { type: String, enum: ['male', 'female', 'auto'], default: 'auto' }
    },
  },
  { timestamps: true }
);

/**
 * Gets the User model, ensuring it's only compiled once.
 */
export function getUserModel() {
    return mongoose.models.User || mongoose.model('User', UserSchema);
}

export default getUserModel;
