// Central Database, Authentication, RBAC & File Store Engine for UNICAL CS HUB
// Works seamlessly across Netlify Blobs (production), local file store (testing/dev),
// and optional Supabase PostgreSQL synchronization when service credentials are provided.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getStore } from '@netlify/blobs';

export const ADMIN_EMAIL = 'divineinyang636@gmail.com';
const STORE_NAME = 'unical_hub_global_db';
const FILE_STORE_NAME = 'unical_hub_files';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const OTP_TTL_MS = 1000 * 60 * 10; // 10 minutes

// Process-level memory fallback (when neither Blobs nor disk dir is available)
const memoryStores = new Map();

function getMemoryStore(name) {
  if (!memoryStores.has(name)) memoryStores.set(name, new Map());
  const map = memoryStores.get(name);
  return {
    async get(key, opts = {}) {
      const val = map.get(key);
      if (val === undefined) return null;
      if (opts.type === 'json') return typeof val === 'string' ? JSON.parse(val) : val;
      return val;
    },
    async setJSON(key, value) {
      map.set(key, JSON.parse(JSON.stringify(value)));
    },
    async delete(key) {
      map.delete(key);
    },
  };
}

function getDiskStore(dir, name) {
  const storeDir = path.join(dir, name);
  fs.mkdirSync(storeDir, { recursive: true });
  const keyToPath = (key) => path.join(storeDir, encodeURIComponent(key) + '.json');
  return {
    async get(key, opts = {}) {
      const p = keyToPath(key);
      if (!fs.existsSync(p)) return null;
      const raw = fs.readFileSync(p, 'utf8');
      return opts.type === 'json' ? JSON.parse(raw) : raw;
    },
    async setJSON(key, value) {
      fs.writeFileSync(keyToPath(key), JSON.stringify(value, null, 2), 'utf8');
    },
    async delete(key) {
      const p = keyToPath(key);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    },
  };
}

function openBlobStore(name) {
  const localDir = process.env.HUB_LOCAL_STORE_DIR;
  if (localDir) {
    return getDiskStore(localDir, name);
  }
  try {
    return getStore(name);
  } catch (err) {
    console.warn(`[hubDb] Blobs store "${name}" fallback notice:`, err.message);
    return getMemoryStore(name);
  }
}

async function readKey(store, key, fallback = null) {
  try {
    const val = await store.get(key, { type: 'json' });
    return val === null || val === undefined ? fallback : val;
  } catch {
    return fallback;
  }
}

async function writeKey(store, key, value) {
  await store.setJSON(key, value);
}

// ============================================================
// DEFAULT DEPARTMENTAL SEED DATA (Initialized ONLY if absent)
// ============================================================
export const INITIAL_COURSES = [
  {
    code: 'COS101',
    title: 'Introduction to Computer Sciences',
    creditUnits: 3,
    lecturer: 'Dr. A. E. Effiong',
    description: 'Foundations of computing, binary arithmetic, computer architecture, algorithms, and computing history.',
  },
  {
    code: 'CSC181',
    title: 'Computer Laboratory IA',
    creditUnits: 2,
    lecturer: 'Mr. B. O. Okon',
    description: 'Practical hands-on computing laboratory, operating system utilities, basic CLI, and typing proficiencies.',
  },
  {
    code: 'GST111',
    title: 'Communication in English',
    creditUnits: 2,
    lecturer: 'Prof. M. U. Bassey',
    description: 'Grammar, sentence structures, essay writing, comprehension, and academic communication skills.',
  },
  {
    code: 'MTH101',
    title: 'Elementary Mathematics 1',
    creditUnits: 3,
    lecturer: 'Dr. P. N. Asuquo',
    description: 'Sets, relations, real number system, algebraic expressions, trigonometry, and analytical geometry.',
  },
  {
    code: 'PHY101',
    title: 'Introduction to Physics I',
    creditUnits: 3,
    lecturer: 'Dr. E. O. Akpan',
    description: 'Mechanics, properties of matter, thermal physics, waves, and fundamental harmonic oscillations.',
  },
  {
    code: 'PHY107',
    title: 'General Physics Practical I',
    creditUnits: 1,
    lecturer: 'Engr. K. I. Edet',
    description: 'Laboratory experiments in mechanics, heat, optics, and experimental uncertainty measurements.',
  },
  {
    code: 'STA111',
    title: 'Basic Statistics',
    creditUnits: 2,
    lecturer: 'Dr. Mrs. H. O. Archibong',
    description: 'Frequency distributions, measures of central tendency, dispersion, probability, and hypothesis testing.',
  },
];

export const INITIAL_COURSE_REP = {
  id: 'rep-01',
  fullName: 'Divine Christopher Inyang',
  position: '100 Level Course Representative',
  department: 'Computer Science Department, UNICAL',
  level: '100 Level',
  phone: '08139651907',
  email: ADMIN_EMAIL,
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  updatedAt: '2026-11-15T08:00:00Z',
};

export const INITIAL_ADMIN_USER = {
  id: 'user-admin-divine',
  email: ADMIN_EMAIL,
  fullName: 'Divine Christopher Inyang',
  matricNumber: '23/095144000',
  role: 'admin',
  isEmailVerified: true,
  paymentStatus: 'APPROVED',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  createdAt: '2026-11-01T08:00:00Z',
};

export const INITIAL_NOTES = [
  {
    id: 'note-cos-01',
    courseCode: 'COS101',
    lectureNumber: 1,
    topic: 'History of Computing & Generational Paradigms',
    description: 'Overview of mechanical computers, ENIAC, vacuum tubes, transistors, microprocessors, and fifth-generation AI systems.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'COS101_Lecture1_History_of_Computing.pdf',
    fileSize: '1.4 MB',
    uploadDate: '2026-11-10T10:00:00Z',
    uploadedBy: 'Course Rep Divine',
  },
  {
    id: 'note-cos-02',
    courseCode: 'COS101',
    lectureNumber: 2,
    topic: 'Binary Representation & Logic Circuits',
    description: "Number bases conversion (Binary, Octal, Hexadecimal), two's complement, logic gates (AND, OR, NOT, NAND, NOR, XOR).",
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'COS101_Lecture2_Binary_Arithmetic.pdf',
    fileSize: '2.1 MB',
    uploadDate: '2026-11-15T14:30:00Z',
    uploadedBy: 'Course Rep Divine',
  },
  {
    id: 'note-csc-01',
    courseCode: 'CSC181',
    lectureNumber: 1,
    topic: 'Command Line Interfaces & File Systems Navigation',
    description: 'Unix and Windows shell commands, directory traversal, file permissions, and environment variables.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'CSC181_Lab_Manual_Week1.pdf',
    fileSize: '950 KB',
    uploadDate: '2026-11-12T09:00:00Z',
    uploadedBy: 'Course Rep Divine',
  },
  {
    id: 'note-mth-01',
    courseCode: 'MTH101',
    lectureNumber: 1,
    topic: 'Set Theory & Mathematical Induction',
    description: "Venn diagrams, set operations, De Morgan's laws, and principle of mathematical induction with solved examples.",
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'MTH101_Set_Theory_Module1.pdf',
    fileSize: '3.2 MB',
    uploadDate: '2026-11-08T11:00:00Z',
    uploadedBy: 'Course Rep Divine',
  },
  {
    id: 'note-phy-01',
    courseCode: 'PHY101',
    lectureNumber: 1,
    topic: 'Dimensional Analysis & Vector Mechanics',
    description: 'SI units, dimensional formulas, scalar vs vector quantities, vector resolution, and dot/cross products.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'PHY101_Mechanics_Lectures_1_to_3.pdf',
    fileSize: '2.8 MB',
    uploadDate: '2026-11-14T08:00:00Z',
    uploadedBy: 'Course Rep Divine',
  },
  {
    id: 'note-sta-01',
    courseCode: 'STA111',
    lectureNumber: 1,
    topic: 'Measures of Central Tendency & Dispersion',
    description: 'Mean, median, mode, variance, standard deviation, quartiles, and grouped data calculations.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'STA111_Measures_of_Dispersion.pdf',
    fileSize: '1.8 MB',
    uploadDate: '2026-11-16T12:00:00Z',
    uploadedBy: 'Course Rep Divine',
  },
  {
    id: 'note-gst-01',
    courseCode: 'GST111',
    lectureNumber: 1,
    topic: 'Academic Writing & Concord in English',
    description: 'Rules of concord, subject-verb agreement, common grammatical errors, and essay paragraph structuring.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'GST111_English_Communication_Guide.pdf',
    fileSize: '1.1 MB',
    uploadDate: '2026-11-05T10:00:00Z',
    uploadedBy: 'Course Rep Divine',
  },
];

