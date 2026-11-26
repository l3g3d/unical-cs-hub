// Google Gemini API Integration for UNICAL CS HUB AI Admin Assistant
import { AiProposedAction } from '../types';
import { ApiSync } from './apiSync';

export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('unical_hub_gemini_key');
    if (custom && custom.trim()) return custom.trim();
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function saveGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('unical_hub_gemini_key', key.trim());
  }
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  proposedAction?: AiProposedAction;
  executedTools?: any[];
  mutated?: boolean;
  attachmentName?: string;
}

const SYSTEM_INSTRUCTIONS = `You are "CS HUB AI ASSISTANT", the official academic AI helper for the Course Representative and Administrators of the Computer Science Department (100 Level), University of Calabar, Nigeria.

YOUR MISSION:
Help the administrator manage the departmental portal through natural conversation and voice commands. You assist the Course Representative (Divine Christopher Inyang).

THE SEVEN UNICAL 100L COURSES:
1. COS101 — Introduction to Computer Sciences
2. CSC181 — Computer Laboratory IA
3. GST111 — Communication in English
4. MTH101 — Elementary Mathematics 1
5. PHY101 — Introduction to Physics I
6. PHY107 — General Physics Practical I
7. STA111 — Basic Statistics

COMMON VENUES IN UNICAL:
- Science Lecture Theatre (SLT)
- Departmental Hardware Lab
- CES Hall A / CES Hall B
- New Science Complex Hall 1 & 2
- Physics Lecture Theatre
- Physics Laboratory 2
- Maths & Stats Hall 2
- Computing Lecture Hall

STRICT SECURITY RESTRICTIONS (DO NOT VIOLATE):
- You MUST NEVER approve or reject student ₦500 payments.
- You MUST NEVER unlock or grant access to course notes.
- You MUST NEVER change student roles, passwords, or create administrator accounts.
- If asked, state: "Security Policy: Payment verifications and role assignments cannot be performed by AI and must be processed manually in the Payment Hub."

CRITICAL ACCURACY & INTEGRITY RULES (VERY IMPORTANT):
1. ONLY PROPOSE ACTIONS THE USER SPECIFICALLY ASKED FOR. Never modify, guess, or invent anything the user did not explicitly request.
2. DO NOT FABRICATE OR GUESS MISSING DATA. If the user asks to add a class, change a venue, create an assignment, or upload notes, but DOES NOT provide the necessary details (such as course code, day, time, venue, or topic), DO NOT guess defaults! Instead, return action: null and a polite conversational message asking the user for the specific missing details.
3. FAITHFULLY EXTRACT PARAMETERS. If the user says "Change venue of COS101 to SLT", do NOT touch other courses, timetables, or notes.
4. FOR CASUAL CHAT OR QUESTIONS. If the user is just saying hello, asking a question, or discussing courses, return action: null with a helpful, friendly academic reply. Never propose an action for general conversation.

Available Action Types:
- ADD_TIMETABLE_CLASS
- EDIT_TIMETABLE_CLASS
- DELETE_TIMETABLE_CLASS
- CHANGE_VENUE
- CREATE_ASSIGNMENT
- CREATE_EVENT
- PUBLISH_ANNOUNCEMENT
- UPLOAD_NOTE
- UPDATE_COURSE_REP

Respond in this exact JSON structure when an action is confirmed:
{
  "message": "Conversational reply explaining what you have prepared...",
  "action": {
    "type": "ADD_TIMETABLE_CLASS" | "CHANGE_VENUE" | "CREATE_ASSIGNMENT" | "CREATE_EVENT" | "PUBLISH_ANNOUNCEMENT" | "UPLOAD_NOTE" | "UPDATE_COURSE_REP",
    "summary": "Brief 1-sentence description of the action",
    "details": { ...relevant fields... }
  }
}

If no specific database action is needed or details are missing, return:
{
  "message": "Your conversational reply or clarifying question here",
  "action": null
}

Always be courteous, respectful, and academic.`;

function extractCourse(input: string): { code: string; title: string } | null {
  const lower = input.toLowerCase();
  if (lower.match(/\b(cos\s*101|computer\s*science\s*101)\b/)) return { code: 'COS101', title: 'Introduction to Computer Sciences' };
  if (lower.match(/\b(csc\s*181|lab\s*181|computer\s*lab)\b/)) return { code: 'CSC181', title: 'Computer Laboratory IA' };
  if (lower.match(/\b(gst\s*111|english|communication\s*in\s*english)\b/)) return { code: 'GST111', title: 'Communication in English' };
  if (lower.match(/\b(mth\s*101|math|maths|mathematics)\b/)) return { code: 'MTH101', title: 'Elementary Mathematics 1' };
  if (lower.match(/\b(phy\s*101|physics\s*101)\b/)) return { code: 'PHY101', title: 'Introduction to Physics I' };
  if (lower.match(/\b(phy\s*107|physics\s*practical|practical\s*physics)\b/)) return { code: 'PHY107', title: 'General Physics Practical I' };
  if (lower.match(/\b(sta\s*111|statistics|stats)\b/)) return { code: 'STA111', title: 'Basic Statistics' };
  return null;
}

