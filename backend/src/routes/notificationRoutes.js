import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getUserNotifications, markAsRead } from '../services/notificationService.js';
import ESGConfig from '../models/ESGConfig.js';
import User from '../models/User.js';

const router = Router();

// GET notifications for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await getUserNotifications(req.user._id, Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
});

// Mark notifications as read
router.put('/read', authenticate, async (req, res, next) => {
  try {
    const { ids } = req.body; // array of notification IDs, or empty = mark all
    await markAsRead(req.user._id, ids);
    res.json({ success: true, message: 'Marked as read' });
  } catch (e) { next(e); }
});

// Get ESG config
router.get('/settings', authenticate, async (req, res, next) => {
  try {
    let config = await ESGConfig.findOne();
    if (!config) config = await ESGConfig.create({});
    res.json({ success: true, data: config });
  } catch (e) { next(e); }
});

// Update ESG config
router.put('/settings', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    let config = await ESGConfig.findOne();
    if (!config) {
      config = await ESGConfig.create(req.body);
    } else {
      Object.assign(config, req.body);
      await config.save();
    }
    res.json({ success: true, data: config });
  } catch (e) { next(e); }
});

// Update user notification preferences
router.put('/preferences', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences: req.body },
      { new: true }
    );
    res.json({ success: true, data: user.notificationPreferences });
  } catch (e) { next(e); }
});

export default router;