export const INITIAL_TIMETABLE = [
  {
    id: 'tt-1',
    dayOfWeek: 'Monday',
    startTime: '08:00',
    endTime: '10:00',
    courseCode: 'COS101',
    courseTitle: 'Introduction to Computer Sciences',
    lecturer: 'Dr. A. E. Effiong',
    venue: 'Science Lecture Theatre (SLT)',
    semester: 'First Semester',
    academicYear: '2026/2027',
  },
  {
    id: 'tt-2',
    dayOfWeek: 'Monday',
    startTime: '10:00',
    endTime: '12:00',
    courseCode: 'MTH101',
    courseTitle: 'Elementary Mathematics 1',
    lecturer: 'Dr. P. N. Asuquo',
    venue: 'New Science Complex Hall 1',
    semester: 'First Semester',
    academicYear: '2026/2027',
  },
  {
    id: 'tt-3',
    dayOfWeek: 'Tuesday',
    startTime: '09:00',
    endTime: '11:00',
    courseCode: 'PHY101',
    courseTitle: 'Introduction to Physics I',
    lecturer: 'Dr. E. O. Akpan',
    venue: 'Physics Lecture Theatre',
    semester: 'First Semester',
    academicYear: '2026/2027',
  },
  {
    id: 'tt-4',
    dayOfWeek: 'Tuesday',
    startTime: '12:00',
    endTime: '14:00',
    courseCode: 'GST111',
    courseTitle: 'Communication in English',
    lecturer: 'Prof. M. U. Bassey',
    venue: 'CES Hall A',
    semester: 'First Semester',
    academicYear: '2026/2027',
  },
  {
    id: 'tt-5',
    dayOfWeek: 'Wednesday',
    startTime: '10:00',
    endTime: '12:00',
    courseCode: 'CSC181',
    courseTitle: 'Computer Laboratory IA',
    lecturer: 'Mr. B. O. Okon',
    venue: 'Departmental Hardware Lab',
    semester: 'First Semester',
    academicYear: '2026/2027',
  },
  {
    id: 'tt-6',
    dayOfWeek: 'Thursday',
    startTime: '08:00',
    endTime: '10:00',
    courseCode: 'STA111',
    courseTitle: 'Basic Statistics',
    lecturer: 'Dr. Mrs. H. O. Archibong',
    venue: 'Maths & Stats Hall 2',
    semester: 'First Semester',
    academicYear: '2026/2027',
  },
  {
    id: 'tt-7',
    dayOfWeek: 'Thursday',
    startTime: '13:00',
    endTime: '16:00',
    courseCode: 'PHY107',
    courseTitle: 'General Physics Practical I',
    lecturer: 'Engr. K. I. Edet',
    venue: 'Physics Laboratory 2',
    semester: 'First Semester',
    academicYear: '2026/2027',
  },
];

export const INITIAL_VENUES = [
  {
    id: 'v-1',
    courseCode: 'COS101',
    courseName: 'Introduction to Computer Sciences',
    venueName: 'Science Lecture Theatre (SLT)',
    capacity: 250,
    dayTime: 'Mondays 8:00 AM - 10:00 AM',
    isChanged: false,
  },
  {
    id: 'v-2',
    courseCode: 'CSC181',
    courseName: 'Computer Laboratory IA',
    venueName: 'Departmental Hardware Lab',
    capacity: 90,
    dayTime: 'Wednesdays 10:00 AM - 12:00 PM',
    isChanged: false,
  },
  {
    id: 'v-3',
    courseCode: 'GST111',
    courseName: 'Communication in English',
    venueName: 'CES Hall A',
    capacity: 400,
    dayTime: 'Tuesdays 12:00 PM - 2:00 PM',
    isChanged: false,
  },
  {
    id: 'v-4',
    courseCode: 'MTH101',
    courseName: 'Elementary Mathematics 1',
    venueName: 'New Science Complex Hall 1',
    capacity: 280,
    dayTime: 'Mondays 10:00 AM - 12:00 PM',
    isChanged: false,
  },
  {
    id: 'v-5',
    courseCode: 'PHY101',
    courseName: 'Introduction to Physics I',
    venueName: 'Physics Lecture Theatre',
    capacity: 220,
    dayTime: 'Tuesdays 9:00 AM - 11:00 AM',
    isChanged: false,
  },
  {
    id: 'v-6',
    courseCode: 'PHY107',
    courseName: 'General Physics Practical I',
    venueName: 'Physics Laboratory 2',
    capacity: 65,
    dayTime: 'Thursdays 1:00 PM - 4:00 PM',
    isChanged: false,
  },
  {
    id: 'v-7',
    courseCode: 'STA111',
    courseName: 'Basic Statistics',
    venueName: 'Maths & Stats Hall 2',
    capacity: 180,
    dayTime: 'Thursdays 8:00 AM - 10:00 AM',
    isChanged: false,
  },
];

export const INITIAL_ASSIGNMENTS = [
  {
    id: 'assign-1',
    courseCode: 'COS101',
    title: 'Assignment 1: Number Systems Conversion & Logic Circuit Simulation',
    instructions: '1. Convert (11010110.101)_2 to decimal, octal, and hexadecimal.\n2. Design a circuit that implements a 2-bit full adder using only NAND gates.\n3. Type your solution or clearly write and scan to PDF.',
    dueDate: '2026-11-28T23:59:00Z',
    maxScore: 20,
    createdBy: 'Dr. A. E. Effiong',
    createdAt: '2026-11-18T10:00:00Z',
  },
  {
    id: 'assign-2',
    courseCode: 'STA111',
    title: 'Assignment 1: Calculation of Mean, Variance & Standard Deviation',
    instructions: 'Given the frequency table of test scores uploaded in lecture note 1, calculate the Mean, Variance, Standard Deviation, and semi-interquartile range. Show all step-by-step working.',
    dueDate: '2026-11-30T17:00:00Z',
    maxScore: 15,
    createdBy: 'Dr. Mrs. H. O. Archibong',
    createdAt: '2026-11-19T14:00:00Z',
  },
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Welcome to Department of Computer Science (100 Level)',
    content: 'All fresh 100 level students are warmly welcomed to the 2026/2027 Academic Session. Please ensure you make your ₦500 departmental access payment via OPay and submit your transaction reference to unlock all course lecture notes and materials.',
    priority: 'URGENT',
    targetLevel: '100',
    authorName: 'Divine Christopher Inyang (Course Rep)',
    createdAt: '2026-11-15T08:00:00Z',
  },
  {
    id: 'ann-2',
    title: 'CSC181 Practical Lab Guidelines & Software Setup',
    content: 'Please come to the Departmental Hardware Lab with your student ID card this Wednesday. Check the CSC181 syllabus inside the course notes tab.',
    priority: 'NORMAL',
    targetLevel: '100',
    authorName: 'Course Rep Desk',
    createdAt: '2026-11-18T12:00:00Z',
  },
];

// ============================================================
// MIGRATION & COLLECTION INITIALIZATION
// ============================================================
function sanitizeUsersList(list) {
  if (!Array.isArray(list)) return [INITIAL_ADMIN_USER];
  const filtered = list.filter((u) => {
    if (!u || !u.email) return false;
    const em = u.email.trim().toLowerCase();
    return (
      em !== 'emeka@example.com' &&
      em !== 'blessing@example.com' &&
      u.id !== 'student-emeka' &&
      u.id !== 'student-blessing'
    );
  });
  const map = new Map();
  for (const u of filtered) {
    const em = u.email.trim().toLowerCase();
    const role = em === ADMIN_EMAIL ? 'admin' : 'student';
    map.set(em, { ...u, email: em, role });
  }
  if (!map.has(ADMIN_EMAIL)) {
    map.set(ADMIN_EMAIL, INITIAL_ADMIN_USER);
  }
  return Array.from(map.values());
}

export async function ensureInitialized() {
  const store = openBlobStore(STORE_NAME);
  let meta = await readKey(store, 'meta', null);
  if (meta && meta.initialized) {
    return store;
  }

  // Check if legacy monolithic 'hub_state' exists and migrate without data loss
  const legacy = await readKey(store, 'hub_state', null);

  const courses = (legacy && Array.isArray(legacy.courses) && legacy.courses.length > 0)
    ? legacy.courses
    : INITIAL_COURSES;
  const courseRep = (legacy && legacy.courseRep && legacy.courseRep.fullName)
    ? legacy.courseRep
    : INITIAL_COURSE_REP;
  const notes = (legacy && Array.isArray(legacy.notes))
    ? legacy.notes
    : INITIAL_NOTES;
  const timetable = (legacy && Array.isArray(legacy.timetable))
    ? legacy.timetable
    : INITIAL_TIMETABLE;
  const venues = (legacy && Array.isArray(legacy.venues))
    ? legacy.venues
    : INITIAL_VENUES;
  const assignments = (legacy && Array.isArray(legacy.assignments))
    ? legacy.assignments
    : INITIAL_ASSIGNMENTS;
  const announcements = (legacy && Array.isArray(legacy.announcements))
    ? legacy.announcements
    : INITIAL_ANNOUNCEMENTS;
  const users = sanitizeUsersList(legacy?.users);
  const payments = Array.isArray(legacy?.payments) ? legacy.payments : [];
  const submissions = Array.isArray(legacy?.submissions) ? legacy.submissions : [];
  const complaints = Array.isArray(legacy?.complaints) ? legacy.complaints : [];
  const auditLogs = Array.isArray(legacy?.auditLogs) ? legacy.auditLogs : [
    {
      id: 'log-1',
      adminName: 'Divine Christopher Inyang',
      action: 'PORTAL_CENTRAL_INIT',
      details: 'Initialized UNICAL CS HUB centralized database store.',
      timestamp: new Date().toISOString(),
    },
  ];

  // Move any legacy brevoApiKey / emailConfig into private_secrets
  const existingSecrets = await readKey(store, 'private_secrets', {});
  const signingSecret = existingSecrets.signingSecret || crypto.randomBytes(32).toString('hex');
  const brevoApiKey = existingSecrets.brevoApiKey || legacy?.emailConfig?.apiKey || legacy?.brevoApiKey || '';
  const geminiApiKey = existingSecrets.geminiApiKey || '';

  await writeKey(store, 'private_secrets', { signingSecret, brevoApiKey, geminiApiKey });
  await writeKey(store, 'courses', courses);
  await writeKey(store, 'courseRep', courseRep);
  await writeKey(store, 'notes', notes);
  await writeKey(store, 'timetable', timetable);
  await writeKey(store, 'venues', venues);
  await writeKey(store, 'assignments', assignments);
  await writeKey(store, 'announcements', announcements);
  await writeKey(store, 'users', users);
  await writeKey(store, 'payments', payments);
  await writeKey(store, 'submissions', submissions);
  await writeKey(store, 'complaints', complaints);
  await writeKey(store, 'auditLogs', auditLogs);

  meta = {
    initialized: true,
    version: Date.now(),
    updatedAt: new Date().toISOString(),
    migratedFromLegacy: Boolean(legacy),
  };
  await writeKey(store, 'meta', meta);
  return store;
}

