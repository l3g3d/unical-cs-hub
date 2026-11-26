// UNICAL CS HUB - Central Database & Cloud Sync Service
// Keeps all registered students, assignments, notes, payments,
// and timetable synchronized across all devices and accounts.

const AUTH_TOKEN_KEY = 'unical_hub_auth_token';

export interface HubResponse<T = any> {
  success: boolean;
  data?: T;
  user?: any;
  token?: string;
  error?: string;
  banned?: boolean;
  authenticated?: boolean;
  role?: string;
  mutated?: boolean;
  message?: string;
  executedTools?: any[];
  proposedAction?: any;
}

export const ApiSync = {
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  setAuthToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token && token.trim()) {
      localStorage.setItem(AUTH_TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },

  getEndpoint(): string {
    if (typeof window === 'undefined') return '/.netlify/functions/hub-sync';
    const isNetlify =
      window.location.hostname.endsWith('netlify.app') ||
      window.location.hostname === 'unicalcshub.netlify.app';
    return isNetlify
      ? '/.netlify/functions/hub-sync'
      : 'https://unicalcshub.netlify.app/.netlify/functions/hub-sync';
  },

  getAiEndpoint(): string {
    if (typeof window === 'undefined') return '/.netlify/functions/ai-assistant';
    const isNetlify =
      window.location.hostname.endsWith('netlify.app') ||
      window.location.hostname === 'unicalcshub.netlify.app';
    return isNetlify
      ? '/.netlify/functions/ai-assistant'
      : 'https://unicalcshub.netlify.app/.netlify/functions/ai-assistant';
  },

  getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async fetchHubState(sinceVersion?: number): Promise<any | null> {
    try {
      const url = new URL(this.getEndpoint(), window.location.origin);
      if (sinceVersion && sinceVersion > 0) {
        url.searchParams.set('sinceVersion', String(sinceVersion));
      }
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401) {
          // Token expired or invalid
          console.warn('[ApiSync] Session expired or invalid.');
        }
        return null;
      }
      const json = await res.json();
      return json?.data || null;
    } catch (e) {
      console.warn('[ApiSync] Remote fetch notice:', e);
      return null;
    }
  },

  async pushUpdate(action: string, data: any, key?: string): Promise<HubResponse> {
    try {
      const res = await fetch(this.getEndpoint(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ action, data, key }),
      });
      const json = await res.json().catch(() => ({ success: res.ok }));
      return {
        success: res.ok && json?.success !== false,
        ...json,
      };
    } catch (e: any) {
      console.warn('[ApiSync] Remote push notice:', e);
      return { success: false, error: e?.message || 'Network error connecting to sync server' };
    }
  },

  // ------------------------------------------------------------
  // AUTHENTICATION & SESSIONS
  // ------------------------------------------------------------
  async login(email: string, password: string): Promise<HubResponse> {
    const res = await this.pushUpdate('LOGIN', { email, password });
    if (res.success && res.token) {
      this.setAuthToken(res.token);
    }
    return res;
  },

  async registerUser(data: {
    email: string;
    otp: string;
    password: string;
    fullName?: string;
    matricNumber?: string;
  }): Promise<HubResponse> {
    const res = await this.pushUpdate('REGISTER_USER', data);
    if (res.success && res.token) {
      this.setAuthToken(res.token);
    }
    return res;
  },

  async resetPassword(data: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<HubResponse> {
    return this.pushUpdate('RESET_PASSWORD', data);
  },

  async registerUserRemotely(user: any): Promise<boolean> {
    const res = await this.pushUpdate('REGISTER_USER', user);
    return res.success;
  },

  // ------------------------------------------------------------
  // AI ASSISTANT ENDPOINT
  // ------------------------------------------------------------
  async callAiAssistant(payload: {
    message?: string;
    history?: any[];
    attachment?: { fileName: string; mimeType: string; base64Data: string } | null;
    confirmAction?: any;
  }): Promise<HubResponse> {
    try {
      const res = await fetch(this.getAiEndpoint(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({ success: res.ok }));
      return {
        success: res.ok && json?.success !== false,
        ...json,
      };
    } catch (e: any) {
      console.warn('[ApiSync] AI Assistant call error:', e);
      return {
        success: false,
        error: e?.message || 'Failed to communicate with AI Assistant service',
      };
    }
  },

  async getAiAssistantStatus(): Promise<{ success: boolean; model?: string; reply?: string }> {
    try {
      const res = await fetch(`${this.getAiEndpoint()}?action=STATUS`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) return { success: false };
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // ------------------------------------------------------------
  // DEPARTMENTAL DOMAIN CRUD OPERATIONS
  // ------------------------------------------------------------
  async uploadNoteRemotely(data: any): Promise<HubResponse> {
    return this.pushUpdate('UPLOAD_NOTE', data);
  },

  async updateNoteRemotely(data: any): Promise<HubResponse> {
    return this.pushUpdate('UPDATE_NOTE', data);
  },

  async deleteNoteRemotely(id: string): Promise<HubResponse> {
    return this.pushUpdate('DELETE_NOTE', { id });
  },

  async addTimetableClassRemotely(data: any): Promise<HubResponse> {
    return this.pushUpdate('ADD_TIMETABLE_CLASS', data);
  },

  async editTimetableClassRemotely(id: string, updates: any): Promise<HubResponse> {
    return this.pushUpdate('UPDATE_TIMETABLE_CLASS', { id, ...updates });
  },

  async deleteTimetableClassRemotely(id: string): Promise<HubResponse> {
    return this.pushUpdate('DELETE_TIMETABLE_CLASS', { id });
  },

  async updateVenueRemotely(courseCode: string, venueName: string, notice?: string): Promise<HubResponse> {
    return this.pushUpdate('UPDATE_VENUE', { courseCode, venueName, notice });
  },

  async createAssignmentRemotely(data: any): Promise<HubResponse> {
    return this.pushUpdate('CREATE_ASSIGNMENT', data);
  },

  async updateAssignmentRemotely(id: string, updates: any): Promise<HubResponse> {
    return this.pushUpdate('UPDATE_ASSIGNMENT', { id, ...updates });
  },

  async deleteAssignmentRemotely(id: string): Promise<HubResponse> {
    return this.pushUpdate('DELETE_ASSIGNMENT', { id });
  },

  async publishAnnouncementRemotely(data: any): Promise<HubResponse> {
    return this.pushUpdate('PUBLISH_ANNOUNCEMENT', data);
  },

  async deleteAnnouncementRemotely(id: string): Promise<HubResponse> {
    return this.pushUpdate('DELETE_ANNOUNCEMENT', { id });
  },

  async updateCourseRepRemotely(data: any): Promise<HubResponse> {
    return this.pushUpdate('UPDATE_COURSE_REP', data);
  },

  async submitPaymentRemotely(payment: any): Promise<boolean> {
    const res = await this.pushUpdate('SUBMIT_PAYMENT', payment);
    return res.success;
  },

  async updatePaymentStatusRemotely(data: {
    id: string;
    status: string;
    rejectionReason?: string;
    approvedBy?: string;
    studentId?: string;
    studentEmail?: string;
  }): Promise<boolean> {
    const res = await this.pushUpdate('UPDATE_PAYMENT_STATUS', data);
    return res.success;
  },

  async updateUserAccessRemotely(
    studentId: string,
    paymentStatus: 'APPROVED' | 'UNPAID' | 'PENDING' | 'REJECTED'
  ): Promise<boolean> {
    const res = await this.pushUpdate('UPDATE_USER_ACCESS', { studentId, paymentStatus });
    return res.success;
  },

  async updateUserBanStatus(
    studentId: string,
    isBanned: boolean,
    reason?: string,
    studentEmail?: string
  ): Promise<boolean> {
    const res = await this.pushUpdate('UPDATE_USER_BAN', { studentId, isBanned, reason, studentEmail });
    return res.success;
  },

  async recordUserLogin(email: string): Promise<boolean> {
    return true;
  },

  async syncKeyRemotely(key: string, data: any): Promise<boolean> {
    const res = await this.pushUpdate('SET_KEY', data, key);
    return res.success;
  },

  async syncFullState(state: {
    notes?: any[];
    timetable?: any[];
    venues?: any[];
    assignments?: any[];
    submissions?: any[];
    payments?: any[];
    complaints?: any[];
    announcements?: any[];
    courseRep?: any;
    users?: any[];
  }): Promise<boolean> {
    const res = await this.pushUpdate('FULL_SYNC', state);
    return res.success;
  },
};
