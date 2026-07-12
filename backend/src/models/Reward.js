import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Reward name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    pointsRequired: {
      type: Number,
      required: [true, 'Points required is mandatory'],
      min: [1, 'Points must be at least 1'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
    },
    totalRedeemed: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['Voucher', 'Experience', 'Product', 'Recognition', 'Time Off', 'Other'],
      default: 'Other',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Out of Stock'],
      default: 'Active',
    },
    validUntil: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-update status when stock = 0
rewardSchema.pre('save', function (next) {
  if (this.stock === 0 && this.status === 'Active') {
    this.status = 'Out of Stock';
  } else if (this.stock > 0 && this.status === 'Out of Stock') {
    this.status = 'Active';
  }
  next();
});

rewardSchema.index({ status: 1 });

const Reward = mongoose.model('Reward', rewardSchema);
export default Reward;

// ---- Reward Redemption Model ----
const rewardRedemptionSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: true,
    },
    pointsDeducted: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Fulfilled', 'Cancelled'],
      default: 'Pending',
    },
    fulfilledAt: {
      type: Date,
      default: null,
    },
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

rewardRedemptionSchema.index({ employee: 1, status: 1 });
rewardRedemptionSchema.index({ reward: 1 });

export const RewardRedemption = mongoose.model('RewardRedemption', rewardRedemptionSchema);