async function bumpVersion(store) {
  const cur = await readKey(store, 'meta', { initialized: true, version: 1 });
  const next = {
    initialized: true,
    version: Math.max((cur?.version || 0) + 1, Date.now()),
    updatedAt: new Date().toISOString(),
  };
  await writeKey(store, 'meta', next);
  return next;
}

async function appendAuditLog(store, adminName, action, details) {
  const logs = await readKey(store, 'auditLogs', []);
  const entry = {
    id: 'log-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex'),
    adminName: adminName || 'Divine Christopher Inyang',
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  await writeKey(store, 'auditLogs', [entry, ...logs.slice(0, 199)]);
  return entry;
}

// ============================================================
// CRYPTOGRAPHY: PASSWORD HASHING & HMAC SESSION TOKENS
// ============================================================
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash, updatedAt: new Date().toISOString() };
}

export function verifyPasswordHash(password, entry) {
  if (!entry || !entry.salt || !entry.hash) return false;
  const candidate = crypto.scryptSync(String(password), entry.salt, 64);
  const stored = Buffer.from(entry.hash, 'hex');
  if (candidate.length !== stored.length) return false;
  return crypto.timingSafeEqual(candidate, stored);
}

async function getSigningSecret(store) {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  const secrets = await readKey(store, 'private_secrets', {});
  if (secrets?.signingSecret) return secrets.signingSecret;
  const fresh = crypto.randomBytes(32).toString('hex');
  await writeKey(store, 'private_secrets', { ...secrets, signingSecret: fresh });
  return fresh;
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export async function signSessionToken(user) {
  const store = await ensureInitialized();
  const secret = await getSigningSecret(store);
  const now = Date.now();
  const payload = {
    sub: user.id,
    email: user.email.trim().toLowerCase(),
    role: user.email.trim().toLowerCase() === ADMIN_EMAIL ? 'admin' : 'student',
    iat: now,
    exp: now + TOKEN_TTL_MS,
  };
  const headerB64 = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'HUB' }));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  return `${data}.${base64UrlEncode(sig)}`;
}

export async function verifySessionToken(rawHeaderOrToken) {
  if (!rawHeaderOrToken || typeof rawHeaderOrToken !== 'string') return null;
  const token = rawHeaderOrToken.startsWith('Bearer ')
    ? rawHeaderOrToken.slice(7).trim()
    : rawHeaderOrToken.trim();
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const store = await ensureInitialized();
  const secret = await getSigningSecret(store);
  const [headerB64, payloadB64, sigB64] = parts;
  const expectedSig = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(`${headerB64}.${payloadB64}`).digest()
  );

  const bufA = Buffer.from(sigB64);
  const bufB = Buffer.from(expectedSig);
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    return null;
  }

  if (!payload?.email || !payload?.exp || Date.now() > payload.exp) {
    return null;
  }

  const users = await readKey(store, 'users', []);
  const normEmail = payload.email.trim().toLowerCase();
  const user = users.find((u) => u.email?.trim().toLowerCase() === normEmail);
  if (!user) return null;

  const isAdmin = normEmail === ADMIN_EMAIL;
  if (user.isBanned && !isAdmin) {
    return { banned: true, banReason: user.banReason || 'Account suspended', user: null };
  }

  return {
    banned: false,
    user: {
      ...user,
      role: isAdmin ? 'admin' : 'student',
    },
  };
}

// ============================================================
// SECRETS MANAGEMENT (PRIVATE BLOB ONLY)
// ============================================================
export async function getServerSecrets() {
  const store = await ensureInitialized();
  const secrets = await readKey(store, 'private_secrets', {});
  return {
    brevoApiKey: process.env.BREVO_API_KEY || secrets?.brevoApiKey || '',
    geminiApiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || secrets?.geminiApiKey || '',
    geminiSource: process.env.GEMINI_API_KEY
      ? 'env:GEMINI_API_KEY'
      : process.env.VITE_GEMINI_API_KEY
      ? 'env:VITE_GEMINI_API_KEY'
      : secrets?.geminiApiKey
      ? 'server_blob'
      : 'none',
    brevoSource: process.env.BREVO_API_KEY
      ? 'env:BREVO_API_KEY'
      : secrets?.brevoApiKey
      ? 'server_blob'
      : 'none',
  };
}

export async function updateServerSecrets(partialSecrets, adminUser) {
  const store = await ensureInitialized();
  const current = await readKey(store, 'private_secrets', {});
  const next = { ...current };
  if (typeof partialSecrets.brevoApiKey === 'string') {
    next.brevoApiKey = partialSecrets.brevoApiKey.trim();
  }
  if (typeof partialSecrets.geminiApiKey === 'string') {
    next.geminiApiKey = partialSecrets.geminiApiKey.trim();
  }
  await writeKey(store, 'private_secrets', next);
  await appendAuditLog(store, adminUser?.fullName, 'UPDATE_SERVER_SECRETS', 'Updated server-side API credentials securely.');
  await bumpVersion(store);
  return { success: true };
}

// ============================================================
// AUTHENTICATION HANDLERS (LOGIN / OTP / REGISTER / PASSWORD)
// ============================================================
export async function storeServerOtp({ email, code, type, meta }) {
  const store = await ensureInitialized();
  const normEmail = email.trim().toLowerCase();
  const otps = await readKey(store, 'private_otps', {});
  const key = type === 'PASSWORD_RESET_OTP' ? `reset_${normEmail}` : normEmail;
  otps[key] = {
    code: String(code).trim(),
    expiresAt: Date.now() + OTP_TTL_MS,
    meta: meta || {},
  };
  await writeKey(store, 'private_otps', otps);
  return { success: true };
}

export async function verifyAndRegisterStudent({ email, otp, password, fullName, matricNumber }) {
  const store = await ensureInitialized();
  const normEmail = String(email || '').trim().toLowerCase();
  if (!normEmail || !password || String(password).length < 6) {
    return { status: 400, error: 'Valid email and password (min 6 chars) are required.' };
  }

  const users = await readKey(store, 'users', []);
  const normMatric = String(matricNumber || '').trim().toUpperCase();
  const otps = await readKey(store, 'private_otps', {});
  const otpRecord = otps[normEmail];

  if (otpRecord) {
    if (Date.now() > otpRecord.expiresAt) {
      return { status: 400, error: 'The 6-digit verification code has expired. Please request a new one.' };
    }
    if (otpRecord.code !== String(otp || '').trim()) {
      return { status: 400, error: 'Invalid verification code. Please check your email and try again.' };
    }
  } else if (!otp) {
    return { status: 400, error: 'No active verification code found. Please request a new OTP.' };
  }

  const resolvedFullName = (fullName || otpRecord?.meta?.fullName || 'Student').trim();
  const resolvedMatric = (normMatric || otpRecord?.meta?.matricNumber || '').trim().toUpperCase();

  const duplicate = users.find(
    (u) =>
      u.email?.trim().toLowerCase() === normEmail ||
      (resolvedMatric && u.matricNumber?.trim().toUpperCase() === resolvedMatric)
  );
  if (duplicate) {
    return { status: 409, error: 'An account with this email or matriculation number already exists. Please log in.' };
  }

  if (normEmail === ADMIN_EMAIL) {
    return { status: 403, error: 'Cannot register the reserved administrator account.' };
  }

  const newUser = {
    id: 'student-' + Date.now(),
    email: normEmail,
    fullName: resolvedFullName,
    matricNumber: resolvedMatric || '23/095144' + Math.floor(100 + Math.random() * 900),
    role: 'student',
    isEmailVerified: true,
    paymentStatus: 'UNPAID',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    loginCount: 1,
  };

  const authMap = await readKey(store, 'private_auth', {});
  authMap[normEmail] = hashPassword(password);
  await writeKey(store, 'private_auth', authMap);

  const nextUsers = [newUser, ...users];
  await writeKey(store, 'users', nextUsers);

  if (otpRecord) {
    delete otps[normEmail];
    await writeKey(store, 'private_otps', otps);
  }

  const meta = await bumpVersion(store);
  const token = await signSessionToken(newUser);
  return { status: 200, user: newUser, token, meta };
}

