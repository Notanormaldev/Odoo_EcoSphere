import { Router } from 'express';
import Challenge from '../models/Challenge.js';
import ChallengeParticipation from '../models/ChallengeParticipation.js';
import Badge from '../models/Badge.js';
import Reward from '../models/Reward.js';
import { RewardRedemption } from '../models/Reward.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { createNotification, notifyAdmins } from '../services/notificationService.js';
import { awardXPAndPoints } from '../services/badgeService.js';

const router = Router();

// ===== CHALLENGES =====
router.get('/challenges', authenticate, async (req, res, next) => {
  try {
    const { status, difficulty, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [challenges, total] = await Promise.all([
      Challenge.find(filter)
        .populate('category', 'name icon')
        .populate('createdBy', 'name')
        .populate('targetDepartment', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Challenge.countDocuments(filter),
    ]);

    // Check participation for current user
    const challengeIds = challenges.map((c) => c._id);
    const participations = await ChallengeParticipation.find({
      challenge: { $in: challengeIds },
      employee: req.user._id,
    }).select('challenge approvalStatus progress');

    const participationMap = {};
    participations.forEach((p) => { participationMap[p.challenge.toString()] = p; });

    const enriched = challenges.map((c) => ({
      ...c.toObject(),
      userParticipation: participationMap[c._id.toString()] || null,
    }));

    res.json({ success: true, data: enriched, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (e) { next(e); }
});

router.get('/challenges/:id', authenticate, async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('category', 'name icon')
      .populate('createdBy', 'name avatar')
      .populate('targetDepartment', 'name');
    if (!challenge) throw new AppError('Challenge not found', 404);

    const userParticipation = await ChallengeParticipation.findOne({
      challenge: req.params.id, employee: req.user._id,
    });

    res.json({ success: true, data: { ...challenge.toObject(), userParticipation } });
  } catch (e) { next(e); }
});

router.post('/challenges', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const challenge = await Challenge.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: challenge });
  } catch (e) { next(e); }
});

router.put('/challenges/:id', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const update = { ...req.body };

    if (status === 'Completed') update.completedAt = new Date();
    if (status === 'Archived') update.archivedAt = new Date();

    const challenge = await Challenge.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!challenge) throw new AppError('Challenge not found', 404);
    res.json({ success: true, data: challenge });
  } catch (e) { next(e); }
});

router.delete('/challenges/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Challenge deleted' });
  } catch (e) { next(e); }
});

// JOIN challenge
router.post('/challenges/:id/join', authenticate, async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) throw new AppError('Challenge not found', 404);
    if (challenge.status !== 'Active') throw new AppError('Challenge is not active', 400);
    if (challenge.maxParticipants && challenge.participantCount >= challenge.maxParticipants) {
      throw new AppError('Challenge is full', 400);
    }

    const existing = await ChallengeParticipation.findOne({
      challenge: req.params.id, employee: req.user._id,
    });
    if (existing) throw new AppError('Already joined this challenge', 409);

    const participation = await ChallengeParticipation.create({
      challenge: req.params.id,
      employee: req.user._id,
    });

    await Challenge.findByIdAndUpdate(req.params.id, { $inc: { participantCount: 1 } });

    res.status(201).json({ success: true, data: participation });
  } catch (e) { next(e); }
});

// Submit proof for challenge
router.put('/challenge-participation/:id/submit', authenticate, async (req, res, next) => {
  try {
    const { proofUrl, proofFileName } = req.body;
    const participation = await ChallengeParticipation.findOne({
      _id: req.params.id, employee: req.user._id,
    });
    if (!participation) throw new AppError('Participation not found', 404);

    participation.proof = { url: proofUrl, fileName: proofFileName, uploadedAt: new Date() };
    participation.progress = 100;
    participation.approvalStatus = 'Pending';
    participation.completedAt = new Date();
    await participation.save();

    res.json({ success: true, data: participation, message: 'Proof submitted for review' });
  } catch (e) { next(e); }
});

// Get all challenge participations (for admins / filtering)
router.get('/challenge-participation', authenticate, async (req, res, next) => {
  try {
    const { challenge, employee, approvalStatus } = req.query;
    const filter = {};
    if (challenge) filter.challenge = challenge;
    if (employee) filter.employee = employee;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (req.user.role === 'employee') filter.employee = req.user._id;

    const participations = await ChallengeParticipation.find(filter)
      .populate('challenge', 'title xpReward difficulty')
      .populate('employee', 'name email avatar')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: participations });
  } catch (e) { next(e); }
});

