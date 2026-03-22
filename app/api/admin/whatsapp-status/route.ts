import { NextRequest, NextResponse } from 'next/server';
import { readAdminFromAuthorization } from '@/lib/adminAuth';
import { jsonError } from '@/lib/api';
import { getWhatsAppService } from '@/lib/whatsapp';
import { getTwilioWhatsAppService } from '@/lib/whatsapp-twilio';

export async function GET(req: NextRequest) {
  const session = readAdminFromAuthorization(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);

  try {
    const enableRealWhatsApp = process.env.ENABLE_WHATSAPP_PRODUCTION === 'true';
    const useTwilio = process.env.WHATSAPP_PROVIDER === 'twilio';
    
    if (!enableRealWhatsApp) {
      return NextResponse.json({ 
        mode: 'development',
        provider: 'console',
        ready: true,
        message: 'WhatsApp is in development mode (console logging)'
      });
    }

    if (useTwilio) {
      // Check Twilio status
      const twilioService = getTwilioWhatsAppService();
      const status = twilioService.getStatus();
      
      return NextResponse.json({
        mode: 'production',
        provider: 'twilio',
        ready: status.configured,
        configured: status.configured,
        fromNumber: status.fromNumber,
        message: status.configured 
          ? 'Twilio WhatsApp is configured and ready (no QR code needed)'
          : 'Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.'
      });
    } else {
      // Check WhatsApp Web.js status
      const whatsappService = getWhatsAppService();
      const status = await whatsappService.getStatus();
      
      return NextResponse.json({
        mode: 'production',
        provider: 'whatsapp-web.js',
        ready: status.ready,
        client: status.client,
        message: status.ready 
          ? 'WhatsApp Web.js is ready to send messages' 
          : 'WhatsApp Web.js is not ready. Check console for QR code if first time setup.'
      });
    }

  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    return jsonError('server_error', 'Failed to get WhatsApp status', 500);
  }
}
