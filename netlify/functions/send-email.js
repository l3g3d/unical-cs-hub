// Netlify Serverless Function (ES Module): Real Email OTP Dispatcher
// UNICAL CS HUB - Department of Computer Science, University of Calabar
// Supports Resend API, Brevo API, and Direct SMTP Relay

import https from 'node:https';
import tls from 'node:tls';

// Helper to wrap emails in the official UNICAL Computer Science design
function generateEmailHtml({ title, subtitle, badgeText, code, recipientName, noteText }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 24px 12px;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #031024 0%, #0d2b5c 50%, #1d4ed8 100%);
      padding: 32px 24px 24px;
      text-align: center;
      color: #ffffff;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 12px;
      color: #93c5fd;
    }
    .univ-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #cbd5e1;
      margin: 0 0 4px 0;
    }
    .dept-title {
      font-size: 20px;
      font-weight: 900;
      color: #ffffff;
      margin: 0 0 6px 0;
      letter-spacing: 0.5px;
    }
    .hub-tag {
      font-size: 12px;
      color: #93c5fd;
      font-weight: 600;
      margin: 0;
    }
    .body {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 24px;
    }
    .otp-card {
      background: #f8fafc;
      border: 2px dashed #2563eb;
      border-radius: 12px;
      padding: 24px 16px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 40px;
      font-weight: 900;
      letter-spacing: 10px;
      color: #1d4ed8;
      margin: 4px 0;
    }
    .otp-expiry {
      font-size: 12px;
      font-weight: 700;
      color: #e11d48;
      margin-top: 8px;
    }
    .security-notice {
      background: #fff1f2;
      border-left: 4px solid #e11d48;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.5;
      color: #9f1239;
      margin: 20px 0;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 20px 24px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer strong {
      color: #0f172a;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">${badgeText}</div>
      <div class="univ-title">University of Calabar, Nigeria</div>
      <div class="dept-title">Department of Computer Science</div>
      <div class="hub-tag">UNICAL CS HUB • 100 Level Academic Student Portal</div>
    </div>
    <div class="body">
      <div class="greeting">Hello ${recipientName || 'Computer Science Student'},</div>
      <div class="message">${subtitle}</div>
      
      <div class="otp-card">
        <div class="otp-label">Your 6-Digit One-Time Verification Code</div>
        <div class="otp-code">${code}</div>
        <div class="otp-expiry">⏱️ Valid for 5 minutes only</div>
      </div>

      <div class="security-notice">
        <strong>🔒 Security Advisory:</strong> Never share this verification code with anyone. Representatives of UNICAL CS HUB will never ask for your code. If you did not make this request, please disregard this email.
      </div>

      ${noteText ? `<p style="font-size: 13px; color: #475569; line-height: 1.5;">${noteText}</p>` : ''}
    </div>
    <div class="footer">
      <strong>UNICAL CS HUB — Academic Portal</strong><br>
      Department of Computer Science, Faculty of Physical Sciences<br>
      University of Calabar, P.M.B. 1115, Calabar, Cross River State, Nigeria.<br>
      <em>Managed by 100 Level Course Representative (Divine Christopher Inyang)</em>
    </div>
  </div>
</body>
</html>`;
}

// Dispatches via Resend REST API
function sendWithResend(apiKey, fromEmail, toEmail, subject, html, text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from: fromEmail || 'UNICAL CS HUB <onboarding@resend.dev>',
      to: [toEmail],
      subject: subject,
      html: html,
      text: text,
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true, provider: 'resend', id: data.id || 'ok' });
          } else {
            reject(new Error(data.message || body));
          }
        } catch (e) {
          reject(new Error(`Resend response parse error (${res.statusCode}): ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

// Dispatches via Brevo REST API
function sendWithBrevo(apiKey, senderEmail, toEmail, subject, html, text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender: {
        name: 'UNICAL CS HUB',
        email: senderEmail || 'divineinyang636@gmail.com',
      },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: html,
      textContent: text,
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true, provider: 'brevo', messageId: data.messageId });
          } else {
            reject(new Error(data.message || body));
          }
        } catch (e) {
          reject(new Error(`Brevo response error: ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

// Dispatches via Native SMTPS (e.g. Gmail port 465 with App Password)
function sendWithSmtp({ host, port = 465, user, pass, to, subject, html, text }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(port, host, { rejectUnauthorized: false }, () => {
      let step = 0;
      let log = '';

      const send = (cmd) => {
        socket.write(cmd + '\r\n');
      };

      socket.on('data', (chunk) => {
        const msg = chunk.toString();
        log += msg;

        if (step === 0 && msg.startsWith('220')) {
          step = 1;
          send('EHLO unicalcshub');
        } else if (step === 1 && msg.startsWith('250')) {
          step = 2;
          send('AUTH LOGIN');
        } else if (step === 2 && msg.startsWith('334')) {
          step = 3;
          send(Buffer.from(user).toString('base64'));
        } else if (step === 3 && msg.startsWith('334')) {
          step = 4;
          send(Buffer.from(pass).toString('base64'));
        } else if (step === 4 && msg.startsWith('235')) {
          step = 5;
          send(`MAIL FROM:<${user}>`);
        } else if (step === 5 && msg.startsWith('250')) {
          step = 6;
          send(`RCPT TO:<${to}>`);
        } else if (step === 6 && msg.startsWith('250')) {
          step = 7;
          send('DATA');
        } else if (step === 7 && msg.startsWith('354')) {
          step = 8;
          const emailData = [
            `From: "UNICAL CS HUB" <${user}>`,
            `To: <${to}>`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            '',
            html,
            '.',
          ].join('\r\n');
          send(emailData);
        } else if (step === 8 && msg.startsWith('250')) {
          step = 9;
          send('QUIT');
          resolve({ ok: true, provider: 'smtp-gmail' });
        } else if (msg.startsWith('5')) {
          socket.end();
          reject(new Error(`SMTP Error: ${msg.trim()}`));
        }
      });

      socket.on('error', (err) => reject(err));
      socket.setTimeout(12000, () => {
        socket.destroy();
        reject(new Error('SMTP connection timed out after 12s'));
      });
    });
  });
}

export const handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { to, fullName, type, code, apiKey: clientApiKey, provider: clientProvider, smtpPass: clientSmtpPass } = data;

    if (!to || !code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Missing required recipient email (to) or OTP code (code).' }),
      };
    }

    let subject = `UNICAL CS HUB — Your Verification Code: ${code}`;
    let title = 'Verify Your Email Address';
    let subtitle = 'Thank you for registering on UNICAL CS HUB. Enter the 6-digit verification code below to verify your student email and activate your account:';
    let badgeText = 'Email Verification';

    if (type === 'PASSWORD_RESET_OTP') {
      subject = `UNICAL CS HUB — Password Recovery Code: ${code}`;
      title = 'Password Recovery Code';
      subtitle = 'We received a request to reset the password for your UNICAL CS HUB student account. Enter the 6-digit recovery code below:';
      badgeText = 'Password Reset';
    } else if (type === 'TEST_EMAIL') {
      subject = `UNICAL CS HUB — Live Email Test Code: ${code}`;
      title = 'System Diagnostic Test';
      subtitle = 'This is a live test email sent from your UNICAL CS HUB administrator dashboard to verify production email deliverability.';
      badgeText = 'Diagnostic Test';
    }

    const html = generateEmailHtml({
      title,
      subtitle,
      badgeText,
      code,
      recipientName: fullName,
      noteText: 'Please keep this email for your reference as an enrolled 100 level student of Computer Science.',
    });

    const plainText = `UNICAL CS HUB\nDepartment of Computer Science - University of Calabar\n\nHello ${fullName || 'Student'},\n\nYour 6-digit code is: ${code}\nThis code is valid for 5 minutes.\n\nNever share this code with anyone.\n\n— Divine Christopher Inyang (Course Representative)`;

    // Check for Available Providers (supports Brevo, Gmail SMTP, and Resend)
    const isBrevo = (clientApiKey && clientApiKey.startsWith('xkeysib-')) || clientProvider === 'brevo';
    const brevoKey = process.env.BREVO_API_KEY || (isBrevo ? clientApiKey : null);
    const resendKey = (!isBrevo ? clientApiKey : null) || process.env.RESEND_API_KEY;
    const smtpPass = clientSmtpPass || process.env.SMTP_PASS;
    const smtpUser = process.env.SMTP_USER || 'divineinyang636@gmail.com';
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';

    let deliveryResult = null;
    let usedProvider = 'serverless-dispatcher';

    // 1. Try Brevo REST API (Primary transactional relay - 300 free emails/day to any recipient)
    if (brevoKey) {
      try {
        const sender = process.env.EMAIL_FROM || 'divineinyang636@gmail.com';
        deliveryResult = await sendWithBrevo(brevoKey, sender, to, subject, html, plainText);
        usedProvider = 'brevo';
      } catch (brevoErr) {
        console.warn('[EmailFunction] Brevo error:', brevoErr.message);
      }
    }

    // 2. Try Direct SMTP (Gmail port 465)
    if (!deliveryResult && smtpPass) {
      try {
        deliveryResult = await sendWithSmtp({
          host: smtpHost,
          port: 465,
          user: smtpUser,
          pass: smtpPass,
          to,
          subject,
          html,
          text: plainText,
        });
        usedProvider = 'gmail-smtp';
      } catch (smtpErr) {
        console.warn('[EmailFunction] SMTP error:', smtpErr.message);
      }
    }

    // 3. Try Resend
    if (!deliveryResult && resendKey) {
      try {
        const fromEmail = process.env.EMAIL_FROM || 'UNICAL CS HUB <onboarding@resend.dev>';
        deliveryResult = await sendWithResend(resendKey, fromEmail, to, subject, html, plainText);
        usedProvider = 'resend';
      } catch (resendErr) {
        console.warn('[EmailFunction] Resend error:', resendErr.message);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        delivered: Boolean(deliveryResult?.ok),
        provider: usedProvider,
        recipient: to,
        timestamp: new Date().toISOString(),
        message: 'Verification code dispatched to student inbox.',
      }),
    };
  } catch (err) {
    console.error('[send-email] Server error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: err.message || 'Internal server error dispatching email.',
      }),
    };
  }
};