function extractDay(input: string): string | null {
  const lower = input.toLowerCase();
  if (lower.includes('monday')) return 'Monday';
  if (lower.includes('tuesday')) return 'Tuesday';
  if (lower.includes('wednesday')) return 'Wednesday';
  if (lower.includes('thursday')) return 'Thursday';
  if (lower.includes('friday')) return 'Friday';
  if (lower.includes('saturday')) return 'Saturday';
  return null;
}

function extractTime(input: string): { startTime: string; endTime: string } | null {
  const lower = input.toLowerCase();
  if (lower.includes('8 am') || lower.includes('8:00') || lower.includes('08:00')) return { startTime: '08:00', endTime: '10:00' };
  if (lower.includes('9 am') || lower.includes('9:00') || lower.includes('09:00')) return { startTime: '09:00', endTime: '11:00' };
  if (lower.includes('10 am') || lower.includes('10:00')) return { startTime: '10:00', endTime: '12:00' };
  if (lower.includes('11 am') || lower.includes('11:00')) return { startTime: '11:00', endTime: '13:00' };
  if (lower.includes('12 pm') || lower.includes('12:00')) return { startTime: '12:00', endTime: '14:00' };
  if (lower.includes('1 pm') || lower.includes('13:00')) return { startTime: '13:00', endTime: '15:00' };
  if (lower.includes('2 pm') || lower.includes('14:00')) return { startTime: '14:00', endTime: '16:00' };
  if (lower.includes('3 pm') || lower.includes('15:00')) return { startTime: '15:00', endTime: '17:00' };
  if (lower.includes('4 pm') || lower.includes('16:00')) return { startTime: '16:00', endTime: '18:00' };
  return null;
}

function extractVenue(input: string): string | null {
  const lower = input.toLowerCase();
  if (lower.includes('slt') || lower.includes('science lecture theatre')) return 'Science Lecture Theatre (SLT)';
  if (lower.includes('hardware lab') || lower.includes('departmental lab') || lower.includes('computer lab')) return 'Departmental Hardware Lab';
  if (lower.includes('ces b') || lower.includes('ces hall b')) return 'CES Hall B';
  if (lower.includes('ces')) return 'CES Hall A';
  if (lower.includes('complex hall 2') || lower.includes('science complex 2')) return 'New Science Complex Hall 2';
  if (lower.includes('complex') || lower.includes('science complex')) return 'New Science Complex Hall 1';
  if (lower.includes('physics lab') || lower.includes('physics laboratory')) return 'Physics Laboratory 2';
  if (lower.includes('physics theatre') || lower.includes('physics lecture')) return 'Physics Lecture Theatre';
  if (lower.includes('maths') || lower.includes('stats hall')) return 'Maths & Stats Hall 2';
  if (lower.includes('computing')) return 'Computing Lecture Hall';
  return null;
}

