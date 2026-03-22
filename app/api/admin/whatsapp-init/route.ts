import { NextRequest, NextResponse } from 'next/server';
import { readAdminFromAuthorization } from '@/lib/adminAuth';
import { jsonError } from '@/lib/api';
import { getWhatsAppService } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  const session = readAdminFromAuthorization(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);

  try {
    const enableRealWhatsApp = process.env.ENABLE_WHATSAPP_PRODUCTION === 'true';
    
    if (!enableRealWhatsApp) {
      return NextResponse.json({ 
        success: false,
        message: 'WhatsApp production mode is not enabled. Set ENABLE_WHATSAPP_PRODUCTION=true'
      });
    }

    console.log('📱 Manually initializing WhatsApp service...');
    
    // Get the service (this will trigger QR code if not authenticated)
    const whatsappService = getWhatsAppService();
    const status = await whatsappService.getStatus();
    
    return NextResponse.json({
      success: true,
      message: status.ready 
        ? 'WhatsApp is already ready!' 
        : 'WhatsApp initialization triggered. Check console for QR code.',
      status: status
    });

  } catch (error) {
    console.error('Error initializing WhatsApp:', error);
    return jsonError('server_error', 'Failed to initialize WhatsApp', 500);
  }
}
