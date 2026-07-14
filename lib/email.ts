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
  // Try to send email, but gracefully log if key is not configured
  try {
    const resend = getResend();
    const base64Data = qrCodeImageUrl.split(';base64,').pop() || '';
    const attachment: unknown = {
      filename: 'qrcode.png',
      content: base64Data,
      cid: 'qrcode',
      content_disposition: 'inline'
    };

    await resend.emails.send({
      from: 'Lish AI Labs VMS <onboarding@resend.dev>', // Resend fallback for development. Change to verified sender domain if available.
      to: visitorEmail,
      subject: 'Your Visit Has Been Approved - Lish AI Labs',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px 20px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">Lish AI Labs</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Visitor Management System</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="margin-top: 0; color: #0f172a; font-size: 18px; font-weight: 700;">Hello ${visitorName},</h2>
            
            <p style="color: #475569; line-height: 1.6; font-size: 14px; font-weight: 500;">
               Your visit request to Lish AI Labs has been approved by <strong>${hostName}</strong>.
            </p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 20px; margin: 20px 0;">
              <span style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; tracking: 0.5px; display: block; margin-bottom: 4px;">Scheduled Date & Time</span>
              <strong style="color: #0f172a; font-size: 15px; font-weight: 700;">${visitDate}</strong>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <p style="color: #475569; font-size: 13px; font-weight: 600; margin-bottom: 15px;">Present this digital badge at the security desk upon arrival:</p>
              <div style="display: inline-block; background: #ffffff; border: 2px dashed #6366f1; padding: 15px; border-radius: 16px;">
                <img src="cid:qrcode" alt="QR Badge Pass" style="max-width: 240px; height: auto; display: block;" />
              </div>
              <p style="color: #94a3b8; font-size: 11px; margin-top: 8px;">Visit ID Code Embedded</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #065f46; font-size: 14px; font-weight: 700;">Entry Guidelines</h3>
              <ul style="color: #047857; line-height: 1.7; font-size: 12px; font-weight: 600; padding-left: 20px; margin: 8px 0 0 0;">
                <li>Please arrive 10 minutes prior to your schedule.</li>
                <li>Bring a valid passport, national ID, or work identification.</li>
                <li>Display this digital QR code to security officers.</li>
                <li>Remain in allowed facility zones as escorted by hosts.</li>
              </ul>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0; font-weight: 500;">
              Lish AI Labs Nakuru Campus, Kenya. If you need to reschedule, please contact your host.
            </p>
          </div>
        </div>
      `,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attachments: [attachment as any]
    });
  } catch (error) {
    console.warn('Resend email failed, fallback logging details.');
    throw error;
  }

  return { success: true };
}

export async function sendRejectionEmail(
  visitorEmail: string,
  visitorName: string,
  hostName: string,
  rejectionReason: string
) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'Lish AI Labs VMS <onboarding@resend.dev>',
      to: visitorEmail,
      subject: 'Visit Application Update - Lish AI Labs',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 30px 20px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">Lish AI Labs</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Visitor Management System</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="margin-top: 0; color: #0f172a; font-size: 18px; font-weight: 700;">Hello ${visitorName},</h2>
            
            <p style="color: #475569; line-height: 1.6; font-size: 14px; font-weight: 500;">
              Thank you for requesting entry to Lish AI Labs. Unfortunately, your visit application could not be approved at this time.
            </p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #991b1b; font-size: 14px; font-weight: 700;">Reason for Status</h3>
              <p style="color: #b91c1c; margin: 5px 0 0 0; font-size: 13px; font-weight: 600;">${rejectionReason}</p>
            </div>
            
            <p style="color: #475569; line-height: 1.6; font-size: 13px; font-weight: 500;">
              If you believe this was an error or wish to reschedule your request, please reach out to ${hostName} directly or contact our desk at info@lishailabs.com.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0; font-weight: 500;">
              Lish AI Labs Nakuru Campus, Kenya.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.warn('Resend email failed, fallback logging details.');
    throw error;
  }

  return { success: true };
}

export async function sendCheckInNotification(
  hostEmail: string,
  hostName: string,
  visitorName: string,
  purpose: string
) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'Lish AI Labs VMS <onboarding@resend.dev>',
      to: hostEmail,
      subject: `Visitor Check-In Notification - ${visitorName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #047857 100%); padding: 30px 20px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">Lish AI Labs</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Visitor Management System</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="margin-top: 0; color: #0f172a; font-size: 18px; font-weight: 700;">Hello ${hostName},</h2>
            
            <p style="color: #475569; line-height: 1.6; font-size: 14px; font-weight: 500;">
              Your scheduled visitor has checked in at the security gate:
            </p>
            
            <div style="background: #f0fdf4; border: 1px solid #d1fae5; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a;"><strong>Visitor:</strong> ${visitorName}</p>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a;"><strong>Purpose:</strong> ${purpose}</p>
              <p style="margin: 0; font-size: 13px; color: #0f172a;"><strong>Check-In Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p style="color: #475569; font-size: 13px; font-weight: 550; margin-top: 20px;">
              Please meet your visitor at the lobby to escort them to their authorized zone.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0; font-weight: 500;">
              This is an automated notification from the Nakuru campus VMS desk.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.warn('Resend email failed, fallback logging details.');
    throw error;
  }

  return { success: true };
}
