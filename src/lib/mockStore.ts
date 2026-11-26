// UNICAL CS HUB Data Store & Persistence Engine
// Supports local reactive persistence with fallback for Supabase

import {
  UserProfile,
  Course,
  CourseNote,
  TimetableEntry,
  LectureVenue,
  Assignment,
  AssignmentSubmission,
  PaymentRecord,
  Complaint,
  Announcement,
  CourseRepresentative,
  AuditLog,
  AppNotification,
  AiProposedAction,
} from '../types';
import { ApiSync } from './apiSync';

const INITIAL_COURSES: Course[] = [
  {
    code: 'COS101',
    title: 'Introduction to Computer Sciences',
    creditUnits: 3,
    lecturer: 'Dr. A. E. Effiong',
    description: 'Foundations of computing, binary arithmetic, computer architecture, algorithms, and computing history.'
  },
  {
    code: 'CSC181',
    title: 'Computer Laboratory IA',
    creditUnits: 2,
    lecturer: 'Mr. B. O. Okon',
    description: 'Practical hands-on computing laboratory, operating system utilities, basic CLI, and typing proficiencies.'
  },
  {
    code: 'GST111',
    title: 'Communication in English',
    creditUnits: 2,
    lecturer: 'Prof. M. U. Bassey',
    description: 'Grammar, sentence structures, essay writing, comprehension, and academic communication skills.'
  },
  {
    code: 'MTH101',
    title: 'Elementary Mathematics 1',
    creditUnits: 3,
    lecturer: 'Dr. P. N. Asuquo',
    description: 'Sets, relations, real number system, algebraic expressions, trigonometry, and analytical geometry.'
  },
  {
    code: 'PHY101',
    title: 'Introduction to Physics I',
    creditUnits: 3,
    lecturer: 'Dr. E. O. Akpan',
    description: 'Mechanics, properties of matter, thermal physics, waves, and fundamental harmonic oscillations.'
  },
  {
    code: 'PHY107',
    title: 'General Physics Practical I',
    creditUnits: 1,
    lecturer: 'Engr. K. I. Edet',
    description: 'Laboratory experiments in mechanics, heat, optics, and experimental uncertainty measurements.'
  },
  {
    code: 'STA111',
    title: 'Basic Statistics',
    creditUnits: 2,
    lecturer: 'Dr. Mrs. H. O. Archibong',
    description: 'Frequency distributions, measures of central tendency, dispersion, probability, and hypothesis testing.'
  }
];

const INITIAL_COURSE_REP: CourseRepresentative = {
  id: 'rep-01',
  fullName: 'Divine Christopher Inyang',
  position: '100 Level Course Representative',
  department: 'Computer Science Department, UNICAL',
  level: '100 Level',
  phone: '08139651907',
  email: 'divineinyang636@gmail.com',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  updatedAt: new Date().toISOString()
};

const INITIAL_NOTES: CourseNote[] = [
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
    uploadedBy: 'Course Rep Divine'
  },
  {
    id: 'note-cos-02',
    courseCode: 'COS101',
    lectureNumber: 2,
    topic: 'Binary Representation & Logic Circuits',
    description: 'Number bases conversion (Binary, Octal, Hexadecimal), two\'s complement, logic gates (AND, OR, NOT, NAND, NOR, XOR).',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'COS101_Lecture2_Binary_Arithmetic.pdf',
    fileSize: '2.1 MB',
    uploadDate: '2026-11-15T14:30:00Z',
    uploadedBy: 'Course Rep Divine'
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
    uploadedBy: 'Course Rep Divine'
  },
  {
    id: 'note-mth-01',
    courseCode: 'MTH101',
    lectureNumber: 1,
    topic: 'Set Theory & Mathematical Induction',
    description: 'Venn diagrams, set operations, De Morgan\'s laws, and principle of mathematical induction with solved examples.',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'MTH101_Set_Theory_Module1.pdf',
    fileSize: '3.2 MB',
    uploadDate: '2026-11-08T11:00:00Z',
    uploadedBy: 'Course Rep Divine'
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
    uploadedBy: 'Course Rep Divine'
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
    uploadedBy: 'Course Rep Divine'
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
    uploadedBy: 'Course Rep Divine'
  }
];

