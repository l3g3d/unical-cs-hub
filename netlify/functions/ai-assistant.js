// Netlify Serverless Function: UNICAL CS HUB AI Website Assistant
// Authenticated Admin-Only Copilot with Native Gemini Function Calling
// Executes real CRUD operations directly against the central database (hubDb).

import {
  ADMIN_EMAIL,
  verifySessionToken,
  getServerSecrets,
  updateServerSecrets,
  saveUploadedFile,
  getPlatformStats,
  listDomainRecords,
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
} from './lib/hubDb.js';
import { buildGeminiContents, generateAssistantTurn } from './lib/aiProvider.js';

const NO_CACHE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Content-Type': 'application/json',
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: NO_CACHE_HEADERS,
    body: JSON.stringify(body),
  };
}

const SYSTEM_PROMPT = `You are "CS HUB AI ASSISTANT", the intelligent departmental management copilot for UNICAL CS HUB (100 Level Computer Science, University of Calabar, Nigeria).
You work directly inside the Admin Dashboard for Course Representative Divine Christopher Inyang (${ADMIN_EMAIL}).

OFFICIAL 100 LEVEL COURSES:
COS101 (Introduction to Computer Sciences), CSC181 (Computer Laboratory IA), GST111 (Communication in English), MTH101 (Elementary Mathematics 1), PHY101 (Introduction to Physics I), PHY107 (General Physics Practical I), STA111 (Basic Statistics).

COMMON UNICAL VENUES:
Science Lecture Theatre (SLT), Departmental Hardware Lab, CES Hall A, CES Hall B, New Science Complex Hall 1, New Science Complex Hall 2, Physics Lecture Theatre, Physics Laboratory 2, Maths & Stats Hall 2, Computing Lecture Hall.

CORE RULES OF OPERATION:
1. USE REAL TOOLS ONLY — NEVER PRETEND OR HALLUCINATE:
   - You have direct backend tool access to read and modify the live website database.
   - ALWAYS call the appropriate backend function(s) before claiming any database read, creation, update, or deletion happened.
   - Only report success AFTER the tool returns { "success": true }. If a tool returns an error, report the exact error clearly.
2. INSPECT BEFORE UPDATING OR DELETING:
   - If the administrator asks to update or remove something without giving its ID (e.g. "Update Thursday's lecture time", "Change the deadline for this assignment", "Remove the outdated assignment"), FIRST call list_timetable / list_assignments / list_notes / list_announcements / list_courses to inspect real existing records and find the exact ID.
3. CONVERSATIONAL FOLLOW-UPS FOR MISSING FIELDS:
   - If a create/upload/update instruction is missing essential details (for instance, user just says "Add an assignment for COS101" without a title, deadline, or instructions), DO NOT guess or invent details! Ask politely for the specific missing fields and remember prior answers across conversation turns.
   - Wait for ALL necessary fields (e.g., assignment title + dueDate + instructions; note courseCode + topic; timetable courseCode + dayOfWeek + startTime + endTime + venue; announcement title + content) before calling create/add mutating tools.
4. DESTRUCTIVE ACTION CONFIRMATION RULE:
   - Deleting records (delete_assignment, delete_note, delete_timetable_class, delete_announcement) is permanent.
   - You MUST ALWAYS set confirmed=false on your first deletion check (or state the exact target item title/code/ID and ask the admin to confirm) UNLESS the administrator ALREADY explicitly replied confirming deletion of that specific item in the current or immediately preceding turn.
   - NEVER silently delete data on the first ambiguous ask like "remove the outdated assignment" without confirmation.
5. STRICT SECURITY POLICY:
   - You MUST NEVER approve/reject ₦500 student payments, unlock course notes manually, change passwords, or promote student roles.
   - If requested, politely explain that financial verifications and security roles must be processed manually in Verify Payments or Students tabs.
6. CURRENT DATE CONTEXT:
   - When computing relative dates like "Friday" or "tomorrow", reference today's UTC date provided in the system context.`;

