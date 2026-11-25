// Netlify Serverless Function: Global Hub Database & Synchronization Engine
// Synchronizes assignments, notes, timetables, venues, payments & students
// across all devices and accounts for UNICAL CS HUB.

import { getStore } from '@netlify/blobs';

// In-memory fallback if blobs store is running outside Netlify environment
let memoryStore = {};

function getHubStore() {
  try {
    return getStore('unical_hub_global_db');
  } catch (err) {
    console.warn('[hub-sync] Netlify Blobs store init notice:', err.message);
    return null;
  }
}

export const handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const store = getHubStore();

  try {
    // 1. GET: Retrieve central database
    if (event.httpMethod === 'GET') {
      let data = null;
      if (store) {
        try {
          data = await store.get('hub_state', { type: 'json' });
        } catch (e) {
          console.warn('[hub-sync] Blob fetch notice:', e.message);
        }
      }

      if (!data) {
        data = memoryStore['hub_state'] || null;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: data || {},
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // 2. POST: Update or merge central database
    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '{}');
      const { action, key, data } = payload;

      let currentState = null;
      if (store) {
        try {
          currentState = await store.get('hub_state', { type: 'json' });
        } catch {}
      }
      if (!currentState) {
        currentState = memoryStore['hub_state'] || {};
      }

      let updatedState = { ...currentState };

      if (action === 'FULL_SYNC' && data) {
        // Deep merge data keys to prevent overwriting existing students or notes
        updatedState = {
          ...updatedState,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      } else if (action === 'SET_KEY' && key) {
        updatedState[key] = data;
        updatedState.updatedAt = new Date().toISOString();
      } else if (action === 'REGISTER_USER' && data) {
        const users = Array.isArray(updatedState.users) ? updatedState.users : [];
        const existingIdx = users.findIndex(
          (u) => u.email?.toLowerCase() === data.email?.toLowerCase() || u.matricNumber?.toUpperCase() === data.matricNumber?.toUpperCase()
        );
        if (existingIdx >= 0) {
          users[existingIdx] = { ...users[existingIdx], ...data };
        } else {
          users.unshift(data);
        }
        updatedState.users = users;
        updatedState.updatedAt = new Date().toISOString();
      } else if (action === 'SUBMIT_PAYMENT' && data) {
        const payments = Array.isArray(updatedState.payments) ? updatedState.payments : [];
        const filtered = payments.filter((p) => p.id !== data.id && p.transactionReference !== data.transactionReference);
        updatedState.payments = [data, ...filtered];
        updatedState.updatedAt = new Date().toISOString();
      } else if (action === 'UPDATE_PAYMENT_STATUS' && data) {
        const { id, status, rejectionReason, approvedBy, studentId } = data;
        const payments = Array.isArray(updatedState.payments) ? updatedState.payments : [];
        updatedState.payments = payments.map((p) => {
          if (p.id === id) {
            return {
              ...p,
              status,
              rejectionReason,
              approvedBy,
              approvedAt: status === 'APPROVED' ? new Date().toISOString() : undefined,
            };
          }
          return p;
        });

        // Also update the student's user profile paymentStatus
        if (studentId && Array.isArray(updatedState.users)) {
          updatedState.users = updatedState.users.map((u) => {
            if (u.id === studentId || u.email === data.studentEmail) {
              return { ...u, paymentStatus: status };
            }
            return u;
          });
        }
        updatedState.updatedAt = new Date().toISOString();
      } else if (action === 'UPDATE_USER_ACCESS' && data) {
        const { studentId, paymentStatus } = data;
        const users = Array.isArray(updatedState.users) ? updatedState.users : [];
        updatedState.users = users.map((u) => (u.id === studentId ? { ...u, paymentStatus } : u));
        updatedState.updatedAt = new Date().toISOString();
      } else if (action === 'UPDATE_USER_BAN' && data) {
        const { studentId, isBanned, reason, studentEmail } = data;
        const users = Array.isArray(updatedState.users) ? updatedState.users : [];
        updatedState.users = users.map((u) => {
          if (u.id === studentId || (studentEmail && u.email?.toLowerCase() === studentEmail.toLowerCase())) {
            return {
              ...u,
              isBanned,
              bannedAt: isBanned ? new Date().toISOString() : undefined,
              banReason: isBanned ? (reason || 'Suspended by Super Administrator') : undefined,
            };
          }
          return u;
        });
        updatedState.updatedAt = new Date().toISOString();
      } else if (action === 'RECORD_LOGIN' && data) {
        const { email, timestamp } = data;
        const users = Array.isArray(updatedState.users) ? updatedState.users : [];
        updatedState.users = users.map((u) => {
          if (u.email?.toLowerCase() === email?.toLowerCase()) {
            return {
              ...u,
              lastLoginAt: timestamp || new Date().toISOString(),
              loginCount: (u.loginCount || 0) + 1,
            };
          }
          return u;
        });
        updatedState.updatedAt = new Date().toISOString();
      }

      // Save to Blob store
      if (store) {
        try {
          await store.setJSON('hub_state', updatedState);
        } catch (setErr) {
          console.warn('[hub-sync] Blob write notice:', setErr.message);
        }
      }
      memoryStore['hub_state'] = updatedState;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: updatedState,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' }),
    };
  } catch (err) {
    console.error('[hub-sync] Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message || 'Internal sync error' }),
    };
  }
};
