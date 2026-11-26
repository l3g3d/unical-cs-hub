export type UserRole = 'student' | 'admin';

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  matricNumber: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  paymentStatus: PaymentStatus;
  createdAt: string;
  lastLoginAt?: string;
  loginCount?: number;
  isBanned?: boolean;
  bannedAt?: string;
  banReason?: string;
}

export interface Course {
  code: string;
  title: string;
  creditUnits: number;
  lecturer: string;
  description: string;
}

export interface CourseNote {
  id: string;
  courseCode: string;
  lectureNumber: number;
  topic: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface TimetableEntry {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "10:00"
  courseCode: string;
  courseTitle: string;
  lecturer: string;
  venue: string;
  semester: string;
  academicYear: string;
}

export interface LectureVenue {
  id: string;
  courseCode: string;
  courseName: string;
  venueName: string;
  capacity?: number;
  dayTime: string;
  isChanged: boolean;
  changeNotice?: string;
}

export interface Assignment {
  id: string;
  courseCode: string;
  title: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  createdBy: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  courseCode?: string;
  assignmentTitle?: string;
  studentId: string;
  studentEmail?: string;
  studentName: string;
  matricNumber: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  remarks?: string;
  submittedAt: string;
  grade?: number;
  score?: number;
  feedback?: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentEmail?: string;
  studentName: string;
  matricNumber: string;
  amount: number; // 500
  senderName: string;
  bankName: string;
  transactionReference: string;
  proofImageUrl?: string; // Screenshot of payment transfer receipt
  proofReceiptUrl?: string; // Alias for receipt preview
  status: PaymentStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ComplaintResponse {
  id: string;
  complaintId: string;
  responderName: string;
  responderRole: string;
  message: string;
  createdAt: string;
}

export type ComplaintCategory =
  | 'Payment problems'
  | 'Missing notes'
  | 'Timetable errors'
  | 'Assignment problems'
  | 'Account problems'
  | 'Other academic issues';

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  matricNumber: string;
  subject: string;
  category: ComplaintCategory;
  message: string;
  status: ComplaintStatus;
  createdAt: string;
  responses: ComplaintResponse[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'NORMAL' | 'URGENT';
  targetLevel: string;
  authorName: string;
  createdAt: string;
}

export interface CourseRepresentative {
  id: string;
  fullName: string;
  position: string;
  department: string;
  level: string;
  phone: string;
  email: string;
  photoUrl: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId?: string; // empty means global broadcast
  title: string;
  message: string;
  type: 'notes' | 'timetable' | 'venue' | 'assignment' | 'payment' | 'complaint' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AiProposedAction {
  id: string;
  type:
    | 'ADD_TIMETABLE_CLASS'
    | 'EDIT_TIMETABLE_CLASS'
    | 'DELETE_TIMETABLE_CLASS'
    | 'CHANGE_VENUE'
    | 'CREATE_ASSIGNMENT'
    | 'DELETE_ASSIGNMENT'
    | 'CREATE_EVENT'
    | 'PUBLISH_ANNOUNCEMENT'
    | 'DELETE_ANNOUNCEMENT'
    | 'UPLOAD_NOTE'
    | 'DELETE_NOTE'
    | 'UPDATE_COURSE_REP';
  summary: string;
  details: Record<string, any>;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
}
