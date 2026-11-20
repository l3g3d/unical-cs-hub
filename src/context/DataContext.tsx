import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Course,
  CourseRepresentative,
  CourseNote,
  TimetableEntry,
  LectureVenue,
  Assignment,
  AssignmentSubmission,
  PaymentRecord,
  Complaint,
  Announcement,
  AuditLog,
  AppNotification,
  AiProposedAction,
} from '../types';
import { MockStore } from '../lib/mockStore';
import { useAuth } from './AuthContext';

interface DataContextType {
  courses: Course[];
  courseRep: CourseRepresentative;
  notes: CourseNote[];
  timetable: TimetableEntry[];
  venues: LectureVenue[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  payments: PaymentRecord[];
  complaints: Complaint[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Notes
  uploadNote: (note: Omit<CourseNote, 'id' | 'uploadDate'>) => CourseNote;
  deleteNote: (id: string) => void;
  // Timetable
  addTimetableClass: (entry: Omit<TimetableEntry, 'id'>) => TimetableEntry;
  editTimetableClass: (id: string, updates: Partial<TimetableEntry>) => void;
  deleteTimetableClass: (id: string) => void;
  // Venues
  updateVenue: (courseCode: string, venueName: string, notice: string) => void;
  // Assignments
  createAssignment: (assign: Omit<Assignment, 'id' | 'createdAt'>) => Assignment;
  deleteAssignment: (id: string) => void;
  submitAssignment: (sub: Omit<AssignmentSubmission, 'id' | 'submittedAt'>) => AssignmentSubmission;
  gradeSubmission: (id: string, grade: number, feedback: string) => void;
  // Payments
  submitPayment: (pay: Omit<PaymentRecord, 'id' | 'status' | 'createdAt'>) => PaymentRecord;
  approvePayment: (id: string) => void;
  rejectPayment: (id: string, reason: string) => void;
  // Complaints
  submitComplaint: (comp: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'responses'>) => Complaint;
  replyComplaint: (id: string, text: string) => void;
  updateComplaintStatus: (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => void;
  // Announcements & Rep
  publishAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => Announcement;
  deleteAnnouncement: (id: string) => void;
  updateCourseRep: (updates: Partial<CourseRepresentative>) => void;
  // AI proposed action execution
  executeAiAction: (action: AiProposedAction) => Promise<{ success: boolean; message: string }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const adminName = user?.fullName || 'Course Rep Divine';

  const [courses, setCourses] = useState<Course[]>(MockStore.getCourses());
  const [courseRep, setCourseRep] = useState<CourseRepresentative>(MockStore.getCourseRep());
  const [notes, setNotes] = useState<CourseNote[]>(MockStore.getNotes());
  const [timetable, setTimetable] = useState<TimetableEntry[]>(MockStore.getTimetable());
  const [venues, setVenues] = useState<LectureVenue[]>(MockStore.getVenues());
  const [assignments, setAssignments] = useState<Assignment[]>(MockStore.getAssignments());
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(MockStore.getSubmissions());
  const [payments, setPayments] = useState<PaymentRecord[]>(MockStore.getPayments());
  const [complaints, setComplaints] = useState<Complaint[]>(MockStore.getComplaints());
  const [announcements, setAnnouncements] = useState<Announcement[]>(MockStore.getAnnouncements());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MockStore.getAuditLogs());
  const [notifications, setNotifications] = useState<AppNotification[]>(MockStore.getNotifications());

  const syncState = () => {
    setCourses(MockStore.getCourses());
    setCourseRep(MockStore.getCourseRep());
    setNotes(MockStore.getNotes());
    setTimetable(MockStore.getTimetable());
    setVenues(MockStore.getVenues());
    setAssignments(MockStore.getAssignments());
    setSubmissions(MockStore.getSubmissions());
    setPayments(MockStore.getPayments());
    setComplaints(MockStore.getComplaints());
    setAnnouncements(MockStore.getAnnouncements());
    setAuditLogs(MockStore.getAuditLogs());
    setNotifications(MockStore.getNotifications());
  };

  useEffect(() => {
    const unsubscribe = MockStore.subscribe(syncState);
    return () => unsubscribe();
  }, []);

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationRead = (id: string) => {
    MockStore.markNotificationRead(id);
  };

  const markAllNotificationsRead = () => {
    MockStore.markAllNotificationsRead();
  };

  // Notes
  const uploadNote = (note: Omit<CourseNote, 'id' | 'uploadDate'>) => {
    return MockStore.addNote(note, adminName);
  };

  const deleteNote = (id: string) => {
    MockStore.deleteNote(id, adminName);
  };

  // Timetable
  const addTimetableClass = (entry: Omit<TimetableEntry, 'id'>) => {
    return MockStore.addTimetableEntry(entry, adminName);
  };

  const editTimetableClass = (id: string, updates: Partial<TimetableEntry>) => {
    MockStore.editTimetableEntry(id, updates, adminName);
  };

  const deleteTimetableClass = (id: string) => {
    MockStore.deleteTimetableEntry(id, adminName);
  };

  // Venues
  const updateVenue = (courseCode: string, venueName: string, notice: string) => {
    MockStore.updateVenue(courseCode, venueName, notice, adminName);
  };

  // Assignments
  const createAssignment = (assign: Omit<Assignment, 'id' | 'createdAt'>) => {
    return MockStore.addAssignment(assign, adminName);
  };

  const deleteAssignment = (id: string) => {
    MockStore.deleteAssignment(id, adminName);
  };

  const submitAssignment = (sub: Omit<AssignmentSubmission, 'id' | 'submittedAt'>) => {
    return MockStore.submitAssignment(sub);
  };

  const gradeSubmission = (id: string, grade: number, feedback: string) => {
    MockStore.gradeSubmission(id, grade, feedback, adminName);
  };

  // Payments
  const submitPayment = (pay: Omit<PaymentRecord, 'id' | 'status' | 'createdAt'>) => {
    return MockStore.submitPayment(pay);
  };

  const approvePayment = (id: string) => {
    MockStore.approvePayment(id, adminName);
  };

  const rejectPayment = (id: string, reason: string) => {
    MockStore.rejectPayment(id, reason, adminName);
  };

  // Complaints
  const submitComplaint = (comp: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'responses'>) => {
    return MockStore.submitComplaint(comp);
  };

  const replyComplaint = (id: string, text: string) => {
    MockStore.respondToComplaint(id, text, adminName);
  };

  const updateComplaintStatus = (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
    MockStore.updateComplaintStatus(id, status, adminName);
  };

  // Announcements & Rep
  const publishAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt'>) => {
    return MockStore.addAnnouncement(ann, adminName);
  };

  const deleteAnnouncement = (id: string) => {
    MockStore.deleteAnnouncement(id, adminName);
  };

  const updateCourseRep = (updates: Partial<CourseRepresentative>) => {
    MockStore.updateCourseRep(updates, adminName);
  };

  // Execute AI action after explicit confirmation
  const executeAiAction = async (action: AiProposedAction): Promise<{ success: boolean; message: string }> => {
    if (user?.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can execute AI commands.' };
    }

    try {
      const details = action.details;
      switch (action.type) {
        case 'ADD_TIMETABLE_CLASS': {
          addTimetableClass({
            dayOfWeek: details.dayOfWeek || 'Monday',
            startTime: details.startTime || '08:00',
            endTime: details.endTime || '10:00',
            courseCode: details.courseCode || 'COS101',
            courseTitle: details.courseTitle || 'Introduction to Computer Sciences',
            lecturer: details.lecturer || 'Course Lecturer',
            venue: details.venue || 'Science Lecture Theatre (SLT)',
            semester: 'First Semester',
            academicYear: '2026/2027'
          });
          return { success: true, message: `Successfully added ${details.courseCode} to timetable for ${details.dayOfWeek} at ${details.startTime}.` };
        }

        case 'CHANGE_VENUE': {
          updateVenue(
            details.courseCode || 'COS101',
            details.venueName || 'Computing Lecture Hall',
            details.changeNotice || `Venue changed to ${details.venueName}`
          );
          return { success: true, message: `Updated venue for ${details.courseCode} to ${details.venueName}.` };
        }

        case 'CREATE_ASSIGNMENT': {
          createAssignment({
            courseCode: details.courseCode || 'COS101',
            title: details.title || 'Continuous Assessment 1',
            instructions: details.instructions || 'Follow instructions given in class and submit PDF or Word document.',
            dueDate: details.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
            maxScore: details.maxScore || 20,
            createdBy: adminName
          });
          return { success: true, message: `Created assignment for ${details.courseCode}: "${details.title}".` };
        }

        case 'PUBLISH_ANNOUNCEMENT': {
          publishAnnouncement({
            title: details.title || 'Departmental Notice',
            content: details.content || 'Please check the department portal regularly.',
            priority: details.priority || 'NORMAL',
            targetLevel: '100',
            authorName: adminName
          });
          return { success: true, message: `Published announcement: "${details.title}".` };
        }

        default:
          return { success: false, message: `Action type ${action.type} is not supported.` };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Execution error.' };
    }
  };

  return (
    <DataContext.Provider
      value={{
        courses,
        courseRep,
        notes,
        timetable,
        venues,
        assignments,
        submissions,
        payments,
        complaints,
        announcements,
        auditLogs,
        notifications,
        unreadNotifsCount,
        markNotificationRead,
        markAllNotificationsRead,
        uploadNote,
        deleteNote,
        addTimetableClass,
        editTimetableClass,
        deleteTimetableClass,
        updateVenue,
        createAssignment,
        deleteAssignment,
        submitAssignment,
        gradeSubmission,
        submitPayment,
        approvePayment,
        rejectPayment,
        submitComplaint,
        replyComplaint,
        updateComplaintStatus,
        publishAnnouncement,
        deleteAnnouncement,
        updateCourseRep,
        executeAiAction
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
