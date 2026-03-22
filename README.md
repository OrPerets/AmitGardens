# Amit Gardens

A monthly scheduling application for managing gardeners and their assignments.

## Setup

### Requirements

- Node.js 18+
- MongoDB Atlas (or compatible) connection string

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` file with your environment variables. For Gmail example:
   
   ```env
   # Required
   MONGODB_URI=mongodb://localhost:27017/amit-gardens
   NEXT_ADMIN_EMAIL=admin@example.com
   NEXT_ADMIN_PASSWORD=your-secure-password
   CRYPTO_TOKEN_SALT=your-random-salt
   SESSION_SECRET=your-session-secret
   
   # Email & WhatsApp (optional - if not set, messages will be logged to console)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   EMAIL_FROM=your-email@gmail.com
   NEXTAUTH_URL=http://localhost:3000
   
   # WhatsApp Production (set to 'true' to enable real WhatsApp sending)
   ENABLE_WHATSAPP_PRODUCTION=false
   
   # WhatsApp Provider: 'twilio' (no QR code) or leave empty (WhatsApp Web.js with QR code)
   WHATSAPP_PROVIDER=twilio
   
   # Twilio Configuration (for WhatsApp without QR code)
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. On first run, visit [`/api/admin/init`](http://localhost:3000/api/admin/init) to create database indexes and seed demo data.

### Build


```bash
npm run build
npm start
```

## Deployment

The project is designed for [Vercel](https://vercel.com/).

Set the following environment variables in the deployment platform:

**Required:**
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - Database name  
- `NEXT_ADMIN_EMAIL` - Admin login email
- `NEXT_ADMIN_PASSWORD` - Admin login password
- `CRYPTO_TOKEN_SALT` - Salt for token hashing
- `SESSION_SECRET` - Session cookie secret

**Email & WhatsApp Configuration (for "שלח טפסים" feature):**
- `SMTP_HOST` - SMTP server (e.g., smtp.gmail.com)
- `SMTP_PORT` - SMTP port (usually 587)
- `SMTP_SECURE` - Set to 'true' for port 465, 'false' for others
- `SMTP_USER` - Email username
- `SMTP_PASS` - Email password (use App Password for Gmail)
- `EMAIL_FROM` - From email address
- `NEXTAUTH_URL` - Your app URL (for email/WhatsApp links)
- `ENABLE_WHATSAPP_PRODUCTION` - Set to 'true' for real WhatsApp sending (default: 'false')
- `WHATSAPP_PROVIDER` - Set to 'twilio' for no QR code, or leave empty for WhatsApp Web.js
- `TWILIO_ACCOUNT_SID` - Twilio Account SID (if using Twilio)
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token (if using Twilio)
- `TWILIO_WHATSAPP_FROM` - Twilio WhatsApp number (default: sandbox number)

**WhatsApp Setup Options:**

### Option 1: Twilio WhatsApp API (Recommended - No QR Code)**
1. Set `WHATSAPP_PROVIDER=twilio` and `ENABLE_WHATSAPP_PRODUCTION=true`
2. Sign up at [Twilio Console](https://console.twilio.com/)
3. Get your Account SID and Auth Token
4. Use Twilio WhatsApp sandbox for testing (free)
5. No QR code scanning required!

### Option 2: WhatsApp Web.js (QR Code Required)**
1. Leave `WHATSAPP_PROVIDER` empty and set `ENABLE_WHATSAPP_PRODUCTION=true`
2. Restart your application
3. Scan the QR code that appears in the console with WhatsApp on your phone
4. WhatsApp will stay authenticated until you log out or the session expires

After deploy, run `/api/admin/init` once to prepare the database.

## Production WhatsApp Setup

### Twilio WhatsApp Setup (Recommended - No QR Code):

1. **Create Twilio Account:**
   - Sign up at [https://console.twilio.com/](https://console.twilio.com/)
   - Get free trial credits

2. **Get Credentials:**
   - Find your **Account SID** and **Auth Token** in the Twilio Console dashboard

3. **Set Environment Variables:**
   ```env
   ENABLE_WHATSAPP_PRODUCTION=true
   WHATSAPP_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your-account-sid-here
   TWILIO_AUTH_TOKEN=your-auth-token-here
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

4. **WhatsApp Sandbox Setup (For Testing):**
   - Go to Console → Messaging → Try it out → Send a WhatsApp message
   - Send "join [sandbox-keyword]" to the Twilio sandbox number from your phone
   - Add test numbers (like +972544563855) to the sandbox

5. **Verify Setup:**
   - Visit your admin dashboard
   - Click "בדוק WhatsApp" button
   - Should show "Twilio WhatsApp is configured and ready"

6. **Send Test Messages:**
   - Click "שלח טפסים" - WhatsApp messages will be sent via Twilio!

### WhatsApp Web.js Setup (QR Code Required):

1. **Enable Production Mode:**
   ```env
   ENABLE_WHATSAPP_PRODUCTION=true
   # Don't set WHATSAPP_PROVIDER (leave empty)
   ```

2. **First-Time Setup:**
   - Deploy with the environment variable set
   - Check your application logs/console
   - You'll see a QR code printed to the console
   - Scan it with WhatsApp on your phone (same as WhatsApp Web)

3. **Verify Setup:**
   - Visit your admin dashboard 
   - Click "בדוק WhatsApp" button
   - Should show "Ready: Yes" when authenticated

### Production Considerations:

- **Twilio**: Easier setup, more reliable, paid service after free credits
- **WhatsApp Web.js**: Free but requires QR code and session management
- **Rate Limits:** WhatsApp has sending limits - avoid spam-like behavior
- **Phone Numbers:** Test with sandbox first, then apply for production approval

## Security Notes

- Magic links are generated per gardener and stored as SHA-256 hashes using `CRYPTO_TOKEN_SALT`.
- Admin login uses credentials from env variables and a signed session cookie (`SESSION_SECRET`).
- Public routes implement basic rate limiting.
- All API routes use Zod validators and normalized dates (midnight local time) to ensure consistency.

## Development

- TypeScript strict mode, ESLint and Prettier are configured.
- Useful scripts:
  - `npm run dev` – start dev server
  - `npm run build` / `npm start` – build and run production
  - `npm run lint` – run ESLint
  - `npm run format` – format with Prettier

## Features

- Admin dashboard with KPIs, filtering and actions (CSV export, link creation, lock/unlock, reminders).
- Per-gardener plan page with assignment editing and submission flow.
- **Email & WhatsApp notifications** - Send gardening schedule requests via both channels.
- CSV export uses UTF‑8 with BOM for Hebrew compatibility.
- RTL Hebrew support throughout the application.

