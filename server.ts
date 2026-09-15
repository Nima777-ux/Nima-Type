import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to create email transporter with strict config verification
function getTransporter(): { transporter: Transporter | null; missing: string[] } {
  const host = process.env.SMTP_HOST?.trim();
  const portStr = process.env.SMTP_PORT?.trim();
  const port = portStr ? Number(portStr) : 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  const missing: string[] = [];
  if (!host) missing.push('SMTP_HOST');
  if (!user) missing.push('SMTP_USER');
  if (!pass) missing.push('SMTP_PASS');

  if (missing.length > 0) {
    return { transporter: null, missing };
  }

  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'false' ? false : true,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return { transporter, missing: [] };
}

// API: Health & SMTP configuration check
app.get('/api/health', (_req, res) => {
  const { missing } = getTransporter();
  res.json({
    status: 'ok',
    serverTime: Date.now(),
    smtpConfigured: missing.length === 0,
    missingSmtpKeys: missing,
  });
});

// API: Send verification code email
app.post('/api/send-verification-code', async (req, res) => {
  try {
    const { email, code, name } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const recipientEmail = String(email).trim();
    const recipientName = name ? String(name).trim() : 'User';
    console.log(`[EMAIL DISPATCH] Request to send verification code ${code} to ${recipientEmail} (${recipientName})`);

    const { transporter, missing } = getTransporter();
    if (!transporter) {
      const errMsg = `SMTP email service is not configured on the server. Missing required environment variable(s): ${missing.join(', ')}. Please configure them in Settings.`;
      console.warn(`[EMAIL ERROR] ${errMsg}`);
      return res.status(503).json({
        success: false,
        delivered: false,
        message: errMsg,
        missingConfig: missing,
      });
    }

    const from = process.env.SMTP_FROM?.trim() || `"Nima Type" <${process.env.SMTP_USER?.trim()}>`;
    await transporter.sendMail({
      from,
      to: recipientEmail,
      subject: `Your Nima Type Verification Code: ${code}`,
      text: `Hello ${recipientName},\n\nYour 6-digit verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you did not request this verification code, please disregard this email.\n\nBest regards,\nNima Type Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #F6F5EF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6F5EF; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 480px; background-color: #FFFFFF; border-radius: 16px; border: 2px solid #315C45; overflow: hidden; box-shadow: 0 4px 16px rgba(49,92,69,0.08);" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="background-color: #315C45; padding: 24px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #F6F5EF; font-size: 22px; font-weight: 800; letter-spacing: 1px;">NIMA TYPE</h1>
                      <p style="margin: 4px 0 0; color: #B59B7A; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Account Verification</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 30px;">
                      <p style="margin: 0 0 12px; font-size: 15px; color: #315C45; font-weight: 600;">Hello ${recipientName},</p>
                      <p style="margin: 0 0 24px; font-size: 14px; color: #555555; line-height: 1.6;">
                        Please use the following 6-digit code to verify your email address and activate your Nima Type account:
                      </p>
                      <div style="background-color: #F6F5EF; border: 2px dashed #B59B7A; border-radius: 12px; padding: 18px; text-align: center; margin: 0 0 24px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #315C45; display: inline-block;">
                          ${code}
                        </span>
                      </div>
                      <p style="margin: 0 0 8px; font-size: 13px; color: #777777; line-height: 1.5;">
                        ⏰ <strong>This code is valid for 15 minutes.</strong>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.5;">
                        If you did not request this verification code, you can safely disregard this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #F6F5EF; padding: 16px 30px; border-top: 1px solid #E5E2D8; text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: #888888;">
                        Nima Type • Flight Speed Typing Platform
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`[EMAIL SUCCESS] Verification email sent to ${recipientEmail}`);
    return res.json({ success: true, delivered: true, message: `Verification code sent to ${recipientEmail}` });
  } catch (error: unknown) {
    console.error('[EMAIL ERROR] Failed to send verification email:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown error occurred while sending email';
    return res.status(500).json({ success: false, delivered: false, message: `Failed to send email: ${errMessage}`, error: errMessage });
  }
});

// API: Send password reset code email
app.post('/api/send-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const recipientEmail = String(email).trim();
    console.log(`[PASSWORD RESET] Request to send reset code ${code} to ${recipientEmail}`);

    const { transporter, missing } = getTransporter();
    if (!transporter) {
      const errMsg = `SMTP email service is not configured on the server. Missing required environment variable(s): ${missing.join(', ')}. Please configure them in Settings.`;
      console.warn(`[EMAIL ERROR] ${errMsg}`);
      return res.status(503).json({
        success: false,
        delivered: false,
        message: errMsg,
        missingConfig: missing,
      });
    }

    const from = process.env.SMTP_FROM?.trim() || `"Nima Type" <${process.env.SMTP_USER?.trim()}>`;
    await transporter.sendMail({
      from,
      to: recipientEmail,
      subject: `Your Nima Type Password Reset Code: ${code}`,
      text: `Hello,\n\nWe received a request to reset your Nima Type password.\n\nYour 6-digit reset code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you did not request a password reset, you can safely ignore this email.\n\nBest regards,\nNima Type Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #F6F5EF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F6F5EF; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 480px; background-color: #FFFFFF; border-radius: 16px; border: 2px solid #315C45; overflow: hidden; box-shadow: 0 4px 16px rgba(49,92,69,0.08);" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="background-color: #315C45; padding: 24px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #F6F5EF; font-size: 22px; font-weight: 800; letter-spacing: 1px;">NIMA TYPE</h1>
                      <p style="margin: 4px 0 0; color: #B59B7A; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Security & Password Recovery</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 30px;">
                      <p style="margin: 0 0 12px; font-size: 15px; color: #315C45; font-weight: 600;">Hello,</p>
                      <p style="margin: 0 0 24px; font-size: 14px; color: #555555; line-height: 1.6;">
                        We received a request to reset the password associated with your Nima Type account. Please enter the following 6-digit code to complete the process:
                      </p>
                      <div style="background-color: #F6F5EF; border: 2px dashed #B59B7A; border-radius: 12px; padding: 18px; text-align: center; margin: 0 0 24px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #315C45; display: inline-block;">
                          ${code}
                        </span>
                      </div>
                      <p style="margin: 0 0 8px; font-size: 13px; color: #777777; line-height: 1.5;">
                        ⏰ <strong>This code expires in 15 minutes.</strong>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.5;">
                        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #F6F5EF; padding: 16px 30px; border-top: 1px solid #E5E2D8; text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: #888888;">
                        Nima Type • Flight Speed Typing Platform
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`[PASSWORD RESET SUCCESS] Reset email sent to ${recipientEmail}`);
    return res.json({ success: true, delivered: true, message: `Reset code sent to ${recipientEmail}` });
  } catch (error: unknown) {
    console.error('[PASSWORD RESET ERROR] Failed to send reset email:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown error occurred while sending reset email';
    return res.status(500).json({ success: false, delivered: false, message: `Failed to send reset email: ${errMessage}`, error: errMessage });
  }
});

// Vite middleware / Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    // Intercept @vite/client in dev to neutralize HMR WebSocket connect attempts in the container
    app.use((req, res, next) => {
      if (req.url && req.url.startsWith('/@vite/client')) {
        const origEnd = res.end.bind(res);
        const origWrite = res.write.bind(res);
        const chunks: Buffer[] = [];

        res.write = function (chunk: any, ...args: any[]) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        } as any;

        res.end = function (chunk: any, ...args: any[]) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          let body = Buffer.concat(chunks).toString('utf-8');

          // Cleanly stub out createWebSocketModuleRunnerTransport so no WebSockets are opened
          // and transport.send(data) / transport.connect(handlers) operate safely without throwing
          const dummyTransport = 'const createWebSocketModuleRunnerTransport = (options) => ({ async connect(handlers) { if (handlers && handlers.onMessage) { handlers.onMessage({ type: "connected" }); } }, disconnect() {}, send(data) {} });\n\nfunction createHMRHandler';
          body = body.replace(/const createWebSocketModuleRunnerTransport = \(options\) => \{[\s\S]*?\n\};\n\nfunction createHMRHandler/, dummyTransport);

          res.removeHeader('content-length');
          res.removeHeader('etag');
          res.setHeader('cache-control', 'no-store');
          res.setHeader('content-length', Buffer.byteLength(body, 'utf-8'));
          return origEnd(body, ...args);
        } as any;
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nima Type server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
