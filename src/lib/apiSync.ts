// UNICAL CS HUB - Central Database & Cloud Sync Service
// Keeps all registered students, assignments, notes, payments,
// and timetable synchronized across all devices and accounts.

export const ApiSync = {
  getEndpoint(): string {
    if (typeof window === 'undefined') return '/.netlify/functions/hub-sync';
    const isNetlify =
      window.location.hostname.endsWith('netlify.app') ||
      window.location.hostname === 'unicalcshub.netlify.app';
    return isNetlify
      ? '/.netlify/functions/hub-sync'
      : 'https://unicalcshub.netlify.app/.netlify/functions/hub-sync';
  },

  async fetchHubState(): Promise<any | null> {
    try {
      const res = await fetch(this.getEndpoint(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (e) {
      console.warn('[ApiSync] Remote fetch notice:', e);
      return null;
    }
  },

  async pushUpdate(action: string, data: any, key?: string): Promise<boolean> {
    try {
      const res = await fetch(this.getEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data, key }),
      });
      return res.ok;
    } catch (e) {
      console.warn('[ApiSync] Remote push notice:', e);
      return false;
    }
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
    return this.pushUpdate('FULL_SYNC', state);
  },

  async registerUserRemotely(user: any): Promise<boolean> {
    return this.pushUpdate('REGISTER_USER', user);
  },

  async submitPaymentRemotely(payment: any): Promise<boolean> {
    return this.pushUpdate('SUBMIT_PAYMENT', payment);
  },

  async updatePaymentStatusRemotely(data: {
    id: string;
    status: string;
    rejectionReason?: string;
    approvedBy?: string;
    studentId?: string;
    studentEmail?: string;
  }): Promise<boolean> {
    return this.pushUpdate('UPDATE_PAYMENT_STATUS', data);
  },

  async updateUserAccessRemotely(studentId: string, paymentStatus: 'APPROVED' | 'UNPAID' | 'PENDING' | 'REJECTED'): Promise<boolean> {
    return this.pushUpdate('UPDATE_USER_ACCESS', { studentId, paymentStatus });
  },

  async syncKeyRemotely(key: string, data: any): Promise<boolean> {
    return this.pushUpdate('SET_KEY', data, key);
  },
};
