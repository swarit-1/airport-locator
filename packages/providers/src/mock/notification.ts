import type { NotificationProvider } from '../interfaces';

export class MockNotificationProvider implements NotificationProvider {
  async sendPush(userId: string, title: string, body: string): Promise<void> {
    console.log(`[MockNotification] Push to ${userId}: ${title} - ${body}`);
  }

  async sendEmail(email: string, subject: string, html: string): Promise<void> {
    console.log(`[MockNotification] Email to ${email}: ${subject}`);
  }
}