const INITIAL_TIMETABLE: TimetableEntry[] = [
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
    academicYear: '2026/2027'
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
    academicYear: '2026/2027'
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
    academicYear: '2026/2027'
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
    academicYear: '2026/2027'
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
    academicYear: '2026/2027'
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
    academicYear: '2026/2027'
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
    academicYear: '2026/2027'
  }
];

const INITIAL_VENUES: LectureVenue[] = [
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
  }
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    courseCode: 'COS101',
    title: 'Assignment 1: Number Systems Conversion & Logic Circuit Simulation',
    instructions: '1. Convert (11010110.101)_2 to decimal, octal, and hexadecimal.\n2. Design a circuit that implements a 2-bit full adder using only NAND gates.\n3. Type your solution or clearly write and scan to PDF.',
    dueDate: '2026-11-28T23:59:00Z',
    maxScore: 20,
    createdBy: 'Dr. A. E. Effiong',
    createdAt: '2026-11-18T10:00:00Z'
  },
  {
    id: 'assign-2',
    courseCode: 'STA111',
    title: 'Assignment 1: Calculation of Mean, Variance & Standard Deviation',
    instructions: 'Given the frequency table of test scores uploaded in lecture note 1, calculate the Mean, Variance, Standard Deviation, and semi-interquartile range. Show all step-by-step working.',
    dueDate: '2026-11-30T17:00:00Z',
    maxScore: 15,
    createdBy: 'Dr. Mrs. H. O. Archibong',
    createdAt: '2026-11-19T14:00:00Z'
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Welcome to Department of Computer Science (100 Level)',
    content: 'All fresh 100 level students are warmly welcomed to the 2026/2027 Academic Session. Please ensure you make your ₦500 departmental access payment via OPay and submit your transaction reference to unlock all course lecture notes and materials.',
    priority: 'URGENT',
    targetLevel: '100',
    authorName: 'Divine Christopher Inyang (Course Rep)',
    createdAt: '2026-11-15T08:00:00Z'
  },
  {
    id: 'ann-2',
    title: 'CSC181 Practical Lab Guidelines & Software Setup',
    content: 'Please come to the Departmental Hardware Lab with your student ID card this Wednesday. Check the CSC181 syllabus inside the course notes tab.',
    priority: 'NORMAL',
    targetLevel: '100',
    authorName: 'Course Rep Desk',
    createdAt: '2026-11-18T12:00:00Z'
  }
];

const INITIAL_PAYMENTS: PaymentRecord[] = [];

const INITIAL_COMPLAINTS: Complaint[] = [];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    adminName: 'Divine Christopher Inyang',
    action: 'PORTAL_INITIALIZATION',
    details: 'Initialized UNICAL CS HUB portal with 7 initial 100L courses and official timetable.',
    timestamp: '2026-11-15T08:00:00Z'
  }
];

// Sanitizers to eliminate fake / mock demo accounts
const sanitizePayments = (list: PaymentRecord[]): PaymentRecord[] => {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (p) =>
      p &&
      p.studentId !== 'student-emeka' &&
      p.studentId !== 'student-blessing' &&
      p.id !== 'pay-01' &&
      p.id !== 'pay-02'
  );
};

const sanitizeComplaints = (list: Complaint[]): Complaint[] => {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (c) => c && c.id !== 'comp-1' && c.studentId !== 'student-blessing'
  );
};

const sanitizeAuditLogs = (list: AuditLog[]): AuditLog[] => {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (l) => l && !l.details.includes('Emeka Christian Okon') && !l.details.includes('Blessing Effiong Bassey')
  );
};

