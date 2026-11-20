-- ============================================================
-- UNICAL CS HUB — Comprehensive Production Supabase Schema
-- Department of Computer Science, University of Calabar
-- 100 Level Academic Portal
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  matric_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  department TEXT DEFAULT 'Computer Science',
  level TEXT DEFAULT '100',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ROLES TABLE (Admin separation)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 3. COURSES TABLE (The 7 Exact 100L Courses)
CREATE TABLE IF NOT EXISTS public.courses (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  credit_units INTEGER NOT NULL,
  lecturer TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COURSE NOTES TABLE
CREATE TABLE IF NOT EXISTS public.course_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL REFERENCES public.courses(code) ON DELETE CASCADE,
  lecture_number INTEGER NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  upload_date TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYMENTS TABLE (Manual ₦500 OPay bank transfer)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  matric_number TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 500,
  sender_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  transaction_reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('UNPAID', 'PENDING', 'APPROVED', 'REJECTED')),
  rejection_reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STUDENT ENTITLEMENTS (Controlled by server)
CREATE TABLE IF NOT EXISTS public.student_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  access_granted BOOLEAN DEFAULT FALSE,
  granted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  notes TEXT
);

-- 7. TIMETABLE TABLE
CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  course_code TEXT NOT NULL REFERENCES public.courses(code) ON DELETE CASCADE,
  course_title TEXT NOT NULL,
  lecturer TEXT NOT NULL,
  venue TEXT NOT NULL,
  semester TEXT DEFAULT 'First Semester',
  academic_year TEXT DEFAULT '2026/2027',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LECTURE VENUES TABLE
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL REFERENCES public.courses(code) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  capacity INTEGER DEFAULT 150,
  day_time TEXT NOT NULL,
  is_changed BOOLEAN DEFAULT FALSE,
  change_notice TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL REFERENCES public.courses(code) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  max_score INTEGER DEFAULT 100,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  matric_number TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  remarks TEXT,
  grade INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- 11. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  matric_number TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COMPLAINT RESPONSES TABLE
CREATE TABLE IF NOT EXISTS public.complaint_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES public.profiles(id),
  responder_name TEXT NOT NULL,
  responder_role TEXT NOT NULL DEFAULT 'Admin',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'URGENT')),
  target_level TEXT DEFAULT '100',
  author_name TEXT NOT NULL DEFAULT 'Department Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. COURSE REPRESENTATIVES TABLE