const TOOL_DECLARATIONS = [
  {
    name: 'get_platform_stats',
    description: 'Get live statistics from the central database: registered students count, approved/pending/unpaid/banned counts, notes count, assignments count, timetable classes, venues, announcements, and open complaints.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'list_courses',
    description: 'Retrieve all 100L Computer Science courses including course code, title, credit units, lecturer, and description.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'list_notes',
    description: 'Retrieve uploaded lecture notes currently on the website, optionally filtered by courseCode.',
    parameters: {
      type: 'OBJECT',
      properties: {
        courseCode: { type: 'STRING', description: 'Optional course code filter such as COS101 or MTH101' },
      },
    },
  },
  {
    name: 'list_timetable',
    description: 'Retrieve weekly lecture timetable entries, optionally filtered by dayOfWeek or courseCode.',
    parameters: {
      type: 'OBJECT',
      properties: {
        dayOfWeek: { type: 'STRING', description: 'Optional day filter: Monday, Tuesday, Wednesday, Thursday, Friday' },
        courseCode: { type: 'STRING', description: 'Optional course code filter' },
      },
    },
  },
  {
    name: 'list_venues',
    description: 'Retrieve departmental lecture venues and relocation notices, optionally filtered by courseCode.',
    parameters: {
      type: 'OBJECT',
      properties: {
        courseCode: { type: 'STRING', description: 'Optional course code filter' },
      },
    },
  },
  {
    name: 'list_assignments',
    description: 'Retrieve active coursework assignments currently published to students, optionally filtered by courseCode.',
    parameters: {
      type: 'OBJECT',
      properties: {
        courseCode: { type: 'STRING', description: 'Optional course code filter' },
      },
    },
  },
  {
    name: 'list_announcements',
    description: 'Retrieve all published departmental announcements.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'list_students_summary',
    description: 'Retrieve a summary list of registered student accounts (names, matric numbers, paymentStatus, standing, login count). Supports optional search text.',
    parameters: {
      type: 'OBJECT',
      properties: {
        search: { type: 'STRING', description: 'Optional name, matric number, or email search query' },
      },
    },
  },
  {
    name: 'upload_note',
    description: 'Upload and publish a lecture note for a course to all approved students. Only call when courseCode and topic are known. If an uploaded fileId was provided in the prompt, include it.',
    parameters: {
      type: 'OBJECT',
      properties: {
        courseCode: { type: 'STRING', description: 'Course code e.g. COS101, MTH101, STA111' },
        lectureNumber: { type: 'INTEGER', description: 'Lecture number e.g. 1, 2, 3' },
        topic: { type: 'STRING', description: 'Lecture note topic/title' },
        description: { type: 'STRING', description: 'Summary or description of note contents' },
        contentText: { type: 'STRING', description: 'Optional study notes text used to generate a readable PDF when no PDF attachment was supplied' },
        fileId: { type: 'STRING', description: 'Optional attached fileId if the admin attached a file in chat' },
        fileName: { type: 'STRING', description: 'Optional filename' },
      },
      required: ['courseCode', 'topic'],
    },
  },
  {
    name: 'update_note',
    description: 'Update an existing lecture note by ID (topic, lectureNumber, description, or courseCode). Call list_notes first to find the id.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING', description: 'Exact ID of the note to update' },
        courseCode: { type: 'STRING' },
        lectureNumber: { type: 'INTEGER' },
        topic: { type: 'STRING' },
        description: { type: 'STRING' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_note',
    description: 'Permanently delete a lecture note by ID. IMPORTANT: Set confirmed=true ONLY AFTER the admin explicitly confirms deleting this specific note.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING', description: 'Exact note ID to delete' },
        confirmed: { type: 'BOOLEAN', description: 'Must be true only after explicit user confirmation' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_assignment',
    description: 'Create and publish a new course assignment for all students. Requires courseCode, title, instructions, and dueDate.',
    parameters: {
      type: 'OBJECT',
      properties: {
        courseCode: { type: 'STRING', description: 'Course code e.g. COS101, STA111' },
        title: { type: 'STRING', description: 'Assignment title' },
        instructions: { type: 'STRING', description: 'Questions and submission instructions' },
        dueDate: { type: 'STRING', description: 'Deadline date/time string (ISO 8601 preferred or clear readable date)' },
        maxScore: { type: 'INTEGER', description: 'Maximum marks (default 20)' },
      },
      required: ['courseCode', 'title', 'instructions', 'dueDate'],
    },
  },
  {
    name: 'update_assignment',
    description: 'Update an existing assignment by ID (change deadline dueDate, title, instructions, or maxScore). Call list_assignments first to get the ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING', description: 'Exact assignment ID' },
        courseCode: { type: 'STRING' },
        title: { type: 'STRING' },
        instructions: { type: 'STRING' },
        dueDate: { type: 'STRING', description: 'Updated deadline' },
        maxScore: { type: 'INTEGER' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_assignment',
    description: 'Permanently delete an assignment by ID. IMPORTANT: Set confirmed=true ONLY AFTER the admin explicitly confirms deleting this specific assignment.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING', description: 'Exact assignment ID to delete' },
        confirmed: { type: 'BOOLEAN', description: 'Must be true only after explicit user confirmation' },
      },
      required: ['id'],
    },
  },
  {
    name: 'add_timetable_class',
    description: 'Add a new class session to the weekly timetable.',
    parameters: {
      type: 'OBJECT',
      properties: {
        courseCode: { type: 'STRING', description: 'Course code e.g. COS101' },
        dayOfWeek: { type: 'STRING', description: 'Monday, Tuesday, Wednesday, Thursday, or Friday' },
        startTime: { type: 'STRING', description: '24h HH:MM format e.g. 08:00 or 14:00' },
        endTime: { type: 'STRING', description: '24h HH:MM format e.g. 10:00 or 16:00' },
        venue: { type: 'STRING', description: 'Lecture hall or laboratory name' },
        lecturer: { type: 'STRING', description: 'Optional lecturer name' },
      },
      required: ['courseCode', 'dayOfWeek', 'startTime', 'endTime', 'venue'],
    },
  },
  {
    name: 'update_timetable_class',
    description: 'Update an existing timetable class by ID (time, day, venue, lecturer). Call list_timetable first to find the exact class ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING', description: 'Exact timetable entry ID' },
        dayOfWeek: { type: 'STRING' },
        startTime: { type: 'STRING', description: '24h HH:MM format' },
        endTime: { type: 'STRING', description: '24h HH:MM format' },
        venue: { type: 'STRING' },
        lecturer: { type: 'STRING' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_timetable_class',
    description: 'Permanently delete a timetable class by ID. IMPORTANT: Set confirmed=true ONLY AFTER the admin explicitly confirms deleting this specific class.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING', description: 'Exact timetable entry ID' },
        confirmed: { type: 'BOOLEAN', description: 'Must be true only after explicit user confirmation' },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_venue',
    description: 'Update or relocate the official lecture venue for a course across both the Venues tracker and Weekly Timetable.',
    parameters: {
      type: 'OBJECT',
      properties: {
        courseCode: { type: 'STRING', description: 'Course code e.g. COS101' },
        venueName: { type: 'STRING', description: 'New venue / hall name' },
        changeNotice: { type: 'STRING', description: 'Relocation notice message for students' },
        dayTime: { type: 'STRING', description: 'Optional schedule display label e.g. Mondays 8:00 AM - 10:00 AM' },
        capacity: { type: 'INTEGER', description: 'Optional room seat capacity' },
      },
      required: ['courseCode', 'venueName'],
    },
  },
  {
    name: 'update_course',
    description: 'Update course metadata or assigned lecturer information.',
    parameters: {
      type: 'OBJECT',
      properties: {
        code: { type: 'STRING', description: 'Course code e.g. COS101' },
        title: { type: 'STRING' },
        creditUnits: { type: 'INTEGER' },
        lecturer: { type: 'STRING' },
        description: { type: 'STRING' },
      },
      required: ['code'],
    },
  },
  {
    name: 'publish_announcement',
    description: 'Publish a departmental announcement visible on all student dashboards.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Announcement headline' },
        content: { type: 'STRING', description: 'Full announcement message' },
        priority: { type: 'STRING', description: 'NORMAL or URGENT' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'delete_announcement',
    description: 'Permanently delete a departmental announcement by ID. IMPORTANT: Set confirmed=true ONLY AFTER explicit confirmation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING', description: 'Exact announcement ID' },
        confirmed: { type: 'BOOLEAN', description: 'Must be true only after explicit user confirmation' },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_course_rep',
    description: 'Update Course Representative contact card details displayed on student dashboards.',
    parameters: {
      type: 'OBJECT',
      properties: {
        fullName: { type: 'STRING' },
        phone: { type: 'STRING' },
        email: { type: 'STRING' },
      },
    },
  },
];

