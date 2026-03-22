import { NextRequest, NextResponse } from 'next/server';
import { readAdminFromAuthorization } from '@/lib/adminAuth';
import { jsonError } from '@/lib/api';
import { listGardeners } from '@/lib/repositories/gardeners';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import nodemailer from 'nodemailer';
import { getWhatsAppService } from '@/lib/whatsapp';
import { getTwilioWhatsAppService } from '@/lib/whatsapp-twilio';

// Real email service using nodemailer
async function sendEmail(to: string, subject: string, htmlBody: string) {
  // Check if email is configured
  const emailConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

  // If email is not configured, fall back to console logging
  if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
    console.log('📧 Email not configured, logging instead:');
    console.log('📧 To:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 From:', fromEmail);
    console.log('📧 Body preview:', htmlBody.substring(0, 200) + '...');
    
    // Return mock success for development
    return { success: true, messageId: `dev-${Date.now()}` };
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig);

    // Send email
    const info = await transporter.sendMail({
      from: `"מערכת ניהול גינון - עמית אקסלנס" <${fromEmail}>`,
      to: to,
      subject: subject,
      html: htmlBody,
    });

    console.log('📧 Email sent successfully to:', to, 'MessageID:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('📧 Failed to send email to', to, ':', error);
    throw error;
  }
}

// WhatsApp message service
async function sendWhatsAppMessage(to: string, message: string) {
  const enableRealWhatsApp = process.env.ENABLE_WHATSAPP_PRODUCTION === 'true';
  const useTwilio = process.env.WHATSAPP_PROVIDER === 'twilio';
  
  if (enableRealWhatsApp) {
    if (useTwilio) {
      // TWILIO MODE: Send via Twilio WhatsApp API (no QR code required)
      try {
        const twilioService = getTwilioWhatsAppService();
        const result = await twilioService.sendMessage(to, message);
        
        if (result.success) {
          return { success: true, messageId: result.messageId || `twilio-${Date.now()}` };
        } else {
          console.error(`📱 Twilio WhatsApp failed to ${to}:`, result.error);
          throw new Error(result.error || 'Twilio WhatsApp sending failed');
        }
      } catch (error) {
        console.error(`📱 Twilio WhatsApp error for ${to}:`, error);
        throw error;
      }
    } else {
      // WHATSAPP WEB.JS MODE: Send real WhatsApp messages (QR code required)
      try {
        const whatsappService = getWhatsAppService();
        const result = await whatsappService.sendMessage(to, message);
        
        if (result.success) {
          console.log(`📱 WhatsApp sent to ${to}`);
          return { success: true, messageId: result.messageId || `whatsapp-${Date.now()}` };
        } else {
          console.error(`📱 WhatsApp failed to ${to}:`, result.error);
          throw new Error(result.error || 'WhatsApp sending failed');
        }
      } catch (error) {
        console.error(`📱 WhatsApp error for ${to}:`, error);
        throw error;
      }
    }
  } else {
    // DEVELOPMENT MODE: Log to console
    console.log(`📱 WhatsApp (DEV) → ${to}`);
    console.log('Message:', message.substring(0, 100) + '...');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Return mock success
    return { success: true, messageId: `whatsapp-dev-${Date.now()}` };
  }
}