// Helper to get or set localStorage
function getLocal<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem('unical_hub_' + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('unical_hub_' + key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

export class MockStore {
  // Store collections
  private static courses: Course[] = getLocal('courses', INITIAL_COURSES);
  private static courseRep: CourseRepresentative = getLocal('courseRep', INITIAL_COURSE_REP);
  private static notes: CourseNote[] = getLocal('notes', INITIAL_NOTES);
  private static timetable: TimetableEntry[] = getLocal('timetable', INITIAL_TIMETABLE);
  private static venues: LectureVenue[] = getLocal('venues', INITIAL_VENUES);
  private static assignments: Assignment[] = getLocal('assignments', INITIAL_ASSIGNMENTS);
  private static submissions: AssignmentSubmission[] = getLocal('submissions', []);
  private static payments: PaymentRecord[] = sanitizePayments(getLocal('payments', INITIAL_PAYMENTS));
  private static complaints: Complaint[] = sanitizeComplaints(getLocal('complaints', INITIAL_COMPLAINTS));
  private static announcements: Announcement[] = getLocal('announcements', INITIAL_ANNOUNCEMENTS);
  private static auditLogs: AuditLog[] = sanitizeAuditLogs(getLocal('auditLogs', INITIAL_AUDIT_LOGS));
  private static notifications: AppNotification[] = getLocal('notifications', [
    {
      id: 'notif-1',
      title: 'Welcome to UNICAL CS HUB',
      message: 'Explore your 100 level timetable, assignments and course notes.',
      type: 'system',
      isRead: false,
      link: '/dashboard',
      createdAt: new Date().toISOString()
    }
  ]);

  // Reactive listeners
  private static listeners: Set<() => void> = new Set();

  static subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private static notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Central Cloud Synchronization Engine ---
  static async initCloudSync() {
    try {
      const remote = await ApiSync.fetchHubState();
      if (!remote || typeof remote !== 'object') return;

      let changed = false;
      if (Array.isArray(remote.courses)) {
        this.courses = remote.courses;
        setLocal('courses', this.courses);
        changed = true;
      }
      if (Array.isArray(remote.notes)) {
        this.notes = remote.notes;
        setLocal('notes', this.notes);
        changed = true;
      }
      if (Array.isArray(remote.timetable)) {
        this.timetable = remote.timetable;
        setLocal('timetable', this.timetable);
        changed = true;
      }
      if (Array.isArray(remote.venues)) {
        this.venues = remote.venues;
        setLocal('venues', this.venues);
        changed = true;
      }
      if (Array.isArray(remote.assignments)) {
        this.assignments = remote.assignments;
        setLocal('assignments', this.assignments);
        changed = true;
      }
      if (Array.isArray(remote.submissions)) {
        this.submissions = remote.submissions;
        setLocal('submissions', this.submissions);
        changed = true;
      }
      if (Array.isArray(remote.payments)) {
        this.payments = sanitizePayments(remote.payments);
        setLocal('payments', this.payments);
        changed = true;
      }
      if (Array.isArray(remote.complaints)) {
        this.complaints = sanitizeComplaints(remote.complaints);
        setLocal('complaints', this.complaints);
        changed = true;
      }
      if (Array.isArray(remote.announcements)) {
        this.announcements = remote.announcements;
        setLocal('announcements', this.announcements);
        changed = true;
      }
      if (remote.courseRep && remote.courseRep.fullName) {
        this.courseRep = remote.courseRep;
        setLocal('courseRep', this.courseRep);
        changed = true;
      }
      if (Array.isArray(remote.auditLogs)) {
        this.auditLogs = sanitizeAuditLogs(remote.auditLogs);
        setLocal('auditLogs', this.auditLogs);
        changed = true;
      }

      if (changed) {
        this.notify();
      }
    } catch (err) {
      console.warn('[MockStore] Cloud sync notice:', err);
    }
  }

  static async forceSync() {
    return this.initCloudSync();
  }

  // --- Getters ---
  static getCourses(): Course[] {
    return this.courses;
  }

  static getCourseRep(): CourseRepresentative {
    return this.courseRep;
  }

  static getNotes(): CourseNote[] {
    return this.notes;
  }

  static getTimetable(): TimetableEntry[] {
    return this.timetable;
  }

  static getVenues(): LectureVenue[] {
    return this.venues;
  }

  static getAssignments(): Assignment[] {
    return this.assignments;
  }

  static getSubmissions(): AssignmentSubmission[] {
    return this.submissions;
  }

  static getPayments(): PaymentRecord[] {
    return this.payments;
  }

  static getComplaints(): Complaint[] {
    return this.complaints;
  }

  static getAnnouncements(): Announcement[] {
    return this.announcements;
  }

  static getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  static getNotifications(): AppNotification[] {
    return this.notifications;
  }

  // --- Mutators ---
  static updateCourseRep(updates: Partial<CourseRepresentative>, adminName: string) {
    this.courseRep = { ...this.courseRep, ...updates, updatedAt: new Date().toISOString() };
    setLocal('courseRep', this.courseRep);
    ApiSync.syncKeyRemotely('courseRep', this.courseRep);
    this.logAction(adminName, 'UPDATE_COURSE_REP', `Updated course representative details.`);
    this.notify();
  }

  static addNote(note: Omit<CourseNote, 'id' | 'uploadDate'>, adminName: string): CourseNote {
    const newNote: CourseNote = {
      ...note,
      id: 'note-' + Date.now(),
      uploadDate: new Date().toISOString(),
      uploadedBy: adminName
    };
    this.notes = [newNote, ...this.notes];
    setLocal('notes', this.notes);
    ApiSync.syncKeyRemotely('notes', this.notes);
    this.logAction(adminName, 'UPLOAD_NOTE', `Uploaded note for ${note.courseCode}: Lecture ${note.lectureNumber} - ${note.topic}`);
    this.broadcastNotification({
      title: `New Note: ${note.courseCode}`,
      message: `Lecture ${note.lectureNumber}: "${note.topic}" has been uploaded.`,
      type: 'notes',
      link: `/notes/${note.courseCode}`
    });
    this.notify();
    return newNote;
  }

  static deleteNote(id: string, adminName: string) {
    const note = this.notes.find((n) => n.id === id);
    this.notes = this.notes.filter((n) => n.id !== id);
    setLocal('notes', this.notes);
    ApiSync.syncKeyRemotely('notes', this.notes);
    if (note) {
      this.logAction(adminName, 'DELETE_NOTE', `Deleted note ${note.courseCode}: Lecture ${note.lectureNumber}`);
    }
    this.notify();
  }

  static addTimetableEntry(entry: Omit<TimetableEntry, 'id'>, adminName: string): TimetableEntry {
    const newEntry: TimetableEntry = {
      ...entry,
      id: 'tt-' + Date.now()
    };
    this.timetable = [...this.timetable, newEntry];
    setLocal('timetable', this.timetable);
    ApiSync.syncKeyRemotely('timetable', this.timetable);
    this.logAction(adminName, 'ADD_TIMETABLE_CLASS', `Added ${entry.courseCode} on ${entry.dayOfWeek} at ${entry.startTime} (${entry.venue})`);
    this.broadcastNotification({
      title: `Timetable Updated: ${entry.courseCode}`,
      message: `${entry.courseCode} scheduled for ${entry.dayOfWeek} at ${entry.startTime} in ${entry.venue}.`,
      type: 'timetable',
      link: '/timetable'
    });
    this.notify();
    return newEntry;
  }

  static editTimetableEntry(id: string, updates: Partial<TimetableEntry>, adminName: string) {
    this.timetable = this.timetable.map((tt) => (tt.id === id ? { ...tt, ...updates } : tt));
    setLocal('timetable', this.timetable);
    ApiSync.syncKeyRemotely('timetable', this.timetable);
    this.logAction(adminName, 'EDIT_TIMETABLE_CLASS', `Edited timetable entry id: ${id}`);
    this.notify();
  }

  static deleteTimetableEntry(id: string, adminName: string) {
    this.timetable = this.timetable.filter((tt) => tt.id !== id);
    setLocal('timetable', this.timetable);
    ApiSync.syncKeyRemotely('timetable', this.timetable);
    this.logAction(adminName, 'DELETE_TIMETABLE_CLASS', `Deleted timetable class id: ${id}`);
    this.notify();
  }

  static updateVenue(courseCode: string, venueName: string, changeNotice: string, adminName: string) {
    let found = false;
    this.venues = this.venues.map((v) => {
      if (v.courseCode === courseCode) {
        found = true;
        return {
          ...v,
          venueName,
          isChanged: true,
          changeNotice
        };
      }
      return v;
    });

    if (!found) {
      this.venues.push({
        id: 'v-' + Date.now(),
        courseCode,
        courseName: courseCode,
        venueName,
        dayTime: 'Announced weekly',
        isChanged: true,
        changeNotice
      });
    }

    setLocal('venues', this.venues);
    ApiSync.syncKeyRemotely('venues', this.venues);
    this.logAction(adminName, 'UPDATE_VENUE', `Changed venue for ${courseCode} to ${venueName}`);
    this.broadcastNotification({
      title: `Venue Alert: ${courseCode}`,
      message: `Lecture venue changed to ${venueName}. ${changeNotice || ''}`,
      type: 'venue',
      link: '/venues'
    });
    this.notify();
  }

  static addAssignment(assign: Omit<Assignment, 'id' | 'createdAt'>, adminName: string): Assignment {
    const newAssign: Assignment = {
      ...assign,
      id: 'assign-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.assignments = [newAssign, ...this.assignments];
    setLocal('assignments', this.assignments);
    ApiSync.syncKeyRemotely('assignments', this.assignments);
    this.logAction(adminName, 'CREATE_ASSIGNMENT', `Created assignment for ${assign.courseCode}: "${assign.title}"`);
    this.broadcastNotification({
      title: `New Assignment: ${assign.courseCode}`,
      message: `"${assign.title}" posted. Due: ${new Date(assign.dueDate).toLocaleDateString()}.`,
      type: 'assignment',
      link: '/assignments'
    });
    this.notify();
    return newAssign;
  }

  static deleteAssignment(id: string, adminName: string) {
    this.assignments = this.assignments.filter((a) => a.id !== id);
    setLocal('assignments', this.assignments);
    ApiSync.syncKeyRemotely('assignments', this.assignments);
    this.logAction(adminName, 'DELETE_ASSIGNMENT', `Deleted assignment id ${id}`);
    this.notify();
  }

  static submitAssignment(submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>): AssignmentSubmission {
    const newSub: AssignmentSubmission = {
      ...submission,
      id: 'sub-' + Date.now(),
      submittedAt: new Date().toISOString()
    };
    // Replace any previous submission by this student for this assignment
    this.submissions = [
      newSub,
      ...this.submissions.filter((s) => !(s.assignmentId === submission.assignmentId && s.studentId === submission.studentId))
    ];
    setLocal('submissions', this.submissions);
    ApiSync.syncKeyRemotely('submissions', this.submissions);
    this.notify();
    return newSub;
  }

  static gradeSubmission(id: string, grade: number, feedback: string, adminName: string) {
    this.submissions = this.submissions.map((s) => (s.id === id ? { ...s, grade, feedback } : s));
    setLocal('submissions', this.submissions);
    ApiSync.syncKeyRemotely('submissions', this.submissions);
    this.logAction(adminName, 'GRADE_SUBMISSION', `Graded submission id ${id} with score ${grade}`);
    this.notify();
  }

  // Payments (₦500 OPay Transfer)
  static submitPayment(record: Omit<PaymentRecord, 'id' | 'status' | 'createdAt'>): PaymentRecord {
    const newPay: PaymentRecord = {
      ...record,
      id: 'pay-' + Date.now(),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    this.payments = [newPay, ...this.payments];
    setLocal('payments', this.payments);
    ApiSync.submitPaymentRemotely(newPay);
    this.notify();
    return newPay;
  }

  static approvePayment(paymentId: string, adminName: string): PaymentRecord | null {
    let approvedRecord: PaymentRecord | null = null;
    this.payments = this.payments.map((p) => {
      if (p.id === paymentId) {
        approvedRecord = {
          ...p,
          status: 'APPROVED',
          approvedBy: adminName,
          approvedAt: new Date().toISOString()
        };
        return approvedRecord;
      }
      return p;
    });

    if (approvedRecord) {
      setLocal('payments', this.payments);
      const rec = approvedRecord as PaymentRecord;
      ApiSync.updatePaymentStatusRemotely({
        id: paymentId,
        status: 'APPROVED',
        approvedBy: adminName,
        studentId: rec.studentId
      });
      this.logAction(adminName, 'APPROVE_PAYMENT', `Approved ₦500 payment for ${rec.studentName} (${rec.matricNumber})`);
      // Update registered profile in localStorage
      this.updateStudentPaymentStatus(rec.studentId, 'APPROVED');
      this.notify();
    }
    return approvedRecord;
  }

  static rejectPayment(paymentId: string, reason: string, adminName: string): PaymentRecord | null {
    let rejectedRecord: PaymentRecord | null = null;
    this.payments = this.payments.map((p) => {
      if (p.id === paymentId) {
        rejectedRecord = {
          ...p,
          status: 'REJECTED',
          rejectionReason: reason || 'Transaction could not be verified in OPay history.'
        };
        return rejectedRecord;
      }
      return p;
    });

    if (rejectedRecord) {
      setLocal('payments', this.payments);
      const rec = rejectedRecord as PaymentRecord;
      ApiSync.updatePaymentStatusRemotely({
        id: paymentId,
        status: 'REJECTED',
        rejectionReason: reason,
        studentId: rec.studentId
      });
      this.logAction(adminName, 'REJECT_PAYMENT', `Rejected payment for ${rec.studentName}. Reason: ${reason}`);
      this.updateStudentPaymentStatus(rec.studentId, 'REJECTED');
      this.notify();
    }
    return rejectedRecord;
  }

  static setUserCourseAccess(studentId: string, status: 'APPROVED' | 'UNPAID' | 'PENDING' | 'REJECTED', adminName: string) {
    this.updateStudentPaymentStatus(studentId, status);
    ApiSync.updateUserAccessRemotely(studentId, status);
    this.logAction(adminName, 'SET_USER_ACCESS', `Admin ${adminName} updated course note access to ${status} for student ${studentId}.`);
    this.notify();
  }

  // Update profile payment status in registered users list
  private static updateStudentPaymentStatus(studentId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'UNPAID') {
    const users = getLocal<UserProfile[]>('registered_users', []);
    const updated = users.map((u) => (u.id === studentId ? { ...u, paymentStatus: status as any } : u));
    setLocal('registered_users', updated);

    // Also update current active session if matching
    const current = getLocal<UserProfile | null>('current_user', null);
    if (current && current.id === studentId) {
      current.paymentStatus = status as any;
      setLocal('current_user', current);
    }
  }

  // Complaints & Customer Service
  static submitComplaint(complaint: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'responses'>): Complaint {
    const newComp: Complaint = {
      ...complaint,
      id: 'comp-' + Date.now(),
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      responses: []
    };
    this.complaints = [newComp, ...this.complaints];
    setLocal('complaints', this.complaints);
    ApiSync.syncKeyRemotely('complaints', this.complaints);
    this.notify();
    return newComp;
  }

  static respondToComplaint(complaintId: string, responseText: string, adminName: string) {
    this.complaints = this.complaints.map((c) => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: 'IN_PROGRESS' as const,
          responses: [
            ...c.responses,
            {
              id: 'resp-' + Date.now(),
              complaintId,
              responderName: adminName,
              responderRole: 'Admin / Course Rep',
              message: responseText,
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return c;
    });
    setLocal('complaints', this.complaints);
    ApiSync.syncKeyRemotely('complaints', this.complaints);
    this.logAction(adminName, 'REPLY_COMPLAINT', `Replied to complaint ${complaintId}`);
    this.notify();
  }

  static updateComplaintStatus(complaintId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED', adminName: string) {
    this.complaints = this.complaints.map((c) => (c.id === complaintId ? { ...c, status } : c));
    setLocal('complaints', this.complaints);
    ApiSync.syncKeyRemotely('complaints', this.complaints);
    this.logAction(adminName, 'UPDATE_COMPLAINT_STATUS', `Set complaint ${complaintId} status to ${status}`);
    this.notify();
  }

  // Announcements
  static addAnnouncement(ann: Omit<Announcement, 'id' | 'createdAt'>, adminName: string): Announcement {
    const newAnn: Announcement = {
      ...ann,
      id: 'ann-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    this.announcements = [newAnn, ...this.announcements];
    setLocal('announcements', this.announcements);
    ApiSync.syncKeyRemotely('announcements', this.announcements);
    this.logAction(adminName, 'PUBLISH_ANNOUNCEMENT', `Published announcement: "${ann.title}"`);
    this.broadcastNotification({
      title: `Announcement: ${ann.title}`,
      message: ann.content.substring(0, 100) + '...',
      type: 'system',
      link: '/dashboard'
    });
    this.notify();
    return newAnn;
  }

  static deleteAnnouncement(id: string, adminName: string) {
    this.announcements = this.announcements.filter((a) => a.id !== id);
    setLocal('announcements', this.announcements);
    ApiSync.syncKeyRemotely('announcements', this.announcements);
    this.logAction(adminName, 'DELETE_ANNOUNCEMENT', `Deleted announcement id ${id}`);
    this.notify();
  }

  // Notifications
  static broadcastNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now(),
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications = [newNotif, ...this.notifications];
    setLocal('notifications', this.notifications);
    this.notify();
  }

  static markNotificationRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setLocal('notifications', this.notifications);
    this.notify();
  }

  static markAllNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    setLocal('notifications', this.notifications);
    this.notify();
  }

  // Audit Logs
  static logAction(adminName: string, action: string, details: string) {
    const log: AuditLog = {
      id: 'log-' + Date.now(),
      adminName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs = [log, ...this.auditLogs];
    setLocal('auditLogs', this.auditLogs);
  }
}
