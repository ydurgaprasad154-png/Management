import cron from 'node-cron';
import Domain from '../models/Domain.js';
import sendEmail from '../utils/emailService.js';
import Notification from '../models/Notification.js';

const startCronJobs = () => {
  // Daily check for expiring domains (at midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily domain expiry check...');
    try {
      const domains = await Domain.find({ status: 'Active', isDeleted: false }).populate({
        path: 'client',
        populate: { path: 'user' }
      });

      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30); // 30 days from now

      for (const domain of domains) {
        if (domain.expiryDate && domain.expiryDate <= nextMonth) {
          // Send email alert to admin/client
          if (domain.client && domain.client.user) {
             const message = `The domain ${domain.domainName} is expiring on ${domain.expiryDate.toDateString()}. Please renew it soon.`;
             
             await Notification.create({
                user: domain.client.user._id,
                type: 'DomainExpiry',
                message
             });

             await sendEmail({
               email: domain.client.user.email,
               subject: 'Domain Expiring Soon!',
               message
             });
          }
        }
      }
    } catch (error) {
      console.error('Error in domain cron job', error);
    }
  });

  // Add more cron jobs here for weekly payment reminders, hosting expiry etc.
};

export default startCronJobs;
