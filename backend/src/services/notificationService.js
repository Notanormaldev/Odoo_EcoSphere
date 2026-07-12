import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendNotificationEmail } from './emailService.js';
import ESGConfig from '../models/ESGConfig.js';

/**
 * Create an in-app notification and optionally send email
 */
export const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  link = null,
  priority = 'medium',
  metadata = {},
  sendEmail = false,
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      priority,
      metadata,
    });

    // Send email if enabled
    if (sendEmail) {
      const config = await ESGConfig.findOne();
      if (config?.notifications?.emailEnabled) {
        const user = await User.findById(recipientId);
        if (user && user.notificationPreferences?.email) {
          await sendNotificationEmail(user.email, user.name, title, message, link);
          notification.emailSent = true;
          await notification.save();
        }
      }
    }

    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error);
    return null;
  }
};

/**
 * Notify all admins and managers
 */
export const notifyAdmins = async ({ type, title, message, link, priority = 'high', metadata = {} }) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'manager'] }, isActive: true });
    const promises = admins.map((admin) =>
      createNotification({
        recipientId: admin._id,
        type,
        title,
        message,
        link,
        priority,
        metadata,
        sendEmail: true,
      })
    );
    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Notify admins failed:', error);
  }
};

/**
 * Notify a specific department
 */
export const notifyDepartment = async (departmentId, notifData) => {
  try {
    const users = await User.find({ department: departmentId, isActive: true });
    const promises = users.map((user) =>
      createNotification({ ...notifData, recipientId: user._id })
    );
    await Promise.allSettled(promises);
  } catch (error) {
    console.error('Notify department failed:', error);
  }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return { notifications, total, unreadCount, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Mark notifications as read
 */
export const markAsRead = async (userId, notificationIds = null) => {
  const filter = { recipient: userId };
  if (notificationIds?.length) {
    filter._id = { $in: notificationIds };
  }
  await Notification.updateMany(filter, {
    $set: { isRead: true, readAt: new Date() },
  });
};