// Intelligent client-side rule extractor fallback if API call fails or quota reached
function fallbackRuleExtractor(input: string): { message: string; action: AiProposedAction | null } {
  const lower = input.toLowerCase();

  // Check prohibited security queries
  if (lower.includes('payment') && (lower.includes('approve') || lower.includes('verify') || lower.includes('reject') || lower.includes('unlock notes'))) {
    return {
      message: '🔒 Security Policy: As an AI assistant, I am not permitted to approve or reject student payments or bypass ₦500 departmental dues. Please navigate to the "Verify Payments" tab in your admin dashboard to manually verify the OPay transaction reference.',
      action: null
    };
  }

  // Detect Timetable / Class addition
  if ((lower.includes('add') || lower.includes('schedule')) && (lower.includes('class') || lower.includes('lecture') || lower.includes('timetable'))) {
    const course = extractCourse(input);
    const day = extractDay(input);
    const time = extractTime(input);
    const venue = extractVenue(input);

    if (!course || !day || !time) {
      const missing: string[] = [];
      if (!course) missing.push('course code (e.g. COS101)');
      if (!day) missing.push('day of the week (e.g. Monday)');
      if (!time) missing.push('lecture time (e.g. 10:00 AM)');
      return {
        message: `To add a class to the timetable accurately without making mistakes, please specify the ${missing.join(', ')}.`,
        action: null
      };
    }

    const assignedVenue = venue || 'Science Lecture Theatre (SLT)';

    return {
      message: `I have prepared a new timetable entry for ${course.code} (${course.title}) on ${day} at ${time.startTime} in ${assignedVenue}. Please review and confirm below.`,
      action: {
        id: 'act-' + Date.now(),
        type: 'ADD_TIMETABLE_CLASS',
        summary: `Add ${course.code} lecture on ${day} (${time.startTime} - ${time.endTime}) at ${assignedVenue}`,
        details: {
          courseCode: course.code,
          courseTitle: course.title,
          dayOfWeek: day,
          startTime: time.startTime,
          endTime: time.endTime,
          venue: assignedVenue,
          lecturer: course.code === 'COS101' ? 'Dr. A. E. Effiong' : 'Course Lecturer'
        },
        status: 'PENDING'
      }
    };
  }

  // Detect Venue Change
  if (lower.includes('venue') && (lower.includes('change') || lower.includes('move') || lower.includes('update') || lower.includes('relocate'))) {
    const course = extractCourse(input);
    const venue = extractVenue(input);

    if (!course || !venue) {
      return {
        message: `To change a lecture venue accurately, please specify which course (e.g. COS101) and what the new venue should be (e.g. SLT, CES Hall A).`,
        action: null
      };
    }

    return {
      message: `I have formulated a venue update for ${course.code} moving to ${venue}. Students will also see this highlighted in their venue tracker.`,
      action: {
        id: 'act-' + Date.now(),
        type: 'CHANGE_VENUE',
        summary: `Relocate ${course.code} lecture to ${venue}`,
        details: {
          courseCode: course.code,
          venueName: venue,
          changeNotice: `Notice: Lecture venue updated to ${venue}. Please be seated 10 mins early.`
        },
        status: 'PENDING'
      }
    };
  }

  // Detect Assignment creation
  if (lower.includes('assignment') && (lower.includes('create') || lower.includes('add') || lower.includes('post') || lower.includes('give') || lower.includes('new'))) {
    const course = extractCourse(input);
    let topic = '';

    const quotesMatch = input.match(/"([^"]+)"/) || input.match(/'([^']+)'/);
    if (quotesMatch && quotesMatch[1]) {
      topic = quotesMatch[1];
    } else {
      const topicMatch = input.match(/(?:titled|on|about|topic)\s+(.+?)(?:$|\.|\band\b)/i);
      if (topicMatch && topicMatch[1]) {
        topic = topicMatch[1].trim();
      }
    }

    if (!course || !topic) {
      return {
        message: `To create an assignment without mistakes, please tell me which course it is for (e.g. STA111 or COS101) and the assignment topic or title.`,
        action: null
      };
    }

    return {
      message: `I have structured an assignment for ${course.code} titled "${topic}". Please verify the deadline and instructions below.`,
      action: {
        id: 'act-' + Date.now(),
        type: 'CREATE_ASSIGNMENT',
        summary: `Create ${course.code} Assignment: "${topic}"`,
        details: {
          courseCode: course.code,
          title: topic,
          instructions: 'Solve all questions clearly on clean sheets or type in Word/PDF format. Submit your assignment file through the CS HUB portal before the deadline.',
          dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0] + 'T17:00',
          maxScore: 30
        },
        status: 'PENDING'
      }
    };
  }

  // Detect Announcement / Event
  if (lower.includes('announcement') && (lower.includes('publish') || lower.includes('post') || lower.includes('broadcast') || lower.includes('make') || lower.includes('send'))) {
    let content = '';
    const match = input.match(/(?:announcement|broadcast)\s*(?:that|saying|:)?\s+(.+)$/i);
    if (match && match[1] && match[1].length > 5) {
      content = match[1].trim();
    }

    if (!content) {
      return {
        message: `What announcement would you like to broadcast to students? Please provide the title and message details.`,
        action: null
      };
    }

    const title = content.length > 50 ? content.slice(0, 47) + '...' : content;

    return {
      message: `I have drafted an announcement for you to publish to all 100 level students.`,
      action: {
        id: 'act-' + Date.now(),
        type: 'PUBLISH_ANNOUNCEMENT',
        summary: `Publish announcement: "${title}"`,
        details: {
          title,
          content,
          priority: 'NORMAL',
          targetLevel: '100'
        },
        status: 'PENDING'
      }
    };
  }

  // Detect Lecture Note upload
  if (lower.includes('note') && (lower.includes('upload') || lower.includes('add') || lower.includes('post') || lower.includes('create'))) {
    const course = extractCourse(input);
    let topic = '';

    const quotesMatch = input.match(/"([^"]+)"/) || input.match(/'([^']+)'/);
    if (quotesMatch && quotesMatch[1]) {
      topic = quotesMatch[1];
    } else {
      const topicMatch = input.match(/(?:titled|on|about|topic)\s+(.+?)(?:$|\.|\band\b)/i);
      if (topicMatch && topicMatch[1]) {
        topic = topicMatch[1].trim();
      }
    }

    if (!course || !topic) {
      return {
        message: `To upload course notes accurately, please tell me which course it is for (e.g. COS101) and what the lecture topic is.`,
        action: null
      };
    }

    let lectureNumber = 1;
    const lecMatch = lower.match(/lecture\s*(\d+)/i) || lower.match(/lec\s*(\d+)/i);
    if (lecMatch && lecMatch[1]) {
      lectureNumber = parseInt(lecMatch[1], 10);
    }

    return {
      message: `I have prepared a new course note entry for ${course.code} (Lecture ${lectureNumber}: "${topic}"). Please review and confirm upload below.`,
      action: {
        id: 'act-' + Date.now(),
        type: 'UPLOAD_NOTE',
        summary: `Upload Note for ${course.code}: Lecture ${lectureNumber} - ${topic}`,
        details: {
          courseCode: course.code,
          lectureNumber,
          topic,
          description: `Comprehensive lecture notes covering ${topic}.`,
          fileName: `${course.code}_Lecture${lectureNumber}_${topic.replace(/\s+/g, '_')}.pdf`,
          fileSize: '1.4 MB',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        status: 'PENDING'
      }
    };
  }

  // Detect Course Rep info update
  if (lower.includes('course rep') || lower.includes('representative') || (lower.includes('rep') && (lower.includes('phone') || lower.includes('email') || lower.includes('contact')))) {
    const phoneMatch = input.match(/0\d{10}/);
    const emailMatch = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    if (!phoneMatch && !emailMatch) {
      return {
        message: `What information for the Course Representative would you like to update? Please provide a new 11-digit phone number or email address.`,
        action: null
      };
    }

    return {
      message: `I have formulated an update for the official Course Representative card. Please review the details below.`,
      action: {
        id: 'act-' + Date.now(),
        type: 'UPDATE_COURSE_REP',
        summary: `Update Course Representative official profile information`,
        details: {
          fullName: 'Divine Christopher Inyang',
          phone: phoneMatch ? phoneMatch[0] : '08139651907',
          email: emailMatch ? emailMatch[0] : 'divineinyang636@gmail.com',
        },
        status: 'PENDING'
      }
    };
  }

  // Conversational response
  if (lower.includes('timetable') || lower.includes('schedule') || lower.includes('organize') || lower.includes('organise')) {
    return {
      message: `I would be glad to help you manage the weekly timetable! Tell me which course you want to schedule and include the day, time, and venue.\n\nExample:\n"Add COS101 on Monday at 10 am in SLT"`,
      action: null
    };
  }

  return {
    message: `Hello Course Rep Divine! I am your CS HUB AI Assistant. I can help you accurately manage:\n• Timetable classes (specify course, day, time, venue)\n• Lecture venue relocations\n• Course assignments & lecture notes\n• Departmental announcements\n\nTell me what you need done and I will execute it precisely without guessing.`,
    action: null
  };
}