const DESTRUCTIVE_TOOLS = {
  delete_assignment: { actionType: 'DELETE_ASSIGNMENT', collection: 'assignments', label: 'Assignment' },
  delete_note: { actionType: 'DELETE_NOTE', collection: 'notes', label: 'Lecture Note' },
  delete_timetable_class: { actionType: 'DELETE_TIMETABLE_CLASS', collection: 'timetable', label: 'Timetable Class' },
  delete_announcement: { actionType: 'DELETE_ANNOUNCEMENT', collection: 'announcements', label: 'Announcement' },
};

function isExplicitDeleteConfirmationText(text) {
  const lower = String(text || '').trim().toLowerCase();
  return /^(yes|confirm|go ahead|proceed|delete it|do it|yes,? please|sure|okay,? delete|ok,? delete)/i.test(lower);
}

async function executeToolCall(name, args = {}, adminUser, contextMeta = {}) {
  switch (name) {
    case 'get_platform_stats':
      return { success: true, stats: await getPlatformStats() };
    case 'list_courses':
      return { success: true, courses: await listDomainRecords('courses', args) };
    case 'list_notes':
      return { success: true, notes: await listDomainRecords('notes', args) };
    case 'list_timetable':
      return { success: true, timetable: await listDomainRecords('timetable', args) };
    case 'list_venues':
      return { success: true, venues: await listDomainRecords('venues', args) };
    case 'list_assignments':
      return { success: true, assignments: await listDomainRecords('assignments', args) };
    case 'list_announcements':
      return { success: true, announcements: await listDomainRecords('announcements', args) };
    case 'list_students_summary':
      return { success: true, students: await listDomainRecords('users', args) };

    case 'upload_note':
      return uploadNoteRecord(
        {
          ...args,
          fileId: args.fileId || contextMeta.uploadedAttachment?.fileId,
          fileName: args.fileName || contextMeta.uploadedAttachment?.fileName,
          fileSize: contextMeta.uploadedAttachment?.fileSize,
        },
        adminUser
      );
    case 'update_note':
      return updateNoteRecord(args, adminUser);
    case 'create_assignment':
      return createAssignmentRecord(args, adminUser);
    case 'update_assignment':
      return updateAssignmentRecord(args, adminUser);
    case 'add_timetable_class':
      return addTimetableClassRecord(args, adminUser);
    case 'update_timetable_class':
      return updateTimetableClassRecord(args, adminUser);
    case 'update_venue':
      return updateVenueRecord(args, adminUser);
    case 'update_course':
      return updateCourse(args, adminUser);
    case 'publish_announcement':
      return publishAnnouncementRecord(args, adminUser);
    case 'update_course_rep':
      return updateCourseRepRecord(args, adminUser);

    case 'delete_assignment':
    case 'delete_note':
    case 'delete_timetable_class':
    case 'delete_announcement': {
      const meta = DESTRUCTIVE_TOOLS[name];
      const items = await listDomainRecords(meta.collection);
      const target = items.find((i) => i.id === args.id);
      if (!target) {
        return { success: false, error: `${meta.label} with id "${args.id}" was not found.` };
      }

      const allowDelete = Boolean(args.confirmed && contextMeta.userConfirmedDestructive);
      if (!allowDelete) {
        const titleText = target.title || target.topic || `${target.courseCode} (${target.dayOfWeek} ${target.startTime})`;
        contextMeta.pendingConfirmation = {
          id: 'act-' + Date.now(),
          type: meta.actionType,
          summary: `Delete ${meta.label}: ${titleText}`,
          details: target,
          status: 'PENDING',
        };
        return {
          success: false,
          confirmationRequired: true,
          target,
          message: `CONFIRMATION REQUIRED: Do NOT delete yet. Show the admin "${titleText}" (ID: ${target.id}) and ask them to confirm permanent deletion.`,
        };
      }

      if (name === 'delete_assignment') return deleteAssignmentRecord(args.id, adminUser);
      if (name === 'delete_note') return deleteNoteRecord(args.id, adminUser);
      if (name === 'delete_timetable_class') return deleteTimetableClassRecord(args.id, adminUser);
      if (name === 'delete_announcement') return deleteAnnouncementRecord(args.id, adminUser);
    }

    default:
      return { success: false, error: `Unknown backend function: "${name}"` };
  }
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: NO_CACHE_HEADERS, body: '' };
  }

  try {
    const rawAuth = event.headers?.authorization || event.headers?.Authorization || '';
    const authResult = rawAuth ? await verifySessionToken(rawAuth) : null;
    const callerUser = authResult?.user || null;
    const isAdmin = Boolean(callerUser && callerUser.role === 'admin' && callerUser.email?.toLowerCase() === ADMIN_EMAIL);

    if (!isAdmin) {
      return respond(403, {
        success: false,
        error: 'Forbidden: Only the authenticated Course Representative Admin can access the AI Assistant.',
      });
    }

    // GET: Return masked AI server status (never expose full API key)
    if (event.httpMethod === 'GET') {
      const secrets = await getServerSecrets();
      const key = secrets.geminiApiKey || '';
      const maskedKey = key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : key ? 'Configured' : '';
      return respond(200, {
        success: true,
        provider: process.env.AI_PROVIDER || 'gemini',
        model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
        configured: Boolean(key),
        source: secrets.geminiSource,
        maskedKey,
      });
    }

    if (event.httpMethod !== 'POST') {
      return respond(405, { success: false, error: 'Method Not Allowed' });
    }

    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return respond(400, { success: false, error: 'Invalid JSON request body.' });
    }

    // 1. Admin configuration / diagnostic actions
    if (body.action === 'SAVE_AI_KEY') {
      if (!body.apiKey || !String(body.apiKey).trim()) {
        return respond(400, { success: false, error: 'API key cannot be empty.' });
      }
      await updateServerSecrets({ geminiApiKey: String(body.apiKey).trim() }, callerUser);
      return respond(200, { success: true, message: 'AI API key securely stored on the server.' });
    }

    if (body.action === 'TEST_AI') {
      const secrets = await getServerSecrets();
      const probe = await generateAssistantTurn({
        apiKey: secrets.geminiApiKey,
        systemPrompt: 'Reply concisely.',
        contents: [{ role: 'user', parts: [{ text: 'Respond with: ONLINE' }] }],
        toolDeclarations: [],
      });
      const text = probe.parts.map((p) => p.text || '').join(' ').trim();
      return respond(200, { success: true, model: probe.modelUsed, reply: text || 'ONLINE' });
    }

    // 2. Explicit Confirmation Card Execution (Destructive deletions)
    if (body.confirmAction && body.confirmAction.type) {
      const act = body.confirmAction;
      const details = act.details || {};
      let result;
      switch (act.type) {
        case 'DELETE_ASSIGNMENT':
          result = await deleteAssignmentRecord(details.id, callerUser);
          break;
        case 'DELETE_NOTE':
          result = await deleteNoteRecord(details.id, callerUser);
          break;
        case 'DELETE_TIMETABLE_CLASS':
          result = await deleteTimetableClassRecord(details.id, callerUser);
          break;
        case 'DELETE_ANNOUNCEMENT':
          result = await deleteAnnouncementRecord(details.id, callerUser);
          break;
        default:
          return respond(400, { success: false, error: `Unsupported confirmation action: ${act.type}` });
      }
      return respond(result.success ? 200 : 400, {
        success: result.success,
        message: result.success
          ? `Confirmed and completed: ${act.summary}. Central database updated for all students.`
          : result.error,
        result,
        mutated: Boolean(result.success),
      });
    }

    // 3. Natural Language Conversational Turn + Real Tool Loop
    const userMessage = String(body.message || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];
    const attachment = body.attachment || null;

    if (!userMessage && !attachment) {
      return respond(400, { success: false, error: 'Message or attachment is required.' });
    }

    let uploadedAttachment = null;
    let promptWithContext = userMessage;
    if (attachment && attachment.base64Data) {
      const saved = await saveUploadedFile({
        fileName: attachment.fileName || 'uploaded_document.pdf',
        mimeType: attachment.mimeType || 'application/pdf',
        base64Data: attachment.base64Data,
        uploadedBy: callerUser.email,
      });
      if (saved.error) {
        return respond(400, { success: false, error: `Attachment error: ${saved.error}` });
      }
      uploadedAttachment = saved;
      promptWithContext = `${userMessage || 'Upload this attached file.'}\n\n[SYSTEM ATTACHMENT UPLOADED TO FILE STORE: fileId="${saved.fileId}", fileName="${saved.fileName}", fileSize="${saved.fileSize}". Pass fileId="${saved.fileId}" if calling upload_note.]`;
    }

    const secrets = await getServerSecrets();
    const todayContext = `Current server date/time (UTC): ${new Date().toISOString()}`;
    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n${todayContext}`;

    const contents = buildGeminiContents(history.slice(-14), promptWithContext);
    const contextMeta = {
      uploadedAttachment,
      pendingConfirmation: null,
      userConfirmedDestructive: isExplicitDeleteConfirmationText(userMessage),
    };

    const executedTools = [];
    let finalMessage = '';
    let modelUsed = '';
    const startTime = Date.now();
    const MAX_STEPS = 5;

    for (let step = 0; step < MAX_STEPS; step++) {
      // Guard against Netlify synchronous function timeout (10s)
      const remainingMs = Math.max(2500, 9000 - (Date.now() - startTime));
      const turn = await generateAssistantTurn({
        apiKey: secrets.geminiApiKey,
        systemPrompt: fullSystemPrompt,
        contents,
        toolDeclarations: TOOL_DECLARATIONS,
        preferredModel: process.env.GEMINI_MODEL || undefined,
        timeoutMs: Math.min(7000, remainingMs),
      });

      modelUsed = turn.modelUsed;
      const parts = turn.parts || [];
      const functionCalls = parts.filter((p) => p.functionCall);
      const textParts = parts.filter((p) => typeof p.text === 'string' && p.text.trim()).map((p) => p.text.trim());

      if (functionCalls.length === 0) {
        finalMessage = textParts.join('\n\n') || 'Done.';
        break;
      }

      // Append complete model parts (preserving thoughtSignature for Gemini 3.x multi-turn tools!)
      contents.push({ role: 'model', parts });

      const responseParts = [];
      for (const part of functionCalls) {
        const fc = part.functionCall;
        const toolResult = await executeToolCall(fc.name, fc.args || {}, callerUser, contextMeta);
        executedTools.push({
          tool: fc.name,
          args: fc.args || {},
          success: Boolean(toolResult?.success),
          result: toolResult,
        });
        responseParts.push({
          functionResponse: {
            name: fc.name,
            response: toolResult,
          },
        });
      }

      contents.push({ role: 'user', parts: responseParts });

      // If we hit step limit or timed close, generate a clean summary fallback
      if (step === MAX_STEPS - 1) {
        finalMessage = textParts.join('\n\n') || 'Operations processed.';
      }
    }

    const mutated = executedTools.some(
      (t) =>
        t.success &&
        !t.tool.startsWith('list_') &&
        t.tool !== 'get_platform_stats'
    );

    return respond(200, {
      success: true,
      message: finalMessage,
      modelUsed,
      executedTools,
      mutated,
      proposedAction: contextMeta.pendingConfirmation || null,
    });
  } catch (err) {
    console.error('[ai-assistant] Error:', err);
    const statusCode =
      err.code === 'AI_CONFIG_MISSING' ? 400 : err.code === 'AI_AUTH_ERROR' ? 401 : 502;
    return respond(statusCode, {
      success: false,
      error: err.message || 'AI Assistant failed to process request.',
      code: err.code || 'AI_ERROR',
    });
  }
};