export async function loginUser({ email, password }) {
  const store = await ensureInitialized();
  const normEmail = String(email || '').trim().toLowerCase();
  const passStr = String(password || '');

  if (!normEmail || !passStr) {
    return { status: 400, error: 'Email and password are required.' };
  }

  let users = await readKey(store, 'users', []);
  const isAdminEmail = normEmail === ADMIN_EMAIL;
  let target = users.find((u) => u.email?.trim().toLowerCase() === normEmail);

  if (!target && isAdminEmail) {
    target = { ...INITIAL_ADMIN_USER };
    users = [target, ...users];
  }

  if (!target) {
    return { status: 404, error: 'No student account found with this email. Please register first.' };
  }

  if (target.isBanned && !isAdminEmail) {
    return {
      status: 403,
      error: `Your student account has been suspended by the Course Representative${
        target.banReason ? ` (${target.banReason})` : ''
      }. Please contact administrator ${ADMIN_EMAIL}.`,
    };
  }

  const authMap = await readKey(store, 'private_auth', {});
  const authEntry = authMap[normEmail];

  if (isAdminEmail) {
    const envAdminPass = process.env.ADMIN_PASSWORD;
    if (envAdminPass) {
      if (passStr !== envAdminPass) {
        return { status: 401, error: 'Incorrect administrator password.' };
      }
    } else if (authEntry) {
      if (!verifyPasswordHash(passStr, authEntry)) {
        return { status: 401, error: 'Incorrect administrator password.' };
      }
    } else {
      // Legacy bootstrap before admin sets custom server password: accept documented default 'admin123'
      if (passStr !== 'admin123') {
        return {
          status: 401,
          error: 'Incorrect administrator password. Use your password or reset via "Forgot password?" OTP.',
        };
      }
    }
  } else {
    if (authEntry) {
      if (!verifyPasswordHash(passStr, authEntry)) {
        return { status: 401, error: 'Incorrect password. Please try again.' };
      }
    } else {
      // Legacy student migrated from local-only storage before server auth: bind password on first verified login
      if (passStr.length < 4) {
        return { status: 401, error: 'Incorrect password. Please try again.' };
      }
      authMap[normEmail] = hashPassword(passStr);
      await writeKey(store, 'private_auth', authMap);
    }
  }

  const updatedUser = {
    ...target,
    role: isAdminEmail ? 'admin' : 'student',
    lastLoginAt: new Date().toISOString(),
    loginCount: (target.loginCount || 0) + 1,
  };

  users = users.map((u) => (u.email?.trim().toLowerCase() === normEmail ? updatedUser : u));
  await writeKey(store, 'users', users);
  const meta = await bumpVersion(store);
  const token = await signSessionToken(updatedUser);

  return { status: 200, user: updatedUser, token, meta };
}

export async function resetPasswordWithServerOtp({ email, otp, newPassword }) {
  const store = await ensureInitialized();
  const normEmail = String(email || '').trim().toLowerCase();
  if (!normEmail || !newPassword || String(newPassword).length < 6) {
    return { status: 400, error: 'Password must be at least 6 characters.' };
  }

  const users = await readKey(store, 'users', []);
  const target = users.find((u) => u.email?.trim().toLowerCase() === normEmail);
  if (!target) {
    return { status: 404, error: 'No account found with this email address.' };
  }

  const otps = await readKey(store, 'private_otps', {});
  const rec = otps[`reset_${normEmail}`];
  if (!rec) {
    return { status: 400, error: 'No password recovery session found. Please request a new code.' };
  }
  if (Date.now() > rec.expiresAt) {
    return { status: 400, error: 'The 6-digit recovery code has expired. Please request a new one.' };
  }
  if (rec.code !== String(otp || '').trim()) {
    return { status: 400, error: 'Incorrect recovery code. Please check your email and try again.' };
  }

  const authMap = await readKey(store, 'private_auth', {});
  authMap[normEmail] = hashPassword(newPassword);
  await writeKey(store, 'private_auth', authMap);

  delete otps[`reset_${normEmail}`];
  await writeKey(store, 'private_otps', otps);

  return { status: 200, success: true };
}

export async function changeUserPassword(callerUser, { currentPassword, newPassword }) {
  const store = await ensureInitialized();
  const normEmail = callerUser.email.trim().toLowerCase();
  if (!newPassword || String(newPassword).length < 6) {
    return { status: 400, error: 'New password must be at least 6 characters.' };
  }

  const authMap = await readKey(store, 'private_auth', {});
  const authEntry = authMap[normEmail];
  if (authEntry) {
    if (!verifyPasswordHash(currentPassword, authEntry)) {
      return { status: 401, error: 'Current password is incorrect.' };
    }
  } else if (normEmail === ADMIN_EMAIL) {
    const defaultAdminPass = process.env.ADMIN_PASSWORD || 'admin123';
    if (currentPassword !== defaultAdminPass) {
      return { status: 401, error: 'Current administrator password is incorrect.' };
    }
  }

  authMap[normEmail] = hashPassword(newPassword);
  await writeKey(store, 'private_auth', authMap);
  return { status: 200, success: true };
}

export async function checkEmailOrMatricExists({ email, matricNumber }) {
  const store = await ensureInitialized();
  const users = await readKey(store, 'users', []);
  const normEmail = String(email || '').trim().toLowerCase();
  const normMatric = String(matricNumber || '').trim().toUpperCase();

  const emailMatch = normEmail ? users.some((u) => u.email?.trim().toLowerCase() === normEmail) : false;
  const matricMatch = normMatric ? users.some((u) => u.matricNumber?.trim().toUpperCase() === normMatric) : false;
  return { exists: emailMatch || matricMatch, emailMatch, matricMatch };
}

// ============================================================
// ROLE-SCOPED READS (PROTECTED STUDENT DATA + GLOBAL DEPT DATA)
// ============================================================
export async function getScopedHubState(callerUser, sinceVersion = 0) {
  const store = await ensureInitialized();
  const meta = await readKey(store, 'meta', { initialized: true, version: 1, updatedAt: new Date().toISOString() });

  if (sinceVersion && Number(sinceVersion) === Number(meta.version)) {
    return {
      unchanged: true,
      version: meta.version,
      updatedAt: meta.updatedAt,
    };
  }

  const [courses, courseRep, timetable, venues, assignments, announcements, notes] = await Promise.all([
    readKey(store, 'courses', INITIAL_COURSES),
    readKey(store, 'courseRep', INITIAL_COURSE_REP),
    readKey(store, 'timetable', INITIAL_TIMETABLE),
    readKey(store, 'venues', INITIAL_VENUES),
    readKey(store, 'assignments', INITIAL_ASSIGNMENTS),
    readKey(store, 'announcements', INITIAL_ANNOUNCEMENTS),
    readKey(store, 'notes', INITIAL_NOTES),
  ]);

  // Public unauthenticated view (Landing Page only — zero confidential data!)
  if (!callerUser) {
    return {
      unchanged: false,
      version: meta.version,
      updatedAt: meta.updatedAt,
      courses,
      courseRep,
      timetable: [],
      venues: [],
      assignments: [],
      announcements: [],
      notes: [],
      users: [],
      payments: [],
      submissions: [],
      complaints: [],
      auditLogs: [],
    };
  }

  const isAdmin = callerUser.role === 'admin' && callerUser.email?.trim().toLowerCase() === ADMIN_EMAIL;
  const isApproved = isAdmin || callerUser.paymentStatus === 'APPROVED';

  // Redact note download URLs for unpaid students at backend level!
  const scopedNotes = isApproved
    ? notes
    : notes.map((n) => ({
        ...n,
        fileUrl: '',
        locked: true,
      }));

  const [users, payments, submissions, complaints, auditLogs] = await Promise.all([
    readKey(store, 'users', [INITIAL_ADMIN_USER]),
    readKey(store, 'payments', []),
    readKey(store, 'submissions', []),
    readKey(store, 'complaints', []),
    isAdmin ? readKey(store, 'auditLogs', []) : Promise.resolve([]),
  ]);

  if (isAdmin) {
    const secrets = await getServerSecrets();
    return {
      unchanged: false,
      version: meta.version,
      updatedAt: meta.updatedAt,
      courses,
      courseRep,
      notes: scopedNotes,
      timetable,
      venues,
      assignments,
      announcements,
      users,
      payments,
      submissions,
      complaints,
      auditLogs,
      serverConfigStatus: {
        geminiConfigured: Boolean(secrets.geminiApiKey),
        geminiSource: secrets.geminiSource,
        brevoConfigured: Boolean(secrets.brevoApiKey),
        brevoSource: secrets.brevoSource,
      },
    };
  }

  // Strictly isolate personal records for student callers!
  const callerId = callerUser.id;
  const callerEmail = callerUser.email.trim().toLowerCase();
  return {
    unchanged: false,
    version: meta.version,
    updatedAt: meta.updatedAt,
    courses,
    courseRep,
    notes: scopedNotes,
    timetable,
    venues,
    assignments,
    announcements,
    users: users.filter((u) => u.id === callerId || u.email?.trim().toLowerCase() === callerEmail),
    payments: payments.filter((p) => p.studentId === callerId || p.studentEmail?.trim().toLowerCase() === callerEmail),
    submissions: submissions.filter(
      (s) => s.studentId === callerId || s.studentEmail?.trim().toLowerCase() === callerEmail
    ),
    complaints: complaints.filter((c) => c.studentId === callerId),
    auditLogs: [],
  };
}

