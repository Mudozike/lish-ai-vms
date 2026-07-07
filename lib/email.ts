import { Resend } from 'resend';

// Lazy getter — only instantiates when called at runtime, never at build time
function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

export async function sendApprovalEmail(
  visitorEmail: string,
  visitorName: string,
  hostName: string,
  qrCodeImageUrl: string,
  visitDate: string
) {
  const resend = getResend();
  await resend.emails.send({
    from: 'noreply@lishailabs.com',
    to: visitorEmail,
    subject: 'Your Visit Has Been Approved - Lish AI Labs',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Lish AI Labs</h1>
          <p style="margin: 5px 0 0 0;">Visitor Management System</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
          <h2>Hello ${visitorName},</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Great news! Your visit to Lish AI Labs has been approved by <strong>${hostName}</strong>.
          </p>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Your visit is scheduled for: <strong>${visitDate}</strong>
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <p style="color: #4b5563; margin-bottom: 15px;">Please present this QR code at the entrance:</p>
            <img src="${qrCodeImageUrl}" alt="QR Code" style="max-width: 300px; height: auto; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px;" />
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Important Information</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>Arrive at least 10 minutes before your scheduled time</li>
              <li>Have a valid ID with you</li>
              <li>Check in at the security desk upon arrival</li>
              <li>Follow all facility guidelines and security protocols</li>
            </ul>
          </div>
          
          <p style="color: #4b5563; font-size: 12px; margin-top: 30px;">
            If you have any questions or need to reschedule, please contact us at info@lishailabs.com
          </p>
        </div>
      </div>
    `,
  });

  return { success: true };
}

export async function sendRejectionEmail(
  visitorEmail: string,
  visitorName: string,
  hostName: string,
  rejectionReason: string
) {
  const resend = getResend();
  await resend.emails.send({
    from: 'noreply@lishailabs.com',
    to: visitorEmail,
    subject: 'Visit Application Update - Lish AI Labs',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Lish AI Labs</h1>
          <p style="margin: 5px 0 0 0;">Visitor Management System</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
          <h2>Hello ${visitorName},</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for your interest in visiting Lish AI Labs. Unfortunately, your visit application could not be approved at this time.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #ef4444;">Reason</h3>
            <p style="color: #4b5563; margin: 0;">${rejectionReason}</p>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">
            If you have any questions or would like to discuss this further, please contact ${hostName} or reach out to us at info@lishailabs.com
          </p>
        </div>
      </div>
    `,
  });

  return { success: true };
}

export async function sendCheckInNotification(
  hostEmail: string,
  hostName: string,
  visitorName: string,
  purpose: string
) {
  const resend = getResend();
  await resend.emails.send({
    from: 'noreply@lishailabs.com',
    to: hostEmail,
    subject: `Visitor Check-In Notification - ${visitorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Lish AI Labs</h1>
          <p style="margin: 5px 0 0 0;">Visitor Management System</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
          <h2>Hello ${hostName},</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Your visitor has just checked in:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Visitor:</strong> ${visitorName}</p>
            <p style="margin: 5px 0;"><strong>Purpose:</strong> ${purpose}</p>
            <p style="margin: 5px 0;"><strong>Check-In Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p style="color: #4b5563; font-size: 12px; margin-top: 30px;">
            This is an automated notification from the Visitor Management System.
          </p>
        </div>
      </div>
    `,
  });

  return { success: true };
}
