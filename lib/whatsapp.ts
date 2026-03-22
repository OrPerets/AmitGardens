import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode-terminal';
import path from 'path';

class WhatsAppService {
  private client: Client | null = null;
  private isReady = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.setupClient();
    return this.initPromise;
  }

  private async setupClient() {
    try {
      // Create WhatsApp client with local authentication
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'amit-gardens-whatsapp',
          dataPath: path.join(process.cwd(), '.whatsapp-session')
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        }
      });

      // QR Code event - scan this to authenticate
      this.client.on('qr', (qr) => {
        console.log('\n🔥 WHATSAPP SETUP REQUIRED 🔥');
        console.log('📱 Scan this QR code with WhatsApp on your phone:');
        console.log('=' .repeat(50));
        QRCode.generate(qr, { small: true });
        console.log('=' .repeat(50));
        console.log('📱 Steps: WhatsApp → Settings → Linked Devices → Link a Device');
        console.log('📱 Then scan the QR code above');
        console.log('📱 After scanning, WhatsApp will be ready for production use!');
        console.log('');
      });

      // Authentication events
      this.client.on('authenticated', () => {
        console.log('\n✅ WhatsApp authenticated successfully!');
      });

      this.client.on('auth_failure', (msg) => {
        console.error('\n❌ WhatsApp authentication failed:', msg);
        console.error('📱 You may need to scan the QR code again');
      });

      // Ready event - client is ready to send messages
      this.client.on('ready', () => {
        console.log('\n🚀 WhatsApp client is ready for production!');
        console.log('📱 You can now send WhatsApp messages to gardeners');
        console.log('📱 Try clicking "שלח טפסים" in the admin dashboard\n');
        this.isReady = true;
      });

      // Disconnection handling
      this.client.on('disconnected', (reason) => {
        console.log('📱 WhatsApp client was disconnected:', reason);
        this.isReady = false;
      });

      // Error handling
      this.client.on('error', (error) => {
        console.error('📱 WhatsApp client error:', error);
      });

      // Initialize the client
      await this.client.initialize();

    } catch (error) {
      console.error('📱 Failed to initialize WhatsApp client:', error);
      throw error;
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Ensure client is initialized and ready
      if (!this.client) {
        await this.initialize();
      }

      if (!this.isReady) {
        return {
          success: false,
          error: 'WhatsApp client is not ready. Please ensure you have scanned the QR code.'
        };
      }

      // Format phone number (remove + and add @c.us for WhatsApp)
      const formattedNumber = phoneNumber.replace(/\+/g, '') + '@c.us';

      // Check if number is registered on WhatsApp
      const isRegistered = await this.client!.isRegisteredUser(formattedNumber);
      if (!isRegistered) {
        return {
          success: false,
          error: `Phone number ${phoneNumber} is not registered on WhatsApp`
        };
      }

      // Send the message
      const sentMessage = await this.client!.sendMessage(formattedNumber, message);
      
      console.log(`📱 WhatsApp message sent to ${phoneNumber}`);
      
      return {
        success: true,
        messageId: sentMessage.id.id
      };

    } catch (error) {
      console.error(`📱 Failed to send WhatsApp message to ${phoneNumber}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown WhatsApp error'
      };
    }
  }

  async getStatus(): Promise<{ ready: boolean; client: boolean }> {
    return {
      ready: this.isReady,
      client: !!this.client
    };
  }

  async destroy() {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
    }
  }
}

// Create singleton instance
let whatsappService: WhatsAppService | null = null;

export function getWhatsAppService(): WhatsAppService {
  if (!whatsappService) {
    whatsappService = new WhatsAppService();
  }
  return whatsappService;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (whatsappService) {
    console.log('📱 Shutting down WhatsApp service...');
    await whatsappService.destroy();
  }
  process.exit();
});