// ============================================================
// PDF GENERATOR & BINARY FILE BLOB STORAGE
// ============================================================
function escapePdfText(str) {
  return String(str || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function generateSimplePdfBase64({ courseCode, lectureNumber, topic, description }) {
  const lines = [
    `UNICAL CS HUB - Department of Computer Science (100 Level)`,
    `University of Calabar, Nigeria`,
    `----------------------------------------------------------------`,
    `Course Code: ${courseCode}   |   Lecture Number: ${lectureNumber}`,
    `Topic: ${topic}`,
    `----------------------------------------------------------------`,
    ``,
  ];
  const descWords = String(description || `Official lecture material for ${courseCode}: ${topic}`).split(/\s+/);
  let line = '';
  for (const w of descWords) {
    if ((line + ' ' + w).length > 82) {
      lines.push(line.trim());
      line = w;
    } else {
      line = line ? line + ' ' + w : w;
    }
  }
  if (line) lines.push(line.trim());

  let textOps = 'BT\n/F1 12 Tf\n50 750 Td\n16 TL\n';
  lines.forEach((l, idx) => {
    textOps += idx === 0 ? `(${escapePdfText(l)}) Tj\n` : `T* (${escapePdfText(l)}) Tj\n`;
  });
  textOps += 'ET';

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n',
    '3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >> endobj\n',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n',
    `5 0 obj << /Length ${Buffer.byteLength(textOps, 'utf8')} >>\nstream\n${textOps}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xrefPos = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, 'utf8').toString('base64');
}

export async function saveUploadedFile({ fileName, mimeType, base64Data, uploadedBy }) {
  const filesStore = openBlobStore(FILE_STORE_NAME);
  let cleanB64 = String(base64Data || '');
  let detectedMime = mimeType || 'application/pdf';

  if (cleanB64.startsWith('data:')) {
    const match = cleanB64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      detectedMime = match[1];
      cleanB64 = match[2];
    }
  }

  const sizeBytes = Math.floor((cleanB64.length * 3) / 4);
  if (sizeBytes > 4.5 * 1024 * 1024) {
    return { error: 'File size exceeds 4.5 MB server upload limit.' };
  }

  const fileId = 'file-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex');
  await writeKey(filesStore, fileId, {
    fileId,
    fileName: fileName || 'document.pdf',
    mimeType: detectedMime,
    base64: cleanB64,
    sizeBytes,
    uploadedBy: uploadedBy || ADMIN_EMAIL,
    uploadedAt: new Date().toISOString(),
  });

  const fileSize = sizeBytes >= 1024 * 1024
    ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;

  return {
    fileId,
    fileName: fileName || 'document.pdf',
    fileSize,
    fileUrl: `/.netlify/functions/hub-sync?fileId=${encodeURIComponent(fileId)}`,
  };
}

export async function getUploadedFile(fileId) {
  const filesStore = openBlobStore(FILE_STORE_NAME);
  return readKey(filesStore, fileId, null);
}

// ============================================================
// DOMAIN FUNCTIONS (USED BY BOTH ADMIN DASHBOARD & AI ASSISTANT)
// ============================================================
function normalizeCourseCode(code) {
  if (!code) return '';
  return String(code).replace(/\s+/g, '').toUpperCase();
}

export async function getPlatformStats() {
  const store = await ensureInitialized();
  const [users, courses, notes, timetable, venues, assignments, announcements, payments, submissions, complaints] =
    await Promise.all([
      readKey(store, 'users', []),
      readKey(store, 'courses', INITIAL_COURSES),
      readKey(store, 'notes', []),
      readKey(store, 'timetable', []),
      readKey(store, 'venues', []),
      readKey(store, 'assignments', []),
      readKey(store, 'announcements', []),
      readKey(store, 'payments', []),
      readKey(store, 'submissions', []),
      readKey(store, 'complaints', []),
    ]);

  const students = users.filter((u) => u.role !== 'admin');
  return {
    totalRegisteredUsers: users.length,
    totalStudents: students.length,
    approvedStudents: students.filter((u) => u.paymentStatus === 'APPROVED').length,
    pendingStudents: students.filter((u) => u.paymentStatus === 'PENDING').length,
    unpaidStudents: students.filter((u) => u.paymentStatus === 'UNPAID').length,
    bannedStudents: students.filter((u) => u.isBanned).length,
    totalCourses: courses.length,
    totalNotes: notes.length,
    totalTimetableClasses: timetable.length,
    totalVenues: venues.length,
    totalAssignments: assignments.length,
    totalAnnouncements: announcements.length,
    totalPayments: payments.length,
    pendingPayments: payments.filter((p) => p.status === 'PENDING').length,
    totalSubmissions: submissions.length,
    openComplaints: complaints.filter((c) => c.status === 'OPEN').length,
  };
}

export async function listDomainRecords(collection, filter = {}) {
  const store = await ensureInitialized();
  let items = await readKey(store, collection, []);
  if (!Array.isArray(items)) return [];

  if (collection === 'users') {
    const search = String(filter.search || '').trim().toLowerCase();
    return items
      .filter((u) => {
        if (!search) return true;
        return (
          u.fullName?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.matricNumber?.toLowerCase().includes(search)
        );
      })
      .map((u) => ({
        id: u.id,
        fullName: u.fullName,
        matricNumber: u.matricNumber,
        email: u.email,
        role: u.role,
        paymentStatus: u.paymentStatus,
        isBanned: Boolean(u.isBanned),
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt || null,
        loginCount: u.loginCount || 0,
      }));
  }

  if (filter.courseCode) {
    const target = normalizeCourseCode(filter.courseCode);
    items = items.filter((item) => normalizeCourseCode(item.courseCode || item.code) === target);
  }
  if (filter.dayOfWeek) {
    const targetDay = String(filter.dayOfWeek).trim().toLowerCase();
    items = items.filter((item) => item.dayOfWeek?.toLowerCase() === targetDay);
  }
  return items;
}

// --- COURSES ---
export async function updateCourse({ code, title, creditUnits, lecturer, description }, adminUser) {
  const store = await ensureInitialized();
  const courses = await readKey(store, 'courses', INITIAL_COURSES);
  const normCode = normalizeCourseCode(code);
  const idx = courses.findIndex((c) => normalizeCourseCode(c.code) === normCode);
  if (idx < 0) {
    return { success: false, error: `Course "${code}" not found. Valid courses: ${courses.map((c) => c.code).join(', ')}` };
  }

  const updatedCourse = {
    ...courses[idx],
    ...(title ? { title: String(title).trim() } : {}),
    ...(creditUnits !== undefined ? { creditUnits: Number(creditUnits) } : {}),
    ...(lecturer ? { lecturer: String(lecturer).trim() } : {}),
    ...(description ? { description: String(description).trim() } : {}),
  };
  courses[idx] = updatedCourse;
  await writeKey(store, 'courses', courses);
  await appendAuditLog(store, adminUser?.fullName, 'UPDATE_COURSE', `Updated course ${normCode} details.`);
  const meta = await bumpVersion(store);
  return { success: true, record: updatedCourse, meta };
}

// --- NOTES ---
export async function uploadNoteRecord(input, adminUser) {
  const store = await ensureInitialized();
  const courses = await readKey(store, 'courses', INITIAL_COURSES);
  const normCode = normalizeCourseCode(input.courseCode);
  if (!courses.some((c) => normalizeCourseCode(c.code) === normCode)) {
    return { success: false, error: `Unknown course code "${input.courseCode}". Valid courses: ${courses.map((c) => c.code).join(', ')}` };
  }

  const topic = String(input.topic || '').trim();
  if (!topic) {
    return { success: false, error: 'Note topic/title is required.' };
  }

  const lectureNumber = Number(input.lectureNumber) || 1;
  const description = String(input.description || `Lecture ${lectureNumber} notes covering ${topic} for ${normCode}.`).trim();

  let fileUrl = input.fileUrl || '';
  let fileName = input.fileName || `${normCode}_Lecture${lectureNumber}_${topic.replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`;
  let fileSize = input.fileSize || '1.2 MB';

  if (input.fileBase64) {
    const saved = await saveUploadedFile({
      fileName,
      mimeType: input.mimeType || 'application/pdf',
      base64Data: input.fileBase64,
      uploadedBy: adminUser?.email,
    });
    if (saved.error) return { success: false, error: saved.error };
    fileUrl = saved.fileUrl;
    fileName = saved.fileName;
    fileSize = saved.fileSize;
  } else if (input.fileId) {
    fileUrl = `/.netlify/functions/hub-sync?fileId=${encodeURIComponent(input.fileId)}`;
  } else if (!fileUrl || fileUrl.includes('dummy.pdf')) {
    // Generate a real valid downloadable PDF containing the lecture content instead of dummy.pdf
    const pdfB64 = generateSimplePdfBase64({
      courseCode: normCode,
      lectureNumber,
      topic,
      description: input.contentText || description,
    });
    const saved = await saveUploadedFile({
      fileName,
      mimeType: 'application/pdf',
      base64Data: pdfB64,
      uploadedBy: adminUser?.email,
    });
    if (!saved.error) {
      fileUrl = saved.fileUrl;
      fileSize = saved.fileSize;
    }
  }

  const notes = await readKey(store, 'notes', []);
  const newNote = {
    id: 'note-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex'),
    courseCode: normCode,
    lectureNumber,
    topic,
    description,
    fileUrl,
    fileName,
    fileSize,
    uploadDate: new Date().toISOString(),
    uploadedBy: adminUser?.fullName || 'Course Rep Divine',
  };

  await writeKey(store, 'notes', [newNote, ...notes]);
  await appendAuditLog(store, adminUser?.fullName, 'UPLOAD_NOTE', `Uploaded ${normCode} Lecture ${lectureNumber}: "${topic}"`);
  const meta = await bumpVersion(store);
  return { success: true, record: newNote, meta };
}

export async function updateNoteRecord(input, adminUser) {
  const store = await ensureInitialized();
  const notes = await readKey(store, 'notes', []);
  const idx = notes.findIndex((n) => n.id === input.id);
  if (idx < 0) return { success: false, error: `Lecture note with id "${input.id}" was not found.` };

  const updated = {
    ...notes[idx],
    ...(input.courseCode ? { courseCode: normalizeCourseCode(input.courseCode) } : {}),
    ...(input.lectureNumber !== undefined ? { lectureNumber: Number(input.lectureNumber) } : {}),
    ...(input.topic ? { topic: String(input.topic).trim() } : {}),
    ...(input.description ? { description: String(input.description).trim() } : {}),
  };
  notes[idx] = updated;
  await writeKey(store, 'notes', notes);
  await appendAuditLog(store, adminUser?.fullName, 'UPDATE_NOTE', `Updated note ${updated.courseCode}: "${updated.topic}"`);
  const meta = await bumpVersion(store);
  return { success: true, record: updated, meta };
}

export async function deleteNoteRecord(id, adminUser) {
  const store = await ensureInitialized();
  const notes = await readKey(store, 'notes', []);
  const existing = notes.find((n) => n.id === id);
  if (!existing) return { success: false, error: `Lecture note with id "${id}" not found.` };

  const next = notes.filter((n) => n.id !== id);
  await writeKey(store, 'notes', next);
  await appendAuditLog(store, adminUser?.fullName, 'DELETE_NOTE', `Deleted note ${existing.courseCode}: "${existing.topic}"`);
  const meta = await bumpVersion(store);
  return { success: true, deleted: existing, meta };
}

// --- TIMETABLE & VENUES (BI-DIRECTIONALLY SYNCHRONIZED) ---
export async function addTimetableClassRecord(input, adminUser) {
  const store = await ensureInitialized();
  const courses = await readKey(store, 'courses', INITIAL_COURSES);
  const normCode = normalizeCourseCode(input.courseCode);
  const course = courses.find((c) => normalizeCourseCode(c.code) === normCode);
  if (!course) {
    return { success: false, error: `Unknown course code "${input.courseCode}".` };
  }

  const dayOfWeek = String(input.dayOfWeek || '').trim();
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const matchedDay = validDays.find((d) => d.toLowerCase() === dayOfWeek.toLowerCase());
  if (!matchedDay) {
    return { success: false, error: `Invalid dayOfWeek "${dayOfWeek}". Must be Monday through Friday.` };
  }

  const startTime = String(input.startTime || '').trim();
  const endTime = String(input.endTime || '').trim();
  const venue = String(input.venue || '').trim();
  if (!startTime || !endTime || !venue) {
    return { success: false, error: 'startTime, endTime, and venue are all required.' };
  }

  const timetable = await readKey(store, 'timetable', []);
  const newEntry = {
    id: 'tt-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex'),
    dayOfWeek: matchedDay,
    startTime,
    endTime,
    courseCode: course.code,
    courseTitle: input.courseTitle || course.title,
    lecturer: input.lecturer || course.lecturer,
    venue,
    semester: input.semester || 'First Semester',
    academicYear: input.academicYear || '2026/2027',
  };

  await writeKey(store, 'timetable', [...timetable, newEntry]);
  await appendAuditLog(
    store,
    adminUser?.fullName,
    'ADD_TIMETABLE_CLASS',
    `Added ${newEntry.courseCode} on ${newEntry.dayOfWeek} (${startTime}-${endTime}) at ${venue}`
  );
  const meta = await bumpVersion(store);
  return { success: true, record: newEntry, meta };
}

export async function updateTimetableClassRecord(input, adminUser) {
  const store = await ensureInitialized();
  const timetable = await readKey(store, 'timetable', []);
  const idx = timetable.findIndex((t) => t.id === input.id);
  if (idx < 0) {
    return { success: false, error: `Timetable class with id "${input.id}" not found.` };
  }

  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  let dayOfWeek = timetable[idx].dayOfWeek;
  if (input.dayOfWeek) {
    const m = validDays.find((d) => d.toLowerCase() === String(input.dayOfWeek).trim().toLowerCase());
    if (!m) return { success: false, error: `Invalid dayOfWeek "${input.dayOfWeek}".` };
    dayOfWeek = m;
  }

  const updated = {
    ...timetable[idx],
    dayOfWeek,
    ...(input.startTime ? { startTime: String(input.startTime).trim() } : {}),
    ...(input.endTime ? { endTime: String(input.endTime).trim() } : {}),
    ...(input.venue ? { venue: String(input.venue).trim() } : {}),
    ...(input.lecturer ? { lecturer: String(input.lecturer).trim() } : {}),
    ...(input.courseTitle ? { courseTitle: String(input.courseTitle).trim() } : {}),
  };

  timetable[idx] = updated;
  await writeKey(store, 'timetable', timetable);

  // Keep course venue synced if venue changed
  if (input.venue) {
    const venues = await readKey(store, 'venues', []);
    const nextVenues = venues.map((v) =>
      normalizeCourseCode(v.courseCode) === normalizeCourseCode(updated.courseCode)
        ? {
            ...v,
            venueName: updated.venue,
            dayTime: `${updated.dayOfWeek}s ${updated.startTime} - ${updated.endTime}`,
            isChanged: true,
            changeNotice: `Timetable venue updated to ${updated.venue}.`,
          }
        : v
    );
    await writeKey(store, 'venues', nextVenues);
  }

  await appendAuditLog(
    store,
    adminUser?.fullName,
    'EDIT_TIMETABLE_CLASS',
    `Updated ${updated.courseCode} (${updated.dayOfWeek} ${updated.startTime}-${updated.endTime}, ${updated.venue})`
  );
  const meta = await bumpVersion(store);
  return { success: true, record: updated, meta };
}

export async function deleteTimetableClassRecord(id, adminUser) {
  const store = await ensureInitialized();
  const timetable = await readKey(store, 'timetable', []);
  const existing = timetable.find((t) => t.id === id);
  if (!existing) {
    return { success: false, error: `Timetable class with id "${id}" not found.` };
  }
  await writeKey(store, 'timetable', timetable.filter((t) => t.id !== id));
  await appendAuditLog(
    store,
    adminUser?.fullName,
    'DELETE_TIMETABLE_CLASS',
    `Removed ${existing.courseCode} class on ${existing.dayOfWeek}`
  );
  const meta = await bumpVersion(store);
  return { success: true, deleted: existing, meta };
}

export async function updateVenueRecord(input, adminUser) {
  const store = await ensureInitialized();
  const courses = await readKey(store, 'courses', INITIAL_COURSES);
  const normCode = normalizeCourseCode(input.courseCode);
  const course = courses.find((c) => normalizeCourseCode(c.code) === normCode);
  const venueName = String(input.venueName || input.venue || '').trim();
  if (!normCode || !venueName) {
    return { success: false, error: 'courseCode and venueName are required.' };
  }

  const changeNotice =
    input.changeNotice || `Notice: Lecture venue updated to ${venueName}. Please be seated 10 mins early.`;

  let venues = await readKey(store, 'venues', INITIAL_VENUES);
  let found = false;
  let updatedVenue = null;

  venues = venues.map((v) => {
    if (normalizeCourseCode(v.courseCode) === normCode) {
      found = true;
      updatedVenue = {
        ...v,
        venueName,
        ...(input.dayTime ? { dayTime: String(input.dayTime).trim() } : {}),
        ...(input.capacity !== undefined ? { capacity: Number(input.capacity) } : {}),
        isChanged: true,
        changeNotice,
      };
      return updatedVenue;
    }
    return v;
  });

  if (!found) {
    updatedVenue = {
      id: 'v-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex'),
      courseCode: course ? course.code : normCode,
      courseName: course ? course.title : normCode,
      venueName,
      capacity: Number(input.capacity) || 180,
      dayTime: input.dayTime || 'Announced weekly',
      isChanged: true,
      changeNotice,
    };
    venues = [...venues, updatedVenue];
  }

  await writeKey(store, 'venues', venues);

  // Sync matching timetable rows so timetable & venues never drift out of sync!
  const timetable = await readKey(store, 'timetable', []);
  const syncedTimetable = timetable.map((t) =>
    normalizeCourseCode(t.courseCode) === normCode ? { ...t, venue: venueName } : t
  );
  await writeKey(store, 'timetable', syncedTimetable);

  await appendAuditLog(store, adminUser?.fullName, 'UPDATE_VENUE', `Changed ${normCode} lecture venue to ${venueName}`);
  const meta = await bumpVersion(store);
  return { success: true, record: updatedVenue, meta };
}

// --- ASSIGNMENTS ---
export async function createAssignmentRecord(input, adminUser) {
  const store = await ensureInitialized();
  const courses = await readKey(store, 'courses', INITIAL_COURSES);
  const normCode = normalizeCourseCode(input.courseCode);
  if (!courses.some((c) => normalizeCourseCode(c.code) === normCode)) {
    return { success: false, error: `Unknown course code "${input.courseCode}".` };
  }

  const title = String(input.title || '').trim();
  const instructions = String(input.instructions || '').trim();
  const dueDate = String(input.dueDate || '').trim();
  if (!title || !instructions || !dueDate) {
    return { success: false, error: 'title, instructions, and dueDate are all required.' };
  }

  const assignments = await readKey(store, 'assignments', []);
  const newAssign = {
    id: 'assign-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex'),
    courseCode: normCode,
    title,
    instructions,
    dueDate,
    maxScore: Number(input.maxScore) || 20,
    createdBy: input.createdBy || adminUser?.fullName || 'Course Rep Divine',
    createdAt: new Date().toISOString(),
  };

  await writeKey(store, 'assignments', [newAssign, ...assignments]);
  await appendAuditLog(store, adminUser?.fullName, 'CREATE_ASSIGNMENT', `Created ${normCode} assignment: "${title}"`);
  const meta = await bumpVersion(store);
  return { success: true, record: newAssign, meta };
}

export async function updateAssignmentRecord(input, adminUser) {
  const store = await ensureInitialized();
  const assignments = await readKey(store, 'assignments', []);
  const idx = assignments.findIndex((a) => a.id === input.id);
  if (idx < 0) {
    return { success: false, error: `Assignment with id "${input.id}" not found.` };
  }

  const updated = {
    ...assignments[idx],
    ...(input.courseCode ? { courseCode: normalizeCourseCode(input.courseCode) } : {}),
    ...(input.title ? { title: String(input.title).trim() } : {}),
    ...(input.instructions ? { instructions: String(input.instructions).trim() } : {}),
    ...(input.dueDate ? { dueDate: String(input.dueDate).trim() } : {}),
    ...(input.maxScore !== undefined ? { maxScore: Number(input.maxScore) } : {}),
  };

  assignments[idx] = updated;
  await writeKey(store, 'assignments', assignments);
  await appendAuditLog(store, adminUser?.fullName, 'UPDATE_ASSIGNMENT', `Updated assignment "${updated.title}"`);
  const meta = await bumpVersion(store);
  return { success: true, record: updated, meta };
}

export async function deleteAssignmentRecord(id, adminUser) {
  const store = await ensureInitialized();
  const assignments = await readKey(store, 'assignments', []);
  const existing = assignments.find((a) => a.id === id);
  if (!existing) {
    return { success: false, error: `Assignment with id "${id}" not found.` };
  }
  await writeKey(store, 'assignments', assignments.filter((a) => a.id !== id));
  await appendAuditLog(store, adminUser?.fullName, 'DELETE_ASSIGNMENT', `Deleted assignment "${existing.title}"`);
  const meta = await bumpVersion(store);
  return { success: true, deleted: existing, meta };
}

// --- ANNOUNCEMENTS & COURSE REP ---
export async function publishAnnouncementRecord(input, adminUser) {
  const store = await ensureInitialized();
  const title = String(input.title || '').trim();
  const content = String(input.content || '').trim();
  if (!title || !content) {
    return { success: false, error: 'Announcement title and content are required.' };
  }

  const announcements = await readKey(store, 'announcements', []);
  const newAnn = {
    id: 'ann-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex'),
    title,
    content,
    priority: input.priority === 'URGENT' ? 'URGENT' : 'NORMAL',
    targetLevel: input.targetLevel || '100',
    authorName: input.authorName || adminUser?.fullName || 'Divine Christopher Inyang',
    createdAt: new Date().toISOString(),
  };

  await writeKey(store, 'announcements', [newAnn, ...announcements]);
  await appendAuditLog(store, adminUser?.fullName, 'PUBLISH_ANNOUNCEMENT', `Published announcement: "${title}"`);
  const meta = await bumpVersion(store);
  return { success: true, record: newAnn, meta };
}

export async function deleteAnnouncementRecord(id, adminUser) {
  const store = await ensureInitialized();
  const announcements = await readKey(store, 'announcements', []);
  const existing = announcements.find((a) => a.id === id);
  if (!existing) {
    return { success: false, error: `Announcement with id "${id}" not found.` };
  }
  await writeKey(store, 'announcements', announcements.filter((a) => a.id !== id));
  await appendAuditLog(store, adminUser?.fullName, 'DELETE_ANNOUNCEMENT', `Deleted announcement: "${existing.title}"`);
  const meta = await bumpVersion(store);
  return { success: true, deleted: existing, meta };
}

export async function updateCourseRepRecord(updates, adminUser) {
  const store = await ensureInitialized();
  const current = await readKey(store, 'courseRep', INITIAL_COURSE_REP);
  const updated = {
    ...current,
    ...(updates.fullName ? { fullName: String(updates.fullName).trim() } : {}),
    ...(updates.phone ? { phone: String(updates.phone).trim() } : {}),
    ...(updates.email ? { email: String(updates.email).trim() } : {}),
    ...(updates.photoUrl ? { photoUrl: String(updates.photoUrl).trim() } : {}),
    updatedAt: new Date().toISOString(),
  };
  await writeKey(store, 'courseRep', updated);
  await appendAuditLog(store, adminUser?.fullName, 'UPDATE_COURSE_REP', 'Updated official Course Representative profile.');
  const meta = await bumpVersion(store);
  return { success: true, record: updated, meta };
}

// --- PAYMENTS, ACCESS, BAN/UNBAN, SUBMISSIONS, COMPLAINTS ---
export async function submitPaymentRecord(input, callerUser) {
  const store = await ensureInitialized();
  const payments = await readKey(store, 'payments', []);
  const txRef = String(input.transactionReference || '').trim();
  if (!txRef) return { success: false, error: 'Transaction reference is required.' };

  if (payments.some((p) => p.transactionReference?.trim().toUpperCase() === txRef.toUpperCase())) {
    return { success: false, error: 'This transaction reference has already been submitted.' };
  }

  const record = {
    id: 'pay-' + Date.now(),
    studentId: callerUser.id,
    studentEmail: callerUser.email,
    studentName: callerUser.fullName,
    matricNumber: callerUser.matricNumber,
    amount: 500,
    senderName: String(input.senderName || callerUser.fullName).trim(),
    bankName: String(input.bankName || 'OPay').trim(),
    transactionReference: txRef,
    proofImageUrl: input.proofImageUrl || undefined,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  await writeKey(store, 'payments', [record, ...payments]);

  // Atomically update student's profile status to PENDING
  const users = await readKey(store, 'users', []);
  const nextUsers = users.map((u) =>
    u.id === callerUser.id || u.email?.toLowerCase() === callerUser.email.toLowerCase()
      ? { ...u, paymentStatus: 'PENDING' }
      : u
  );
  await writeKey(store, 'users', nextUsers);
  const meta = await bumpVersion(store);
  return { success: true, record, meta };
}

export async function updatePaymentStatusRecord({ id, status, rejectionReason }, adminUser) {
  const store = await ensureInitialized();
  const payments = await readKey(store, 'payments', []);
  let matchedPayment = null;

  const nextPayments = payments.map((p) => {
    if (p.id === id) {
      matchedPayment = {
        ...p,
        status,
        ...(rejectionReason ? { rejectionReason } : {}),
        ...(status === 'APPROVED' ? { approvedBy: adminUser.fullName, approvedAt: new Date().toISOString() } : {}),
      };
      return matchedPayment;
    }
    return p;
  });

  if (!matchedPayment) return { success: false, error: 'Payment record not found.' };
  await writeKey(store, 'payments', nextPayments);

  const users = await readKey(store, 'users', []);
  const nextUsers = users.map((u) => {
    const matchById = matchedPayment.studentId && u.id === matchedPayment.studentId;
    const matchByEmail =
      matchedPayment.studentEmail &&
      u.email?.trim().toLowerCase() === matchedPayment.studentEmail.trim().toLowerCase();
    return matchById || matchByEmail ? { ...u, paymentStatus: status } : u;
  });
  await writeKey(store, 'users', nextUsers);
  await appendAuditLog(
    store,
    adminUser?.fullName,
    status === 'APPROVED' ? 'APPROVE_PAYMENT' : 'REJECT_PAYMENT',
    `${status} payment for ${matchedPayment.studentName} (${matchedPayment.matricNumber})`
  );
  const meta = await bumpVersion(store);
  return { success: true, record: matchedPayment, meta };
}

export async function updateUserAccessRecord({ studentId, paymentStatus }, adminUser) {
  const store = await ensureInitialized();
  const users = await readKey(store, 'users', []);
  let found = null;
  const nextUsers = users.map((u) => {
    if (u.id === studentId) {
      found = { ...u, paymentStatus };
      return found;
    }
    return u;
  });
  if (!found) return { success: false, error: 'Student account not found.' };

  await writeKey(store, 'users', nextUsers);
  await appendAuditLog(store, adminUser?.fullName, 'SET_USER_ACCESS', `Set course note access to ${paymentStatus} for ${found.fullName}`);
  const meta = await bumpVersion(store);
  return { success: true, record: found, meta };
}

export async function updateUserBanRecord({ studentId, isBanned, reason }, adminUser) {
  const store = await ensureInitialized();
  const users = await readKey(store, 'users', []);
  let found = null;
  const nextUsers = users.map((u) => {
    if (u.id === studentId && u.role !== 'admin') {
      found = {
        ...u,
        isBanned: Boolean(isBanned),
        bannedAt: isBanned ? new Date().toISOString() : undefined,
        banReason: isBanned ? (reason || 'Suspended by Course Representative') : undefined,
      };
      return found;
    }
    return u;
  });
  if (!found) return { success: false, error: 'Student account not found or cannot ban admin.' };

  await writeKey(store, 'users', nextUsers);
  await appendAuditLog(
    store,
    adminUser?.fullName,
    isBanned ? 'BAN_STUDENT' : 'UNBAN_STUDENT',
    `${isBanned ? 'Suspended' : 'Restored'} account for ${found.fullName} (${found.matricNumber})`
  );
  const meta = await bumpVersion(store);
  return { success: true, record: found, meta };
}

export async function updateOwnProfileRecord(updates, callerUser) {
  const store = await ensureInitialized();
  const users = await readKey(store, 'users', []);
  let updated = null;
  const nextUsers = users.map((u) => {
    if (u.id === callerUser.id || u.email?.toLowerCase() === callerUser.email.toLowerCase()) {
      // Strictly allow safe profile fields ONLY (never role, paymentStatus, isBanned!)
      updated = {
        ...u,
        ...(updates.fullName ? { fullName: String(updates.fullName).trim() } : {}),
        ...(updates.avatarUrl !== undefined ? { avatarUrl: updates.avatarUrl || undefined } : {}),
      };
      return updated;
    }
    return u;
  });
  if (!updated) return { success: false, error: 'User profile not found.' };
  await writeKey(store, 'users', nextUsers);
  const meta = await bumpVersion(store);
  return { success: true, record: updated, meta };
}

export async function submitAssignmentWorkRecord(input, callerUser) {
  const store = await ensureInitialized();
  const assignments = await readKey(store, 'assignments', []);
  const targetAssign = assignments.find((a) => a.id === input.assignmentId);
  if (!targetAssign) {
    return { success: false, error: 'Target assignment not found.' };
  }

  let fileUrl = input.fileUrl || '';
  let fileName = input.fileName || 'submission.pdf';
  let fileSize = input.fileSize || '200 KB';

  if (input.fileBase64) {
    const saved = await saveUploadedFile({
      fileName,
      mimeType: input.mimeType || 'application/pdf',
      base64Data: input.fileBase64,
      uploadedBy: callerUser.email,
    });
    if (saved.error) return { success: false, error: saved.error };
    fileUrl = saved.fileUrl;
    fileName = saved.fileName;
    fileSize = saved.fileSize;
  }

  const submissions = await readKey(store, 'submissions', []);
  const newSub = {
    id: 'sub-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex'),
    assignmentId: targetAssign.id,
    courseCode: targetAssign.courseCode,
    assignmentTitle: targetAssign.title,
    studentId: callerUser.id,
    studentEmail: callerUser.email,
    studentName: callerUser.fullName,
    matricNumber: callerUser.matricNumber,
    fileUrl,
    fileName,
    fileSize,
    remarks: input.remarks ? String(input.remarks).trim() : undefined,
    submittedAt: new Date().toISOString(),
  };

  // Replace only this student's own prior submission for the same assignment
  const filtered = submissions.filter(
    (s) => !(s.assignmentId === targetAssign.id && s.studentId === callerUser.id)
  );
  await writeKey(store, 'submissions', [newSub, ...filtered]);
  const meta = await bumpVersion(store);
  return { success: true, record: newSub, meta };
}

export async function gradeSubmissionRecord({ id, grade, feedback }, adminUser) {
  const store = await ensureInitialized();
  const submissions = await readKey(store, 'submissions', []);
  let found = null;
  const next = submissions.map((s) => {
    if (s.id === id) {
      found = { ...s, grade: Number(grade), score: Number(grade), feedback };
      return found;
    }
    return s;
  });
  if (!found) return { success: false, error: 'Submission not found.' };
  await writeKey(store, 'submissions', next);
  await appendAuditLog(store, adminUser?.fullName, 'GRADE_SUBMISSION', `Graded ${found.studentName} (${found.courseCode}) score: ${grade}`);
  const meta = await bumpVersion(store);
  return { success: true, record: found, meta };
}

export async function submitComplaintRecord(input, callerUser) {
  const store = await ensureInitialized();
  const complaints = await readKey(store, 'complaints', []);
  const newComp = {
    id: 'comp-' + Date.now(),
    studentId: callerUser.id,
    studentName: callerUser.fullName,
    matricNumber: callerUser.matricNumber,
    subject: String(input.subject || '').trim(),
    category: input.category || 'Other academic issues',
    message: String(input.message || '').trim(),
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    responses: [],
  };
  await writeKey(store, 'complaints', [newComp, ...complaints]);
  const meta = await bumpVersion(store);
  return { success: true, record: newComp, meta };
}

export async function replyComplaintRecord({ id, text }, adminUser) {
  const store = await ensureInitialized();
  const complaints = await readKey(store, 'complaints', []);
  let found = null;
  const next = complaints.map((c) => {
    if (c.id === id) {
      found = {
        ...c,
        status: 'IN_PROGRESS',
        responses: [
          ...(c.responses || []),
          {
            id: 'resp-' + Date.now(),
            complaintId: id,
            responderName: adminUser.fullName,
            responderRole: 'Admin / Course Rep',
            message: String(text || '').trim(),
            createdAt: new Date().toISOString(),
          },
        ],
      };
      return found;
    }
    return c;
  });
  if (!found) return { success: false, error: 'Complaint not found.' };
  await writeKey(store, 'complaints', next);
  await appendAuditLog(store, adminUser?.fullName, 'REPLY_COMPLAINT', `Replied to support ticket ${id}`);
  const meta = await bumpVersion(store);
  return { success: true, record: found, meta };
}

export async function updateComplaintStatusRecord({ id, status }, adminUser) {
  const store = await ensureInitialized();
  const complaints = await readKey(store, 'complaints', []);
  let found = null;
  const next = complaints.map((c) => {
    if (c.id === id) {
      found = { ...c, status };
      return found;
    }
    return c;
  });
  if (!found) return { success: false, error: 'Complaint not found.' };
  await writeKey(store, 'complaints', next);
  await appendAuditLog(store, adminUser?.fullName, 'UPDATE_COMPLAINT_STATUS', `Set complaint ${id} to ${status}`);
  const meta = await bumpVersion(store);
  return { success: true, record: found, meta };
}

export async function setFullKey(key, value, adminUser) {
  const store = await ensureInitialized();
  const ALLOWED = [
    'courses',
    'courseRep',
    'notes',
    'timetable',
    'venues',
    'assignments',
    'announcements',
    'users',
    'payments',
    'submissions',
    'complaints',
    'auditLogs',
  ];
  if (!ALLOWED.includes(key)) {
    return { success: false, error: `Key "${key}" is not settable.` };
  }
  const cleanVal = Array.isArray(value) ? value : value;
  await writeKey(store, key, cleanVal);
  await appendAuditLog(
    store,
    adminUser?.fullName,
    'SET_KEY',
    `Updated entire departmental collection "${key}".`
  );
  const meta = await bumpVersion(store);
  return { success: true, meta };
}

