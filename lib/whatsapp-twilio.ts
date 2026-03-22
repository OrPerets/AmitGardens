import twilio from 'twilio';

interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class TwilioWhatsAppService {
  private client: ReturnType<typeof twilio> | null = null;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Twilio sandbox number

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<WhatsAppResult> {
    try {
      if (!this.client) {
        return {
          success: false,
          error: 'Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN'
        };
      }

      // Format phone number for WhatsApp (add whatsapp: prefix)
      const formattedTo = phoneNumber.startsWith('whatsapp:') 
        ? phoneNumber 
        : `whatsapp:${phoneNumber}`;

      console.log(`📱 Sending WhatsApp via Twilio to ${formattedTo}`);

      const twilioMessage = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedTo
      });

      console.log(`📱 Twilio WhatsApp sent successfully: ${twilioMessage.sid}`);

      return {
        success: true,
        messageId: twilioMessage.sid
      };

    } catch (error: unknown) {
      console.error('📱 Twilio WhatsApp error:', error);
      
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object' && 'code' in error) {
        const twilioError = error as { code: number; message?: string };
        if (twilioError.code === 21614) {
          errorMessage = 'WhatsApp number not verified in Twilio sandbox. Add to sandbox first.';
        } else if (twilioError.code === 21408) {
          errorMessage = 'Permission denied. Check Twilio credentials.';
        } else if (twilioError.message) {
          errorMessage = twilioError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  getStatus(): { configured: boolean; fromNumber: string } {
    return {
      configured: !!this.client,
      fromNumber: this.fromNumber
    };
  }
}

// Create singleton instance
let twilioWhatsAppService: TwilioWhatsAppService | null = null;

export function getTwilioWhatsAppService(): TwilioWhatsAppService {
  if (!twilioWhatsAppService) {
    twilioWhatsAppService = new TwilioWhatsAppService();
  }
  return twilioWhatsAppService;
}
