// Netlify Serverless Function: Authoritative Central Hub Database & Sync Engine
// Enforces server-side HMAC token authentication, strict Admin vs Student RBAC,
// isolated student personal records, real binary file storage, and no-cache headers.

import {
  ADMIN_EMAIL,
  verifySessionToken,
  getScopedHubState,
  getUploadedFile,
  checkEmailOrMatricExists,
  loginUser,
  verifyAndRegisterStudent,
  resetPasswordWithServerOtp,
  changeUserPassword,
  updateServerSecrets,
  getPlatformStats,
  updateCourse,
  uploadNoteRecord,
  updateNoteRecord,
  deleteNoteRecord,
  addTimetableClassRecord,
  updateTimetableClassRecord,
  deleteTimetableClassRecord,
  updateVenueRecord,
  createAssignmentRecord,
  updateAssignmentRecord,
  deleteAssignmentRecord,
  publishAnnouncementRecord,
  deleteAnnouncementRecord,
  updateCourseRepRecord,
  submitPaymentRecord,
  updatePaymentStatusRecord,
  updateUserAccessRecord,
  updateUserBanRecord,
  updateOwnProfileRecord,
  submitAssignmentWorkRecord,
  gradeSubmissionRecord,
  submitComplaintRecord,
  replyComplaintRecord,
  updateComplaintStatusRecord,
  setFullKey,
} from './lib/hubDb.js';

const NO_CACHE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

