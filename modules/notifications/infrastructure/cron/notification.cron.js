import cron from 'node-cron';
import Notification from '../../models/notification.model.js';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export function startNotificationCleanupJob() {
    
  cron.schedule('0 0 * * *', async () => {
    try {
      const cutoffDate = new Date(Date.now() - THIRTY_DAYS);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true
      });

      console.log(`Notification cleanup completed. Deleted ${result.deletedCount || 0} old notifications.`);
    } catch (err) {
      console.error('Error during notification cleanup:', err);
    }
  });

  console.log('[NotificationCleanup] Daily cleanup job scheduled.');
}