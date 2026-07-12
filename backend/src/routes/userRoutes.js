import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// GET all users (employees)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { role, department, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -emailVerificationToken -emailVerificationExpires')
        .populate('department', 'name code')
        .populate('badges', 'name icon rarity')
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, data: users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (e) { next(e); }
});

// GET user profile by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department', 'name code')
      .populate('badges', 'name icon rarity description');
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

// UPDATE current user profile
router.put('/me/profile', authenticate, async (req, res, next) => {
  try {
    const allowedFields = ['name', 'designation', 'gender', 'avatar', 'bio', 'notificationPreferences'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .populate('department', 'name code')
      .populate('badges', 'name icon rarity');

    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

// CHANGE password
router.put('/me/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (user.googleId && !user.password) {
      throw new AppError('Google accounts cannot change password here', 400);
    }

    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new AppError('Current password is incorrect', 400);

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (e) { next(e); }
});

export default router;
