import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface LeadNotificationData {
  name: string;
  company: string;
  email: string;
  country: string;
  whatsapp?: string;
  productInterest: string;
  quantity?: number;
  customizationRequirements?: string;
  submittedAt: string;
}

/**
 * Send a lead notification email to the EcoPack Global team.
 */
export async function sendLeadNotificationEmail(lead: LeadNotificationData): Promise<{ success: boolean; error?: string }> {
  const to = process.env.NOTIFICATION_EMAIL;
  if (!to) {
    console.error('[Email] NOTIFICATION_EMAIL not configured');
    return { success: false, error: 'Notification email not configured' };
  }

  const subject = `NEW ECOPACK GLOBAL B2B ENQUIRY — ${lead.company}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f9f7; border-radius: 12px;">
      <h1 style="color: #0B2F26; font-size: 20px; margin-bottom: 24px; border-bottom: 2px solid #C8A96B; padding-bottom: 12px;">
        NEW B2B LEAD
      </h1>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 8px 12px; font-weight: 600; color: #0B2F26; width: 200px;">Name:</td><td style="padding: 8px 12px;">${lead.name}</td></tr>
        <tr style="background: #f0ede5;"><td style="padding: 8px 12px; font-weight: 600; color: #0B2F26;">Company:</td><td style="padding: 8px 12px;">${lead.company}</td></tr>
        <tr><td style="padding: 8px 12px; font-weight: 600; color: #0B2F26;">Email:</td><td style="padding: 8px 12px;"><a href="mailto:${lead.email}" style="color: #1C4A3B;">${lead.email}</a></td></tr>
        <tr style="background: #f0ede5;"><td style="padding: 8px 12px; font-weight: 600; color: #0B2F26;">Country:</td><td style="padding: 8px 12px;">${lead.country}</td></tr>
        <tr><td style="padding: 8px 12px; font-weight: 600; color: #0B2F26;">WhatsApp:</td><td style="padding: 8px 12px;">${lead.whatsapp || '—'}</td></tr>
        <tr style="background: #f0ede5;"><td style="padding: 8px 12px; font-weight: 600; color: #0B2F26;">Product Interest:</td><td style="padding: 8px 12px;">${lead.productInterest}</td></tr>
        <tr><td style="padding: 8px 12px; font-weight: 600; color: #0B2F26;">Quantity:</td><td style="padding: 8px 12px;">${lead.quantity || '—'}</td></tr>
        <tr style="background: #f0ede5;"><td style="padding: 8px 12px; font-weight: 600; color: #0B2F26;">Customization:</td><td style="padding: 8px 12px;">${lead.customizationRequirements || '—'}</td></tr>
        <tr><td style="padding: 8px 12px; font-weight: 600; color: #0B2F26;">Date & Time:</td><td style="padding: 8px 12px;">${lead.submittedAt}</td></tr>
        <tr style="background: #f0ede5;"><td style="padding: 8px 12px; font-weight: 600; color: #0B2F26;">Lead Status:</td><td style="padding: 8px 12px; color: #C8A96B; font-weight: 600;">New</td></tr>
      </table>
      <p style="margin-top: 24px; font-size: 12px; color: #666;">This is an automated notification from EcoPack Global website.</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'EcoPack Global <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[Email] Send failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Email] Exception:', err);
    return { success: false, error: 'Email service unavailable' };
  }
}
