# UNICAL CS HUB — 100 Level Academic Web Application
**Department of Computer Science, University of Calabar (UNICAL), Nigeria**
*Academic Session 2026/2027 • First Semester*

---

## 🏛️ Project Purpose & Overview
**UNICAL CS HUB** is a specialized, production-ready academic web application custom-built for 100 level students of the Department of Computer Science, University of Calabar. It replaces disorganized WhatsApp groups and scattered PDFs with a fast, modern, mobile-first academic platform where students can access lecture notes, check weekly timetables, locate class venues, submit assignments, and resolve complaints.

The application features a dedicated **Mobile Administrator Dashboard** for the 100 Level Course Representative and an integrated **CS HUB AI Assistant** powered by Google Gemini API with speech-to-text voice commands.

---

## 📚 The 7 Departmental Courses (UNICAL 100L Curriculum)
All seven courses from the official UNICAL registration curriculum are pre-configured:

| Course Code | Course Title | Credit Units | Lecturer in Charge |
| :--- | :--- | :---: | :--- |
| **COS101** | Introduction to Computer Sciences | 3 | Dr. A. E. Effiong |
| **CSC181** | Computer Laboratory IA | 2 | Mr. B. O. Okon |
| **GST111** | Communication in English | 2 | Prof. M. U. Bassey |
| **MTH101** | Elementary Mathematics 1 | 3 | Dr. P. N. Asuquo |
| **PHY101** | Introduction to Physics I | 3 | Dr. E. O. Akpan |
| **PHY107** | General Physics Practical I | 1 | Engr. K. I. Edet |
| **STA111** | Basic Statistics | 2 | Dr. Mrs. H. O. Archibong |

Each course has its own lecture notes repository (Lecture 1, Lecture 2, Lecture 3, complete notes, syllabus) equipped with an **in-browser PDF reader** and direct download options.

---

## 💳 ₦500 Direct OPay Bank Transfer System
The portal uses a manual bank transfer system with zero merchant fee cuts:
- **One-time Access Fee**: ₦500
- **Bank**: OPay
- **Account Number**: `08139651907`
- **Account Name**: `Divine Christopher Inyang` (Course Representative)

### Payment Workflow:
1. Student transfers ₦500 via mobile bank app or USSD to `08139651907` (OPay).
2. Student submits sender name, bank transferred from, and transaction reference / session ID.
3. Status changes to **PENDING**.
4. Course Representative opens the Admin Dashboard on mobile, checks their OPay transaction history, and taps **APPROVE** or **REJECT**.
5. Once approved, the server-side guard grants permanent access to view and download all course lecture notes.

---

## 🤖 CS HUB AI Assistant (Google Gemini API & Voice Input)
Built specifically for the Course Representative to manage academic operations on the go without manual form filling:
- **Speech-to-Text**: Tap the microphone button on your phone to speak commands in natural English.
- **Conversational Planning**: Tell the AI: *"Let's organise next week's timetable"*, and it will guide you through scheduling classes.
- **Command Understanding**:
  - *"Add a COS101 lecture for Monday at 10 AM in Science Lecture Theatre."*
  - *"Create a STA111 assignment on Measures of Dispersion due Friday at 5 PM."*
  - *"Change tomorrow's COS101 lecture venue to Computing Lecture Hall."*
- **Action Preview & Confirmation**: The AI parses parameters and generates an interactive **Action Preview Card**. The change is only executed when the administrator taps **Confirm & Execute**.
- **Strict Security Fences**: The AI is strictly prohibited from approving/rejecting payments, altering fees, unlocking notes, or changing student account roles.

---

## 📱 Mobile-First Administrator Hub
Operate the entire website directly from your phone's browser:
1. **Overview & Statistics**: Total registered students, approved revenue, pending verifications, active notes count, and open complaints.
2. **Verify Payments**: Filter by Pending, Approved, or Rejected; review transaction references; approve with one click.
3. **Manage Notes**: Upload PDF notes for any of the 7 courses with lecture number, topic title, and description.
4. **Manage Timetable & Venues**: Add, edit, or delete weekly classes and trigger lecture relocation alerts.
5. **Manage Assignments**: Review student submissions, download submitted files, and assign grades with feedback.
6. **Manage Students**: Search registered students by name or matric number, view payment statuses.
7. **Manage Complaints**: Read student inquiries and post official responses.
8. **Course Representative Profile**: Update representative name, phone, email, and photo in real time.
9. **Backups & Activity Logs**: Download full JSON backups of the portal database.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend / Database**: Supabase PostgreSQL, Supabase Row Level Security (RLS), Supabase Storage
- **AI Intelligence**: Google Gemini API (`gemini-1.5-flash`)
- **Voice Input**: Web Speech Recognition API (`SpeechRecognition` / `webkitSpeechRecognition`)
- **Hosting**: Netlify (`netlify.toml` pre-configured with SPA routing)

---

## ⚡ Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
Creates an optimized, production-ready bundle in the `dist/` directory.

---

## 🧪 Pre-Configured Test Accounts (One-Click Instant Access)
The portal comes pre-loaded with local testing accounts:
1. **Course Representative / Admin**:
   - Email: `divineinyang636@gmail.com`
   - Password: `admin123`
   - Role: `admin` (Full access to Admin Hub & AI Assistant)
2. **Student (Paid Access)**:
   - Email: `emeka@unical.edu.ng`
   - Password: `student123`
   - Status: `APPROVED` (Can read and download all notes)
3. **Student (Unpaid / Fresh)**:
   - Email: `fresh@unical.edu.ng`
   - Password: `student123`
   - Status: `UNPAID` (Notes locked; can submit ₦500 payment)

---

## 🚀 Supabase Database Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the full contents of `supabase/migrations/20261120_initial_schema.sql` and run it.
4. In your `.env` file, supply your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

---

## 🌐 Netlify Deployment Guide
This repository includes `netlify.toml` configured for automatic continuous deployment.

1. Push your code to your GitHub repository (`divineinyang636@gmail.com`).
2. Log in to [Netlify](https://app.netlify.com) using your Netlify account (`onefacebook882@gmail.com`).
3. Click **Add new site** > **Import an existing project** > **GitHub**.
4. Select the `UNICAL COS` repository.
5. In the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Under **Environment variables**, add:
   - `VITE_GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `VITE_SUPABASE_URL`: *(Your Supabase URL)*
   - `VITE_SUPABASE_ANON_KEY`: *(Your Supabase Anon Key)*
7. Click **Deploy Site**. Your UNICAL CS HUB is now live on the internet!
