import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: '🏆',
    },
    image: {
      type: String,
      default: null,
    },
    unlockRule: {
      type: {
        type: String,
        enum: ['xp_threshold', 'challenges_completed', 'csr_activities', 'streak', 'custom'],
        required: true,
      },
      threshold: {
        type: Number,
        required: true,
        min: 0,
      },
      description: {
        type: String,
        trim: true,
      },
    },
    rarity: {
      type: String,
      enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
      default: 'Common',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalAwarded: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

badgeSchema.index({ isActive: 1 });
badgeSchema.index({ 'unlockRule.type': 1 });

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
