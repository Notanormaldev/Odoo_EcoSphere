import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    xpReward: {
      type: Number,
      required: [true, 'XP reward is required'],
      min: [1, 'XP must be at least 1'],
    },
    pointsReward: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      required: [true, 'Difficulty is required'],
    },
    evidenceRequired: {
      type: Boolean,
      default: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Under Review', 'Completed', 'Archived'],
      default: 'Draft',
    },
    participantCount: {
      type: Number,
      default: 0,
    },
    maxParticipants: {
      type: Number,
      default: null,
    },
    instructions: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    targetDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

challengeSchema.index({ status: 1, deadline: 1 });
challengeSchema.index({ createdBy: 1 });

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