function jsonResponse(statusCode, bodyObj) {
  return {
    statusCode,
    headers: {
      ...NO_CACHE_HEADERS,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyObj),
  };
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: NO_CACHE_HEADERS, body: '' };
  }

  try {
    const query = event.queryStringParameters || {};
    const rawAuth = event.headers?.authorization || event.headers?.Authorization || query.token || '';
    const authResult = rawAuth ? await verifySessionToken(rawAuth) : null;

    if (authResult?.banned) {
      return jsonResponse(403, {
        success: false,
        banned: true,
        error: `Account suspended (${authResult.banReason || 'Contact administrator'}).`,
      });
    }

    const callerUser = authResult?.user || null;
    const isAdmin = Boolean(callerUser && callerUser.role === 'admin' && callerUser.email?.toLowerCase() === ADMIN_EMAIL);

    // --------------------------------------------------------
    // GET: File Download OR Scoped Central State Sync
    // --------------------------------------------------------
    if (event.httpMethod === 'GET') {
      // 1. Authenticated binary file download (lecture notes / submissions)
      if (query.fileId) {
        if (!callerUser) {
          return jsonResponse(401, { success: false, error: 'Authentication required to download course files.' });
        }
        const canAccessFiles = isAdmin || callerUser.paymentStatus === 'APPROVED';
        const fileRecord = await getUploadedFile(query.fileId);
        if (!fileRecord) {
          return jsonResponse(404, { success: false, error: 'Requested document not found.' });
        }
        // Students with unpaid status can only download files they personally uploaded (assignments), never locked course notes
        const isOwnUpload = fileRecord.uploadedBy?.toLowerCase() === callerUser.email?.toLowerCase();
        if (!canAccessFiles && !isOwnUpload) {
          return jsonResponse(403, {
            success: false,
            error: 'Access denied: Complete and verify your ₦500 departmental dues to access lecture notes.',
          });
        }

        const safeName = String(fileRecord.fileName || 'document.pdf').replace(/["\r\n]/g, '');
        return {
          statusCode: 200,
          headers: {
            ...NO_CACHE_HEADERS,
            'Content-Type': fileRecord.mimeType || 'application/pdf',
            'Content-Disposition': `inline; filename="${safeName}"`,
          },
          body: fileRecord.base64,
          isBase64Encoded: true,
        };
      }

      // 2. Central Hub Sync (strictly role-scoped & personal-data-isolated)
      const sinceVersion = query.sinceVersion ? Number(query.sinceVersion) : 0;
      const scoped = await getScopedHubState(callerUser, sinceVersion);
      return jsonResponse(200, {
        success: true,
        authenticated: Boolean(callerUser),
        role: callerUser?.role || 'public',
        data: scoped,
        timestamp: new Date().toISOString(),
      });
    }

    // --------------------------------------------------------
    // POST: Auth & Domain Mutations (Strictly Role-Verified)
    // --------------------------------------------------------
    if (event.httpMethod !== 'POST') {
      return jsonResponse(405, { success: false, error: 'Method Not Allowed' });
    }

    let payload = {};
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return jsonResponse(400, { success: false, error: 'Invalid JSON request body.' });
    }

    const { action, data = {} } = payload;

    // --- PUBLIC / AUTH ENDPOINTS ---
    if (action === 'CHECK_USER_EXISTS') {
      const check = await checkEmailOrMatricExists(data);
      return jsonResponse(200, { success: true, ...check });
    }

    if (action === 'LOGIN') {
      const res = await loginUser(data);
      if (res.error) return jsonResponse(res.status || 401, { success: false, error: res.error });
      return jsonResponse(200, { success: true, user: res.user, token: res.token, meta: res.meta });
    }

    if (action === 'REGISTER_USER' || action === 'VERIFY_OTP_REGISTER') {
      const res = await verifyAndRegisterStudent(data);
      if (res.error) return jsonResponse(res.status || 400, { success: false, error: res.error });
      return jsonResponse(200, { success: true, user: res.user, token: res.token, meta: res.meta });
    }

    if (action === 'RESET_PASSWORD') {
      const res = await resetPasswordWithServerOtp(data);
      if (res.error) return jsonResponse(res.status || 400, { success: false, error: res.error });
      return jsonResponse(200, { success: true });
    }

    // --- REQUIRE AUTHENTICATED USER FROM HERE DOWN ---
    if (!callerUser) {
      return jsonResponse(401, {
        success: false,
        error: 'Session expired or missing authentication token. Please sign in again.',
      });
    }

    // --- STUDENT + ADMIN SELF-SERVICE ACTIONS ---
    if (action === 'CHANGE_PASSWORD') {
      const res = await changeUserPassword(callerUser, data);
      if (res.error) return jsonResponse(res.status || 400, { success: false, error: res.error });
      return jsonResponse(200, { success: true });
    }

    if (action === 'UPDATE_OWN_PROFILE') {
      const res = await updateOwnProfileRecord(data, callerUser);
      return jsonResponse(res.success ? 200 : 400, res);
    }

    if (action === 'SUBMIT_PAYMENT') {
      const res = await submitPaymentRecord(data, callerUser);
      return jsonResponse(res.success ? 200 : 400, res);
    }

    if (action === 'SUBMIT_ASSIGNMENT') {
      const res = await submitAssignmentWorkRecord(data, callerUser);
      return jsonResponse(res.success ? 200 : 400, res);
    }

    if (action === 'SUBMIT_COMPLAINT') {
      const res = await submitComplaintRecord(data, callerUser);
      return jsonResponse(res.success ? 200 : 400, res);
    }

    // --- STRICT ADMIN-ONLY ENDPOINTS ---
    if (!isAdmin) {
      return jsonResponse(403, {
        success: false,
        error: 'Forbidden: Departmental administrator privileges are required for this action.',
      });
    }

    let result;
    switch (action) {
      case 'GET_STATS':
        result = { success: true, stats: await getPlatformStats() };
        break;
      case 'UPDATE_COURSE':
        result = await updateCourse(data, callerUser);
        break;
      case 'UPLOAD_NOTE':
      case 'ADD_NOTE':
        result = await uploadNoteRecord(data, callerUser);
        break;
      case 'UPDATE_NOTE':
        result = await updateNoteRecord(data, callerUser);
        break;
      case 'DELETE_NOTE':
        result = await deleteNoteRecord(data.id, callerUser);
        break;
      case 'ADD_TIMETABLE':
      case 'ADD_TIMETABLE_CLASS':
        result = await addTimetableClassRecord(data, callerUser);
        break;
      case 'EDIT_TIMETABLE':
      case 'UPDATE_TIMETABLE_CLASS':
        result = await updateTimetableClassRecord(data, callerUser);
        break;
      case 'DELETE_TIMETABLE':
      case 'DELETE_TIMETABLE_CLASS':
        result = await deleteTimetableClassRecord(data.id, callerUser);
        break;
      case 'UPDATE_VENUE':
      case 'CHANGE_VENUE':
        result = await updateVenueRecord(data, callerUser);
        break;
      case 'CREATE_ASSIGNMENT':
      case 'ADD_ASSIGNMENT':
        result = await createAssignmentRecord(data, callerUser);
        break;
      case 'UPDATE_ASSIGNMENT':
        result = await updateAssignmentRecord(data, callerUser);
        break;
      case 'DELETE_ASSIGNMENT':
        result = await deleteAssignmentRecord(data.id, callerUser);
        break;
      case 'PUBLISH_ANNOUNCEMENT':
      case 'ADD_ANNOUNCEMENT':
        result = await publishAnnouncementRecord(data, callerUser);
        break;
      case 'DELETE_ANNOUNCEMENT':
        result = await deleteAnnouncementRecord(data.id, callerUser);
        break;
      case 'UPDATE_COURSE_REP':
        result = await updateCourseRepRecord(data, callerUser);
        break;
      case 'GRADE_SUBMISSION':
        result = await gradeSubmissionRecord(data, callerUser);
        break;
      case 'UPDATE_PAYMENT_STATUS':
        result = await updatePaymentStatusRecord(data, callerUser);
        break;
      case 'UPDATE_USER_ACCESS':
        result = await updateUserAccessRecord(data, callerUser);
        break;
      case 'UPDATE_USER_BAN':
        result = await updateUserBanRecord(data, callerUser);
        break;
      case 'REPLY_COMPLAINT':
        result = await replyComplaintRecord(data, callerUser);
        break;
      case 'UPDATE_COMPLAINT_STATUS':
        result = await updateComplaintStatusRecord(data, callerUser);
        break;
      case 'UPDATE_SERVER_SECRETS':
        result = await updateServerSecrets(data, callerUser);
        break;
      case 'SET_KEY': {
        const targetKey = payload.key || data.key;
        const targetVal = data.data !== undefined ? data.data : data;
        result = await setFullKey(targetKey, targetVal, callerUser);
        break;
      }
      case 'FULL_SYNC': {
        for (const [k, v] of Object.entries(data)) {
          await setFullKey(k, v, callerUser);
        }
        result = { success: true };
        break;
      }
      default:
        return jsonResponse(400, { success: false, error: `Unsupported action: "${action}"` });
    }

    return jsonResponse(result?.success ? 200 : 400, result);
  } catch (err) {
    console.error('[hub-sync] Internal error:', err);
    return jsonResponse(500, {
      success: false,
      error: err.message || 'Internal synchronization server error.',
    });
  }
};
