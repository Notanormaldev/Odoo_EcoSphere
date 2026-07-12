import User from '../models/User.js';
import Badge from '../models/Badge.js';
import ESGConfig from '../models/ESGConfig.js';
import { createNotification } from './notificationService.js';

/**
 * Check and auto-award badges to an employee
 * Called whenever XP/points/challenges change
 */
export const checkAndAwardBadges = async (userId) => {
  try {
    const config = await ESGConfig.findOne();
    if (!config?.badgeAutoAward) return;

    const user = await User.findById(userId).populate('badges');
    if (!user) return;

    const earnedBadgeIds = new Set(user.badges.map((b) => b._id.toString()));
    const allBadges = await Badge.find({ isActive: true });
    const newlyAwarded = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge._id.toString())) continue;

      let qualifies = false;
      const { type, threshold } = badge.unlockRule;

      switch (type) {
        case 'xp_threshold':
          qualifies = user.xp >= threshold;
          break;
        case 'challenges_completed':
          qualifies = user.totalChallengesCompleted >= threshold;
          break;
        case 'csr_activities': {
          const { default: EmployeeParticipation } = await import('../models/EmployeeParticipation.js');
          const count = await EmployeeParticipation.countDocuments({
            employee: userId,
            approvalStatus: 'Approved',
          });
          qualifies = count >= threshold;
          break;
        }
        default:
          break;
      }

      if (qualifies) {
        newlyAwarded.push(badge);
        earnedBadgeIds.add(badge._id.toString());
      }
    }

    if (newlyAwarded.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { badges: { $each: newlyAwarded.map((b) => b._id) } },
      });

      // Update badge award counts
      await Badge.updateMany(
        { _id: { $in: newlyAwarded.map((b) => b._id) } },
        { $inc: { totalAwarded: 1 } }
      );

      // Send notification for each badge
      for (const badge of newlyAwarded) {
        await createNotification({
          recipientId: userId,
          type: 'badge_unlock',
          title: `Badge Unlocked: ${badge.name}`,
          message: `Congratulations! You've earned the "${badge.name}" badge. ${badge.description}`,
          link: '/gamification/badges',
          priority: 'high',
          metadata: { badgeId: badge._id, badgeName: badge.name, badgeIcon: badge.icon },
          sendEmail: true,
        });
      }
    }

    return newlyAwarded;
  } catch (error) {
    console.error('Badge auto-award error:', error);
    return [];
  }
};

/**
 * Add XP and points to user, then check badges
 */
export const awardXPAndPoints = async (userId, xp = 0, points = 0) => {
  await User.findByIdAndUpdate(userId, {
    $inc: { xp, points },
  });
  await checkAndAwardBadges(userId);
};