// Approve/Reject challenge participation
router.put('/challenge-participation/:id/approve', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body;
    const participation = await ChallengeParticipation.findById(req.params.id)
      .populate('challenge', 'title xpReward pointsReward')
      .populate('employee', 'name email totalChallengesCompleted');

    if (!participation) throw new AppError('Participation not found', 404);

    if (action === 'approve') {
      const xp = participation.challenge.xpReward || 0;
      const points = participation.challenge.pointsReward || 0;

      participation.approvalStatus = 'Approved';
      participation.approvedBy = req.user._id;
      participation.approvedAt = new Date();
      participation.xpAwarded = xp;
      participation.pointsAwarded = points;
      await participation.save();

      // Award XP + increment challenge count
      await awardXPAndPoints(participation.employee._id, xp, points);
      await User.findByIdAndUpdate(participation.employee._id, {
        $inc: { totalChallengesCompleted: 1 },
      });

      await createNotification({
        recipientId: participation.employee._id,
        type: 'challenge_approval',
        title: 'Challenge Completed! 🏆',
        message: `Your challenge "${participation.challenge.title}" was approved! You earned ${xp} XP and ${points} points.`,
        link: '/gamification/challenges',
        priority: 'high',
        sendEmail: true,
      });
    } else {
      participation.approvalStatus = 'Rejected';
      participation.rejectionReason = rejectionReason;
      participation.approvedBy = req.user._id;
      participation.approvedAt = new Date();
      await participation.save();

      await createNotification({
        recipientId: participation.employee._id,
        type: 'challenge_approval',
        title: 'Challenge Submission Rejected',
        message: `Your submission for "${participation.challenge.title}" was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
        link: '/gamification/challenges',
        sendEmail: true,
      });
    }

    res.json({ success: true, data: participation });
  } catch (e) { next(e); }
});

// ===== BADGES =====
router.get('/badges', authenticate, async (req, res, next) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort({ rarity: 1, name: 1 });
    const userBadges = req.user.badges?.map((b) => b.toString()) || [];

    const enriched = badges.map((b) => ({
      ...b.toObject(),
      isEarned: userBadges.includes(b._id.toString()),
    }));

    res.json({ success: true, data: enriched });
  } catch (e) { next(e); }
});

router.post('/badges', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const badge = await Badge.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: badge });
  } catch (e) { next(e); }
});

router.put('/badges/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!badge) throw new AppError('Badge not found', 404);
    res.json({ success: true, data: badge });
  } catch (e) { next(e); }
});

// ===== REWARDS =====
router.get('/rewards', authenticate, async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const rewards = await Reward.find(filter).sort({ pointsRequired: 1 });
    res.json({ success: true, data: rewards });
  } catch (e) { next(e); }
});

router.post('/rewards', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const reward = await Reward.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: reward });
  } catch (e) { next(e); }
});

router.put('/rewards/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reward) throw new AppError('Reward not found', 404);
    res.json({ success: true, data: reward });
  } catch (e) { next(e); }
});

// REDEEM reward
router.post('/rewards/:id/redeem', authenticate, async (req, res, next) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) throw new AppError('Reward not found', 404);
    if (reward.status !== 'Active') throw new AppError('Reward is not available', 400);
    if (reward.stock <= 0) throw new AppError('Reward is out of stock', 400);

    const user = await User.findById(req.user._id);
    if (user.points < reward.pointsRequired) {
      throw new AppError(`Insufficient points. You have ${user.points} points, need ${reward.pointsRequired}`, 400);
    }

    // Deduct points and reduce stock atomically
    const [updatedUser, updatedReward] = await Promise.all([
      User.findByIdAndUpdate(req.user._id, { $inc: { points: -reward.pointsRequired } }, { new: true }),
      Reward.findByIdAndUpdate(req.params.id, { $inc: { stock: -1, totalRedeemed: 1 } }, { new: true }),
    ]);

    const redemption = await RewardRedemption.create({
      employee: req.user._id,
      reward: req.params.id,
      pointsDeducted: reward.pointsRequired,
    });

    await createNotification({
      recipientId: req.user._id,
      type: 'reward_redemption',
      title: `Reward Redeemed: ${reward.name}`,
      message: `You successfully redeemed "${reward.name}" for ${reward.pointsRequired} points. Your new balance: ${updatedUser.points} points.`,
      link: '/gamification/rewards',
      priority: 'medium',
    });

    res.status(201).json({
      success: true,
      data: redemption,
      message: `Successfully redeemed "${reward.name}"`,
      newBalance: updatedUser.points,
    });
  } catch (e) { next(e); }
});

// Redemption history
router.get('/redemptions', authenticate, async (req, res, next) => {
  try {
    const filter = req.user.role === 'employee' ? { employee: req.user._id } : {};
    const redemptions = await RewardRedemption.find(filter)
      .populate('reward', 'name image category')
      .populate('employee', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: redemptions });
  } catch (e) { next(e); }
});

// ===== LEADERBOARD =====
router.get('/leaderboard', authenticate, async (req, res, next) => {
  try {
    const { type = 'xp', limit = 10, department } = req.query;
    const filter = { isActive: true };
    if (department) filter.department = department;

    const sortField = type === 'points' ? { points: -1 } : { xp: -1 };

    const users = await User.find(filter)
      .select('name email avatar xp points totalChallengesCompleted department')
      .populate('department', 'name code')
      .sort(sortField)
      .limit(Number(limit));

    // Add rank
    const ranked = users.map((u, i) => ({ ...u.toObject(), rank: i + 1 }));

    // Find current user's rank
    const currentUserRank = ranked.findIndex((u) => u._id.toString() === req.user._id.toString()) + 1;

    res.json({ success: true, data: ranked, currentUserRank });
  } catch (e) { next(e); }
});

// Department leaderboard
router.get('/dept-leaderboard', authenticate, async (req, res, next) => {
  try {
    const { period } = req.query;
    const { default: DepartmentScore } = await import('../models/DepartmentScore.js');
    
    const filter = period ? { period } : {};
    const scores = await DepartmentScore.find(filter)
      .populate('department', 'name code')
      .sort({ totalScore: -1 });

    const ranked = scores.map((s, i) => ({ ...s.toObject(), rank: i + 1 }));
    res.json({ success: true, data: ranked });
  } catch (e) { next(e); }
});

export default router;