function generateWhatsAppMessage(gardenerName: string, plan: string): string {
  const [year, month] = plan.split('-');
  const planDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const planDisplay = format(planDate, 'LLLL, yyyy', { locale: he });
  
  const link = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/plan/${plan}?gardener=${encodeURIComponent(gardenerName)}`;
  
  return `🌱 *בקשה למילוי לו״ח גינון* 🌱

שלום ${gardenerName},

מצורף לינק עבור מילוי לו״ח גינון לחודש *${planDisplay}*

🔗 ${link}

⏰ *להתיחסותך בהקדם*

---
🌿 מערכת ניהול גינון עמית
הודעה אוטומטית`;
}

function generateEmailTemplate(gardenerName: string, plan: string) {
  const [year, month] = plan.split('-');
  const planDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const planDisplay = format(planDate, 'LLLL, yyyy', { locale: he });
  
  const link = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/plan/${plan}?gardener=${encodeURIComponent(gardenerName)}`;
  
  return `
<!DOCTYPE html>
<html lang="he" dir="rtl" style="direction: rtl;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>בקשה למילוי לו״ח גינון</title>
    <style>
        body { 
            font-family: 'Alef', Arial, sans-serif; 
            direction: rtl; 
            text-align: right; 
            margin: 0; 
            padding: 20px;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #27ae60, #2ecc71); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
        }
        .header h1 { 
            font-size: 32px; 
            margin: 0; 
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .content { 
            padding: 40px 30px; 
        }
        .greeting { 
            font-size: 20px; 
            color: #2c3e50; 
            margin-bottom: 25px;
            font-weight: 500;
        }
        .message { 
            font-size: 18px; 
            line-height: 1.8; 
            color: #34495e; 
            margin-bottom: 35px;
        }
        .link-box {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border: 2px solid #27ae60;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            text-decoration: none;
            padding: 18px 35px;
            border-radius: 10px;
            font-size: 20px;
            font-weight: bold;
            margin: 15px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
        }
        .urgent-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            color: #856404;
            font-size: 16px;
            font-weight: 500;
            text-align: center;
        }
        .footer {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 25px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            line-height: 1.5;
            border-top: 3px solid #27ae60;
        }
        .decorative-line {
            height: 4px;
            background: linear-gradient(270deg, #27ae60, #2ecc71, #58d68d);
            margin: 20px 0;
            border-radius: 2px;
        }
    </style>
</head>
<body dir="rtl" style="direction: rtl; text-align: right;">
    <div class="container">
        <div class="header" dir="rtl">
            <h1 class="hebrew-text" dir="rtl">בקשה למילוי לו״ח גינון</h1>
        </div>
        
        <div class="content" dir="rtl">
            <div class="greeting hebrew-text" dir="rtl">שלום ${gardenerName},</div>
            
            <div class="message hebrew-text" dir="rtl">
                מצורף לינק עבור מילוי לו״ח גינון לחודש ${planDisplay}
            </div>
            
            <div class="link-box" dir="rtl">
                <div class="hebrew-text" dir="rtl" style="margin-bottom: 15px; font-size: 18px; color: #27ae60; font-weight: 600;">
                    🌱 לחץ כאן למילוי הלו״ח 🌱
                </div>
                <a href="${link}" class="cta-button hebrew-text" dir="rtl">
                    מילוי לו״ח גינון
                </a>
            </div>
            
            <div class="decorative-line"></div>
            
            <div class="urgent-note hebrew-text" dir="rtl">
                להתיחסותך בהקדם
            </div>
        </div>
        
        <div class="footer" dir="rtl">
            <div class="hebrew-text" dir="rtl" style="margin-bottom: 10px;">🌿 מערכת ניהול גינון עמית 🌿</div>
            <div class="hebrew-text" dir="rtl">הודעה זו נשלחה באופן אוטומטי</div>
        </div>
    </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const session = readAdminFromAuthorization(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);

  try {
    const body = await req.json();
    const { plan } = body;

    if (!plan || typeof plan !== 'string') {
      return jsonError('invalid_plan', 'Plan parameter is required', 400);
    }

    console.log('📧 Send forms requested by', session.email, 'for plan', plan);

    // Get all gardeners
    const gardeners = await listGardeners();
    const gardenersWithContact = gardeners.filter(g => g.email || g.phone);

    if (gardenersWithContact.length === 0) {
      return jsonError('no_gardeners', 'No gardeners with contact information found', 400);
    }

    // Send messages to all gardeners (both email and WhatsApp)
    const results = [];
    
    for (const gardener of gardenersWithContact) {
      const gardenerResult = {
        gardener: gardener.name,
        email: gardener.email,
        phone: gardener.phone,
        emailSuccess: false,
        whatsappSuccess: false,
        errors: [] as string[]
      };

      // Send email if available
      if (gardener.email) {
        try {
          const subject = `בקשה למילוי לו״ח גינון - ${gardener.name} - ${plan}`;
          const htmlBody = generateEmailTemplate(gardener.name, plan);
          await sendEmail(gardener.email, subject, htmlBody);
          gardenerResult.emailSuccess = true;
        } catch (error) {
          console.error('Failed to send email to', gardener.email, error);
          gardenerResult.errors.push(`Email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Send WhatsApp if available
      if (gardener.phone) {
        try {
          const whatsappMessage = generateWhatsAppMessage(gardener.name, plan);
          await sendWhatsAppMessage(gardener.phone, whatsappMessage);
          gardenerResult.whatsappSuccess = true;
        } catch (error) {
          console.error('Failed to send WhatsApp to', gardener.phone, error);
          gardenerResult.errors.push(`WhatsApp: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      results.push(gardenerResult);
    }

    const emailSuccessCount = results.filter(r => r.emailSuccess).length;
    const whatsappSuccessCount = results.filter(r => r.whatsappSuccess).length;
    const totalFailures = results.filter(r => !r.emailSuccess && !r.whatsappSuccess).length;
    const whatsappErrors = results.filter(r => r.errors.some(e => e.includes('WhatsApp'))).length;
    
    console.log(`📧 Email sending completed: ${emailSuccessCount} success`);
    console.log(`📱 WhatsApp sending completed: ${whatsappSuccessCount} success`);

    let message = `נשלחו הודעות: ${emailSuccessCount} אימיילים`;
    
    if (process.env.ENABLE_WHATSAPP_PRODUCTION === 'true') {
      message += `, ${whatsappSuccessCount} WhatsApp`;
      
      if (whatsappErrors > 0 && whatsappSuccessCount === 0) {
        message += ` (WhatsApp לא מוכן - לחץ "אתחל WhatsApp" וסרוק QR code)`;
      } else if (whatsappErrors > 0) {
        message += ` (${whatsappErrors} WhatsApp נכשלו)`;
      }
    } else {
      message += ` (WhatsApp: מצב פיתוח)`;
    }
    
    if (totalFailures > 0) {
      message += `, ${totalFailures} נכשלו לחלוטין`;
    }

    return NextResponse.json({ 
      ok: true, 
      message,
      results: results,
      whatsappReady: whatsappSuccessCount > 0 || process.env.ENABLE_WHATSAPP_PRODUCTION !== 'true'
    });

  } catch (error) {
    console.error('Error sending forms:', error);
    return jsonError('server_error', 'Failed to send forms', 500);
  }
}