CREATE TABLE IF NOT EXISTS public.course_representatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT '100 Level Course Representative',
  department TEXT NOT NULL DEFAULT 'Computer Science Department, UNICAL',
  level TEXT NOT NULL DEFAULT '100 Level',
  phone TEXT NOT NULL DEFAULT '08139651907',
  email TEXT NOT NULL DEFAULT 'divineinyang636@gmail.com',
  photo_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id),
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Admin?
CREATE OR REPLACE FUNCTION public.is_admin(user_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read all profiles (or at least their own), users update only own
CREATE POLICY "Profiles readable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User roles: Only read own role or admin can read/write
CREATE POLICY "Users read own role" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Courses: Read by all, modified only by admin
CREATE POLICY "Courses readable by everyone" ON public.courses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Courses managed by admin" ON public.courses
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Course Notes: Metadata viewable by all, but protected downloads require entitlement!
CREATE POLICY "Course notes metadata viewable by authenticated" ON public.course_notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Course notes managed by admin" ON public.course_notes
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Payments: Students see own payments, Admins see and manage all
CREATE POLICY "Students see own payments" ON public.payments
  FOR SELECT TO authenticated USING (auth.uid() = student_id OR public.is_admin(auth.uid()));

CREATE POLICY "Students create payment record" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins update payments" ON public.payments
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- Student Entitlements: Read own entitlement or admin
CREATE POLICY "Read own entitlement" ON public.student_entitlements
  FOR SELECT TO authenticated USING (auth.uid() = student_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage entitlements" ON public.student_entitlements
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Timetable & Venues: Viewable by all, managed by admin
CREATE POLICY "Timetable viewable by all" ON public.timetable
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Timetable managed by admin" ON public.timetable
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Venues viewable by all" ON public.venues
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Venues managed by admin" ON public.venues
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Assignments: Viewable by all, managed by admin
CREATE POLICY "Assignments viewable by authenticated" ON public.assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Assignments managed by admin" ON public.assignments
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Assignment Submissions: Students view/submit own, Admins view/grade all
CREATE POLICY "Students view own submissions" ON public.assignment_submissions
  FOR SELECT TO authenticated USING (auth.uid() = student_id OR public.is_admin(auth.uid()));

CREATE POLICY "Students submit assignment" ON public.assignment_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins grade submissions" ON public.assignment_submissions
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- Complaints: Students view own, Admins view all
CREATE POLICY "Students view own complaints" ON public.complaints
  FOR SELECT TO authenticated USING (auth.uid() = student_id OR public.is_admin(auth.uid()));

CREATE POLICY "Students create complaints" ON public.complaints
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins update complaints" ON public.complaints
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- Complaint Responses: Viewable if student owns complaint or is admin
CREATE POLICY "Responses viewable by participants" ON public.complaint_responses
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_responses.complaint_id
      AND (complaints.student_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

CREATE POLICY "Admins create responses" ON public.complaint_responses
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- Announcements & Course Rep: Publicly viewable, managed by admin
CREATE POLICY "Announcements viewable by all" ON public.announcements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Announcements managed by admin" ON public.announcements
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Course rep viewable by all" ON public.course_representatives
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Course rep managed by admin" ON public.course_representatives
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Audit Logs: Admin only
CREATE POLICY "Audit logs admin only" ON public.audit_logs
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Notifications: User views own or broadcast notifications
CREATE POLICY "Notifications viewable" ON public.notifications
  FOR SELECT TO authenticated USING (user_id IS NULL OR user_id = auth.uid());

-- ============================================================
-- SEED DATA: Pre-populate the 7 exact UNICAL 100L courses
-- ============================================================
INSERT INTO public.courses (code, title, credit_units, lecturer, description)
VALUES 
  ('COS101', 'Introduction to Computer Sciences', 3, 'Dr. A. E. Effiong', 'Foundations of computing, binary arithmetic, computer architecture, algorithms, and computing history.'),
  ('CSC181', 'Computer Laboratory IA', 2, 'Mr. B. O. Okon', 'Practical hands-on computing laboratory, operating system utilities, basic CLI, and typing proficiencies.'),
  ('GST111', 'Communication in English', 2, 'Prof. M. U. Bassey', 'Grammar, sentence structures, essay writing, comprehension, and academic communication skills.'),
  ('MTH101', 'Elementary Mathematics 1', 3, 'Dr. P. N. Asuquo', 'Sets, relations, real number system, algebraic expressions, trigonometry, and analytical geometry.'),
  ('PHY101', 'Introduction to Physics I', 3, 'Dr. E. O. Akpan', 'Mechanics, properties of matter, thermal physics, waves, and fundamental harmonic oscillations.'),
  ('PHY107', 'General Physics Practical I', 1, 'Engr. K. I. Edet', 'Laboratory experiments in mechanics, heat, optics, and experimental uncertainty measurements.'),
  ('STA111', 'Basic Statistics', 2, 'Dr. Mrs. H. O. Archibong', 'Frequency distributions, measures of central tendency, dispersion, probability, and hypothesis testing.')
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  credit_units = EXCLUDED.credit_units,
  lecturer = EXCLUDED.lecturer,
  description = EXCLUDED.description;

-- Seed Course Representative Card
INSERT INTO public.course_representatives (id, full_name, position, department, level, phone, email, photo_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Divine Christopher Inyang',
  '100 Level Course Representative',
  'Computer Science Department, UNICAL',
  '100 Level',
  '08139651907',
  'divineinyang636@gmail.com',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Announcements
INSERT INTO public.announcements (title, content, priority, target_level, author_name)
VALUES
  ('Welcome to Department of Computer Science (100 Level)', 'All fresh students are hereby welcomed to the 2026/2027 Academic Session. Ensure you complete your departmental portal registration and OPay departmental dues verification for lecture notes access.', 'URGENT', '100', 'Department Head / Rep'),
  ('COS101 & CSC181 Practical Manual Notice', 'The laboratory manuals for CSC181 have been uploaded to the notes section. Please review Lab Experiment 1 before Friday.', 'NORMAL', '100', 'Course Rep');

-- Seed Sample Timetable Classes
INSERT INTO public.timetable (day_of_week, start_time, end_time, course_code, course_title, lecturer, venue)
VALUES
  ('Monday', '08:00', '10:00', 'COS101', 'Introduction to Computer Sciences', 'Dr. A. E. Effiong', 'Science Lecture Theatre (SLT)'),
  ('Monday', '10:00', '12:00', 'MTH101', 'Elementary Mathematics 1', 'Dr. P. N. Asuquo', 'New Science Complex Hall 1'),
  ('Tuesday', '09:00', '11:00', 'PHY101', 'Introduction to Physics I', 'Dr. E. O. Akpan', 'Physics Lecture Theatre'),
  ('Tuesday', '12:00', '14:00', 'GST111', 'Communication in English', 'Prof. M. U. Bassey', 'CES Hall A'),
  ('Wednesday', '10:00', '12:00', 'CSC181', 'Computer Laboratory IA', 'Mr. B. O. Okon', 'Departmental Hardware Lab'),
  ('Thursday', '08:00', '10:00', 'STA111', 'Basic Statistics', 'Dr. Mrs. H. O. Archibong', 'Maths & Stats Hall 2'),
  ('Thursday', '13:00', '16:00', 'PHY107', 'General Physics Practical I', 'Engr. K. I. Edet', 'Physics Laboratory 2');

-- Seed Venues
INSERT INTO public.venues (course_code, course_name, venue_name, capacity, day_time, is_changed, change_notice)
VALUES
  ('COS101', 'Introduction to Computer Sciences', 'Science Lecture Theatre (SLT)', 200, 'Mondays 8:00 AM - 10:00 AM', false, null),
  ('CSC181', 'Computer Laboratory IA', 'Departmental Hardware Lab', 80, 'Wednesdays 10:00 AM - 12:00 PM', false, null),
  ('GST111', 'Communication in English', 'CES Hall A', 350, 'Tuesdays 12:00 PM - 2:00 PM', false, null),
  ('MTH101', 'Elementary Mathematics 1', 'New Science Complex Hall 1', 250, 'Mondays 10:00 AM - 12:00 PM', false, null),
  ('PHY101', 'Introduction to Physics I', 'Physics Lecture Theatre', 220, 'Tuesdays 9:00 AM - 11:00 AM', false, null),
  ('PHY107', 'General Physics Practical I', 'Physics Laboratory 2', 60, 'Thursdays 1:00 PM - 4:00 PM', false, null),
  ('STA111', 'Basic Statistics', 'Maths & Stats Hall 2', 180, 'Thursdays 8:00 AM - 10:00 AM', false, null);
