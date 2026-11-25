// UNICAL CS HUB - Production Email Dispatch Service
// Dispatches real 6-digit OTP codes for student registration & password recovery

export interface EmailDispatchOptions {
  to: string;
  fullName: string;
  type: 'REGISTRATION_OTP' | 'PASSWORD_RESET_OTP' | 'TEST_EMAIL';
  code: string;
}

export interface EmailConfig {
  provider: 'resend' | 'brevo' | 'custom' | 'serverless';
  apiKey?: string;
  senderEmail?: string;
}

const STORAGE_KEY_CONFIG = 'unical_hub_email_config';
const STORAGE_KEY_LOGS = 'unical_hub_email_logs';

export interface EmailLogEntry {
  id: string;
  to: string;
  type: string;
  code?: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'QUEUED' | 'FAILED';
  provider: string;
  error?: string;
}

export const EmailService = {
  getConfig(): EmailConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { provider: 'brevo' };
  },

  saveConfig(config: EmailConfig) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  },

  getLogs(): EmailLogEntry[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  },

  addLog(to: string, type: string, status: 'SENT' | 'DELIVERED' | 'QUEUED' | 'FAILED', provider: string, code?: string, error?: string) {
    const logs = this.getLogs();
    const entry: EmailLogEntry = {
      id: 'log-' + Date.now(),
      to,
      type,
      code,
      timestamp: new Date().toISOString(),
      status,
      provider,
      error,
    };
    const updated = [entry, ...logs.slice(0, 49)];
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  },

  async dispatchOtpEmail(options: EmailDispatchOptions): Promise<{ success: boolean; delivered: boolean; error?: string }> {
    const config = this.getConfig();
    let apiKey = config.apiKey;
    if (!apiKey) {
      try {
        const raw = localStorage.getItem('unical_hub_central_data');
        if (raw) {
          const parsed = JSON.parse(raw);
          apiKey = parsed.emailConfig?.apiKey || parsed.brevoApiKey;
        }
      } catch {}
    }

    const payload = {
      to: options.to.trim().toLowerCase(),
      fullName: options.fullName,
      type: options.type,
      code: options.code,
      apiKey: apiKey || config.apiKey,
      provider: config.provider || 'brevo',
    };

    // Determine function endpoint: prefer local relative on Netlify, fallback to production domain
    const isNetlify = typeof window !== 'undefined' && (
      window.location.hostname.endsWith('netlify.app') ||
      window.location.hostname === 'unicalcshub.netlify.app'
    );
    const endpoint = isNetlify
      ? '/.netlify/functions/send-email'
      : 'https://unicalcshub.netlify.app/.netlify/functions/send-email';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // If we got HTML back instead of JSON, the function isn't deployed
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        console.error('[EmailService] Function not deployed — got HTML response');
        this.addLog(options.to, options.type, 'FAILED', 'function-missing', options.code, 'Netlify function not deployed');
        return { success: true, delivered: false, error: 'Email function not deployed. Contact admin.' };
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[EmailService] Function error:', res.status, errorText);
        this.addLog(options.to, options.type, 'FAILED', 'server-error', options.code, errorText);
        return { success: true, delivered: false, error: `Server error: ${res.status}` };
      }

      const data = await res.json();

      if (data.delivered) {
        this.addLog(options.to, options.type, 'DELIVERED', data.provider || 'serverless', options.code);
        return { success: true, delivered: true };
      } else {
        // Function responded but no email provider was configured
        this.addLog(options.to, options.type, 'QUEUED', data.provider || 'no-provider', options.code, 'No email provider configured');
        return { success: true, delivered: false, error: 'Email provider not configured on server.' };
      }
    } catch (err: any) {
      console.error('[EmailService] Fetch failed:', err.message);
      this.addLog(options.to, options.type, 'FAILED', 'network-error', options.code, err.message);
      return { success: true, delivered: false, error: err.message };
    }
  },
};
