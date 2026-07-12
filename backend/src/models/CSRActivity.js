import mongoose from 'mongoose';

const csrActivitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
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
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    date: {
      type: Date,
      required: [true, 'Activity date is required'],
    },
    deadline: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    maxParticipants: {
      type: Number,
      default: null,
    },
    pointsAwarded: {
      type: Number,
      default: 50,
      min: 0,
    },
    evidenceRequired: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Draft', 'Open', 'Closed', 'Completed'],
      default: 'Open',
    },
    participantCount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

csrActivitySchema.index({ status: 1, date: -1 });
csrActivitySchema.index({ department: 1 });

const CSRActivity = mongoose.model('CSRActivity', csrActivitySchema);
export default CSRActivity;
