// Google Gemini API Integration for UNICAL CS HUB AI Admin Assistant
import { AiProposedAction } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  proposedAction?: AiProposedAction;
}

const SYSTEM_INSTRUCTIONS = `You are "CS HUB AI ASSISTANT", the official academic AI helper for the Course Representative and Administrators of the Computer Science Department (100 Level), University of Calabar, Nigeria.

YOUR MISSION:
Help the administrator manage the departmental portal through natural conversation and voice commands.

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

STRICT SECURITY RESTRICTIONS (DO NOT VIOLATE):
- You MUST NEVER approve or reject student ₦500 payments.
- You MUST NEVER unlock or grant access to course notes.
- You MUST NEVER change student roles, passwords, or create administrator accounts.
- If asked, state: "Security Policy: Payment verifications and role assignments cannot be performed by AI and must be processed manually in the Payment Hub."

WHEN EXECUTING ACTIONS:
You do NOT directly modify data silently. Instead, you extract parameters and return a structured JSON action proposal for the administrator to review and confirm with a preview card.

Available Action Types:
- ADD_TIMETABLE_CLASS
- EDIT_TIMETABLE_CLASS
- DELETE_TIMETABLE_CLASS
- CHANGE_VENUE
- CREATE_ASSIGNMENT
- CREATE_EVENT
- PUBLISH_ANNOUNCEMENT

Respond in this exact JSON structure when an action is detected:
{
  "message": "Conversational reply explaining what you have prepared...",
  "action": {
    "type": "ADD_TIMETABLE_CLASS" | "CHANGE_VENUE" | "CREATE_ASSIGNMENT" | "CREATE_EVENT" | "PUBLISH_ANNOUNCEMENT",
    "summary": "Brief 1-sentence description of the action",
    "details": { ...relevant fields... }
  }
}

If no specific database action is needed (e.g. general conversation, asking for clarification, greeting, answering questions about the 7 courses), return:
{
  "message": "Your conversational reply here",
  "action": null
}

Always be courteous, respectful, and academic.`;

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
  if ((lower.includes('add') || lower.includes('schedule')) && (lower.includes('class') || lower.includes('lecture') || lower.includes('timetable') || lower.match(/\b(cos101|csc181|gst111|mth101|phy101|phy107|sta111)\b/))) {
    let courseCode = 'COS101';
    let courseTitle = 'Introduction to Computer Sciences';
    if (lower.includes('csc181')) { courseCode = 'CSC181'; courseTitle = 'Computer Laboratory IA'; }
    else if (lower.includes('gst111')) { courseCode = 'GST111'; courseTitle = 'Communication in English'; }
    else if (lower.includes('mth101')) { courseCode = 'MTH101'; courseTitle = 'Elementary Mathematics 1'; }
    else if (lower.includes('phy101')) { courseCode = 'PHY101'; courseTitle = 'Introduction to Physics I'; }
    else if (lower.includes('phy107')) { courseCode = 'PHY107'; courseTitle = 'General Physics Practical I'; }
    else if (lower.includes('sta111')) { courseCode = 'STA111'; courseTitle = 'Basic Statistics'; }

    let day = 'Monday';
    if (lower.includes('tuesday')) day = 'Tuesday';
    else if (lower.includes('wednesday')) day = 'Wednesday';
    else if (lower.includes('thursday')) day = 'Thursday';
    else if (lower.includes('friday')) day = 'Friday';

    let startTime = '10:00';
    let endTime = '12:00';
    if (lower.includes('8 am') || lower.includes('8:00') || lower.includes('08:00')) { startTime = '08:00'; endTime = '10:00'; }
    else if (lower.includes('9 am') || lower.includes('9:00') || lower.includes('09:00')) { startTime = '09:00'; endTime = '11:00'; }
    else if (lower.includes('10 am') || lower.includes('10:00')) { startTime = '10:00'; endTime = '12:00'; }
    else if (lower.includes('11 am') || lower.includes('11:00')) { startTime = '11:00'; endTime = '13:00'; }
    else if (lower.includes('12 pm') || lower.includes('12:00')) { startTime = '12:00'; endTime = '14:00'; }
    else if (lower.includes('1 pm') || lower.includes('13:00')) { startTime = '13:00'; endTime = '15:00'; }
    else if (lower.includes('2 pm') || lower.includes('14:00')) { startTime = '14:00'; endTime = '16:00'; }

    let venue = 'Science Lecture Theatre (SLT)';
    if (lower.includes('lab') || lower.includes('laboratory')) venue = 'Departmental Hardware Lab';
    else if (lower.includes('ces')) venue = 'CES Hall A';
    else if (lower.includes('science complex')) venue = 'New Science Complex Hall 1';
    else if (lower.includes('physics theatre')) venue = 'Physics Lecture Theatre';
    else if (lower.includes('computing lecture hall') || lower.includes('computing hall')) venue = 'Computing Lecture Hall';

    return {
      message: `I have prepared a new timetable entry for ${courseCode} (${courseTitle}) on ${day} at ${startTime}. Please review and confirm below.`,
      action: {
        id: 'act-' + Date.now(),
        type: 'ADD_TIMETABLE_CLASS',
        summary: `Add ${courseCode} lecture on ${day} (${startTime} - ${endTime}) at ${venue}`,
        details: {
          courseCode,
          courseTitle,
          dayOfWeek: day,
          startTime,
          endTime,
          venue,
          lecturer: courseCode === 'COS101' ? 'Dr. A. E. Effiong' : 'Course Lecturer'
        },
        status: 'PENDING'
      }
    };
  }

  // Detect Venue Change
  if (lower.includes('venue') && (lower.includes('change') || lower.includes('move') || lower.includes('update'))) {
    let courseCode = 'COS101';
    if (lower.includes('csc181')) courseCode = 'CSC181';
    else if (lower.includes('gst111')) courseCode = 'GST111';
    else if (lower.includes('mth101')) courseCode = 'MTH101';
    else if (lower.includes('phy101')) courseCode = 'PHY101';
    else if (lower.includes('phy107')) courseCode = 'PHY107';
    else if (lower.includes('sta111')) courseCode = 'STA111';

    let venue = 'Computing Lecture Hall';
    if (lower.includes('slt')) venue = 'Science Lecture Theatre (SLT)';
    else if (lower.includes('ces')) venue = 'CES Hall A';
    else if (lower.includes('complex')) venue = 'New Science Complex Hall 1';

    return {
      message: `I have formulated a venue update for ${courseCode} moving to ${venue}. Students will also see this highlighted in their venue tracker.`,
      action: {
        id: 'act-' + Date.now(),
        type: 'CHANGE_VENUE',
        summary: `Relocate ${courseCode} lecture to ${venue}`,
        details: {
          courseCode,
          venueName: venue,
          changeNotice: `Notice: Lecture venue updated to ${venue}. Please be seated 10 mins early.`
        },
        status: 'PENDING'
      }
    };
  }

  // Detect Assignment creation
  if (lower.includes('assignment') && (lower.includes('create') || lower.includes('add') || lower.includes('post') || lower.includes('give'))) {
    let courseCode = 'STA111';
    if (lower.includes('cos101')) courseCode = 'COS101';
    else if (lower.includes('csc181')) courseCode = 'CSC181';
    else if (lower.includes('gst111')) courseCode = 'GST111';
    else if (lower.includes('mth101')) courseCode = 'MTH101';
    else if (lower.includes('phy101')) courseCode = 'PHY101';
    else if (lower.includes('phy107')) courseCode = 'PHY107';

    const topic = lower.includes('dispersion')
      ? 'Measures of Dispersion and Standard Deviation'
      : lower.includes('binary')
      ? 'Binary Arithmetic and Logic Gates'
      : 'Continuous Assessment Assignment 1';

    return {
      message: `I have structured an assignment for ${courseCode} titled "${topic}". Please verify the deadline and instructions below.`,
      action: {
        id: 'act-' + Date.now(),
        type: 'CREATE_ASSIGNMENT',
        summary: `Create ${courseCode} Assignment: "${topic}"`,
        details: {
          courseCode,
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
  if (lower.includes('announcement') || lower.includes('event') || lower.includes('meeting')) {
    const title = lower.includes('meeting')
      ? 'Computer Science Departmental Meeting (100 Level)'
      : 'Important Departmental Notice for 100 Level Students';

    return {
      message: `I have drafted an announcement for you to publish to all 100 level students.`,
      action: {
        id: 'act-' + Date.now(),
        type: 'PUBLISH_ANNOUNCEMENT',
        summary: `Publish announcement: "${title}"`,
        details: {
          title,
          content: 'All 100 level students are required to take note of this departmental update. Ensure you check your timetable and course notes regularly.',
          priority: 'NORMAL',
          targetLevel: '100'
        },
        status: 'PENDING'
      }
    };
  }

  // Conversational response
  if (lower.includes('organise') || lower.includes('organize') || lower.includes('timetable')) {
    return {
      message: `I would be glad to help you organize next week's timetable! Which course would you like to schedule first? We have:\n\n• COS101 (Intro to CS)\n• CSC181 (Computer Lab)\n• GST111 (English)\n• MTH101 (Mathematics)\n• PHY101 (Physics)\n• PHY107 (Physics Practical)\n• STA111 (Statistics)\n\nJust tell me: "Add [Course] on [Day] at [Time] in [Venue]" or speak it via the microphone!`,
      action: null
    };
  }

  return {
    message: `Hello Course Rep! I am your CS HUB AI Assistant. You can speak or type commands to:\n• Add or modify weekly timetable lectures\n• Post continuous assessment assignments\n• Change or alert students about lecture venues\n• Broadcast departmental announcements\n\nHow can I help you today?`,
    action: null
  };
}

export async function askGeminiAssistant(
  prompt: string,
  history: ChatMessage[] = []
): Promise<{ message: string; action: AiProposedAction | null }> {
  try {
    // If no key or mock key, use rule-based extractor
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your-key')) {
      return fallbackRuleExtractor(prompt);
    }

    // Prepare conversational payload
    const formattedHistory = history.slice(-6).map((h) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTIONS }]
          },
          contents: [
            ...formattedHistory,
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          }
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini API HTTP Error, falling back to local NLP heuristics:', response.status);
      return fallbackRuleExtractor(prompt);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return fallbackRuleExtractor(prompt);
    }

    try {
      const parsed = JSON.parse(candidateText);
      let actionObj: AiProposedAction | null = null;
      if (parsed.action && parsed.action.type) {
        actionObj = {
          id: 'act-' + Date.now(),
          type: parsed.action.type,
          summary: parsed.action.summary || 'Proposed action',
          details: parsed.action.details || {},
          status: 'PENDING'
        };
      }
      return {
        message: parsed.message || 'Action formulated. Please review and confirm below.',
        action: actionObj
      };
    } catch {
      return {
        message: candidateText,
        action: null
      };
    }
  } catch (error) {
    console.warn('Gemini Assistant call failed, using intelligent fallback:', error);
    return fallbackRuleExtractor(prompt);
  }
}