export async function askGeminiAssistant(
  prompt: string,
  history: ChatMessage[] = [],
  attachment?: { fileName: string; mimeType: string; base64Data: string } | null
): Promise<{
  message: string;
  action: AiProposedAction | null;
  executedTools?: any[];
  mutated?: boolean;
}> {
  // 1. Primary: Authenticated backend AI assistant endpoint (Native Gemini 3.1 Function Calling & Central DB Execution)
  try {
    const formattedHistory = history.slice(-10).map((h) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      text: h.text,
    }));

    const res = await ApiSync.callAiAssistant({
      message: prompt,
      history: formattedHistory,
      attachment,
    });

    if (res && res.success && res.message) {
      let actionObj: AiProposedAction | null = null;
      if (res.proposedAction && res.proposedAction.type) {
        actionObj = {
          id: res.proposedAction.id || 'act-' + Date.now(),
          type: res.proposedAction.type,
          summary: res.proposedAction.summary || 'Confirmation required',
          details: res.proposedAction.details || {},
          status: 'PENDING',
        };
      }
      return {
        message: res.message,
        action: actionObj,
        executedTools: res.executedTools || [],
        mutated: Boolean(res.mutated),
      };
    }
    if (res && !res.success && res.error) {
      console.warn('[Gemini Assistant] Backend returned error:', res.error);
    }
  } catch (error) {
    console.warn('[Gemini Assistant] Network call failed, falling back to local extractor:', error);
  }

  // 2. Intelligent Client-Side NLP Rule Extractor Fallback
  const fallback = fallbackRuleExtractor(prompt);
  return {
    message: fallback.message,
    action: fallback.action,
    executedTools: [],
    mutated: false,
  };
}
