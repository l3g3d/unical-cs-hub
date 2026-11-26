import os
import subprocess
import sys

WORK_DIR = os.path.abspath(r"brag-output\work")
OUT_DIR = os.path.abspath("brag-output")
ASSETS_DIR = os.path.abspath(r"C:\Users\user\.gemini\config\skills\brag\assets")

FONT_BOLD = "C\\:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C\\:/Windows/Fonts/segoeui.ttf"
FONT_MONO = "C\\:/Windows/Fonts/consola.ttf"

def esc(t):
    """Escape text for FFmpeg drawtext filter"""
    return (
        t.replace('\\', '\\\\')
        .replace(':', '\\:')
        .replace("'", "\\'")
        .replace('%', '\\%')
        .replace(',', '\\,')
    )

def run_cmd(cmd_args, desc="Running command"):
    print(f"\n--- {desc} ---")
    if isinstance(cmd_args, list):
        print(" ".join(cmd_args))
        res = subprocess.run(cmd_args, capture_output=True, text=True)
    else:
        print(cmd_args)
        res = subprocess.run(cmd_args, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"FAILED (code {res.returncode}):")
        print(res.stderr)
        sys.exit(res.returncode)
    print("SUCCESS")
    return res

# -------------------------------------------------------------
# SCENE 1: The Hook (3.5s)
# "Introducing UNICAL CS HUB."
# "Your Academic Life. One Platform."
# -------------------------------------------------------------
def build_scene1():
    out_file = os.path.join(WORK_DIR, "scene1.mp4")
    filters = [
        # Ambient subtle zoom
        "scale=1920:1080",
        
        # Central glowing brand card
        "drawbox=x=460:y=180:w=1000:h=700:color=0x081329@0.95:t=fill",
        "drawbox=x=460:y=180:w=1000:h=700:color=0x2563eb@0.65:t=3",
        "drawbox=x=457:y=177:w=1006:h=706:color=0x38bdf8@0.3:t=1",
        
        # Department Top Pill
        "drawbox=x=660:y=240:w=600:h=44:color=0x1e3a8a@0.9:t=fill",
        "drawbox=x=660:y=240:w=600:h=44:color=0x3b82f6@0.7:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DEPARTMENT OF COMPUTER SCIENCE • UNICAL')}':fontsize=17:fontcolor=0x93c5fd:x=680:y=253",
        
        # Brand Emblem Box
        "drawbox=x=870:y=320:w=180:h=110:color=0x1d4ed8@0.95:t=fill",
        "drawbox=x=870:y=320:w=180:h=110:color=0x60a5fa@0.8:t=2",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('[ 100L ]')}':fontsize=32:fontcolor=white:x=900:y=355",
        
        # Main Headline 1 (0.0s - 1.8s)
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Introducing UNICAL CS HUB')}':fontsize=62:fontcolor=white:x=(w-text_w)/2:y=470:enable='lt(t,1.8)'",
        
        # Main Headline 2 (1.8s - 3.5s)
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Your Academic Life. One Platform.')}':fontsize=56:fontcolor=0x38bdf8:x=(w-text_w)/2:y=475:enable='gte(t,1.8)'",
        
        # Supporting Tagline
        f"drawtext=fontfile='{FONT_REG}':text='{esc('The modern portal built for University of Calabar Computer Science scholars.')}':fontsize=24:fontcolor=0x94a3b8:x=(w-text_w)/2:y=565",
        
        # Bottom feature highlights
        "drawbox=x=540:y=650:w=260:h=50:color=0x0f2757@0.85:t=fill",
        "drawbox=x=540:y=650:w=260:h=50:color=0x3b82f6@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('All 100L Notes')}':fontsize=17:fontcolor=0xe2e8f0:x=600:y=665",
        
        "drawbox=x=830:y=650:w=260:h=50:color=0x0f2757@0.85:t=fill",
        "drawbox=x=830:y=650:w=260:h=50:color=0x3b82f6@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Weekly Timetable')}':fontsize=17:fontcolor=0xe2e8f0:x=880:y=665",
        
        "drawbox=x=1120:y=650:w=260:h=50:color=0x0f2757@0.85:t=fill",
        "drawbox=x=1120:y=650:w=260:h=50:color=0x3b82f6@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Course Tasks & CA')}':fontsize=17:fontcolor=0xe2e8f0:x=1160:y=665",
        
        # Subtle fade in at beginning
        "fade=t=in:st=0:d=0.3"
    ]
    filter_str = ",".join(filters)
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "color=c=0x030712:s=1920x1080:d=3.5:r=30,format=yuv420p",
        "-vf", filter_str,
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        out_file
    ]
    run_cmd(cmd, "Building Scene 1 (Hook)")
    return out_file

# -------------------------------------------------------------
# SCENE 2: The Homepage & Student Dashboard (3.8s)
# -------------------------------------------------------------
def build_scene2():
    out_file = os.path.join(WORK_DIR, "scene2.mp4")
    filters = [
        # Top App Header (Navbar)
        "drawbox=x=0:y=0:w=1920:h=90:color=0x0a1128@0.98:t=fill",
        "drawbox=x=0:y=89:w=1920:h=2:color=0x1e3a8a@0.9:t=fill",
        
        # Logo in Header
        "drawbox=x=100:y=20:w=50:h=50:color=0x2563eb@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('CS')}':fontsize=24:fontcolor=white:x=110:y=32",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('UNICAL CS HUB')}':fontsize=26:fontcolor=white:x=165:y=28",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('100L Department of Computer Science')}':fontsize=14:fontcolor=0x94a3b8:x=165:y=54",
        
        # Active Tab Navigation Pills
        "drawbox=x=580:y=25:w=130:h=40:color=0x2563eb@0.95:t=fill", # Dashboard Active
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Dashboard')}':fontsize=15:fontcolor=white:x=608:y=37",
        
        "drawbox=x=725:y=25:w=125:h=40:color=0x1e293b@0.6:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Course Notes')}':fontsize=15:fontcolor=0xcbd5e1:x=738:y=37",
        
        "drawbox=x=865:y=25:w=110:h=40:color=0x1e293b@0.6:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Timetable')}':fontsize=15:fontcolor=0xcbd5e1:x=885:y=37",
        
        "drawbox=x=990:y=25:w=125:h=40:color=0x1e293b@0.6:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Assignments')}':fontsize=15:fontcolor=0xcbd5e1:x=1002:y=37",
        
        "drawbox=x=1130:y=25:w=100:h=40:color=0x1e293b@0.6:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Venues')}':fontsize=15:fontcolor=0xcbd5e1:x=1152:y=37",
        
        # Right Navbar Utilities (Theme Toggle, Student Status)
        "drawbox=x=1640:y=26:w=180:h=38:color=0x064e3b@0.8:t=fill",
        "drawbox=x=1640:y=26:w=180:h=38:color=0x10b981@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('• Verified Student')}':fontsize=14:fontcolor=0x6ee7b7:x=1665:y=37",
        
        # Hero Welcome Banner Card
        "drawbox=x=100:y=130:w=1720:h=200:color=0x0e1b3d@0.95:t=fill",
        "drawbox=x=100:y=130:w=1720:h=200:color=0x2563eb@0.6:t=2",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('STUDENT OVERVIEW')}':fontsize=14:fontcolor=0x60a5fa:x=140:y=155",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Welcome to UNICAL CS HUB — First Semester Academic Portal')}':fontsize=36:fontcolor=white:x=140:y=185",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Access approved lecture materials, monitor weekly class venues, and track course assignments in real-time.')}':fontsize=19:fontcolor=0x94a3b8:x=140:y=245",
        
        # 4 Metric Cards Across Screen
        # Card 1: Courses
        "drawbox=x=100:y=370:w=405:h=220:color=0x0f2042@0.95:t=fill",
        "drawbox=x=100:y=370:w=405:h=220:color=0x3b82f6@0.4:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('7')}':fontsize=56:fontcolor=0x38bdf8:x=140:y=400",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Registered 100L Courses')}':fontsize=20:fontcolor=white:x=140:y=475",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('COS 101, CSC 181, GST 111, MTH 101...')}':fontsize=14:fontcolor=0x94a3b8:x=140:y=515",
        
        # Card 2: Lecture Notes
        "drawbox=x=538:y=370:w=405:h=220:color=0x0f2042@0.95:t=fill",
        "drawbox=x=538:y=370:w=405:h=220:color=0x3b82f6@0.4:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('24')}':fontsize=56:fontcolor=0x60a5fa:x=578:y=400",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Verified Lecture Notes')}':fontsize=20:fontcolor=white:x=578:y=475",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Complete departmental slides & PDFs')}':fontsize=14:fontcolor=0x94a3b8:x=578:y=515",
        
        # Card 3: Timetable
        "drawbox=x=976:y=370:w=405:h=220:color=0x0f2042@0.95:t=fill",
        "drawbox=x=976:y=370:w=405:h=220:color=0x3b82f6@0.4:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('5 Days')}':fontsize=56:fontcolor=0xa78bfa:x=1016:y=400",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Weekly Lecture Schedule')}':fontsize=20:fontcolor=white:x=1016:y=475",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Monday to Friday lecture venues & times')}':fontsize=14:fontcolor=0x94a3b8:x=1016:y=515",
        
        # Card 4: Assignments
        "drawbox=x=1414:y=370:w=405:h=220:color=0x0f2042@0.95:t=fill",
        "drawbox=x=1414:y=370:w=405:h=220:color=0x3b82f6@0.4:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('3 Active')}':fontsize=56:fontcolor=0x34d399:x=1454:y=400",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Continuous Assessment Tasks')}':fontsize=20:fontcolor=white:x=1454:y=475",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Track submission deadlines & scores')}':fontsize=14:fontcolor=0x94a3b8:x=1454:y=515",
        
        # Bottom Status Notification Ribbon
        "drawbox=x=100:y=640:w=1720:h=120:color=0x081530@0.9:t=fill",
        "drawbox=x=100:y=640:w=1720:h=120:color=0x1e3a8a@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('OFFICIAL ANNOUNCEMENT')}':fontsize=14:fontcolor=0x38bdf8:x=140:y=665",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('• Departmental Dues & Verification: All 100L students are granted seamless course notes access upon registration.')}':fontsize=18:fontcolor=white:x=140:y=700",
        
        # Cinematic title overlay at bottom
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('STUDENT DASHBOARD — EVERYTHING IN ONE PLACE')}':fontsize=22:fontcolor=0x60a5fa:x=(w-text_w)/2:y=970"
    ]
    filter_str = ",".join(filters)
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "color=c=0x050c1e:s=1920x1080:d=3.8:r=30,format=yuv420p",
        "-vf", filter_str,
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        out_file
    ]
    run_cmd(cmd, "Building Scene 2 (Dashboard)")
    return out_file

# -------------------------------------------------------------
# SCENE 3: Course Notes Library (3.8s)
# "Access Your Lecture Notes."
# COS101, CSC181, GST111, MTH101, PHY101, STA111
# -------------------------------------------------------------
def build_scene3():
    out_file = os.path.join(WORK_DIR, "scene3.mp4")
    filters = [
        # Top Section Banner
        "drawbox=x=0:y=0:w=1920:h=130:color=0x09142d@0.98:t=fill",
        "drawbox=x=0:y=129:w=1920:h=2:color=0x1e3a8a@0.8:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('COURSE NOTES & ACADEMIC MATERIALS')}':fontsize=15:fontcolor=0x60a5fa:x=100:y=30",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Access Your Lecture Notes')}':fontsize=42:fontcolor=white:x=100:y=60",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('All seven 100-level Computer Science courses prepared and vetted by department lecturers.')}':fontsize=18:fontcolor=0x94a3b8:x=760:y=75",
        
        # Row 1 of Course Cards (3 Cards)
        # Card 1: COS 101
        "drawbox=x=100:y=170:w=540:h=250:color=0x0d1f42@0.95:t=fill",
        "drawbox=x=100:y=170:w=540:h=250:color=0x2563eb@0.6:t=2",
        "drawbox=x=130:y=200:w=100:h=32:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('COS 101')}':fontsize=16:fontcolor=white:x=145:y=208",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Introduction to Computer Science')}':fontsize=22:fontcolor=white:x=130:y=250",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Computer history, hardware architectures, number bases & algorithms.')}':fontsize=15:fontcolor=0x94a3b8:x=130:y=285",
        "drawbox=x=130:y=345:w=220:h=44:color=0x059669@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DOWNLOAD PDF NOTES')}':fontsize=14:fontcolor=white:x=150:y=358",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('3 Credit Units')}':fontsize=14:fontcolor=0x38bdf8:x=460:y=358",
        
        # Card 2: CSC 181
        "drawbox=x=690:y=170:w=540:h=250:color=0x0d1f42@0.95:t=fill",
        "drawbox=x=690:y=170:w=540:h=250:color=0x2563eb@0.6:t=2",
        "drawbox=x=720:y=200:w=100:h=32:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('CSC 181')}':fontsize=16:fontcolor=white:x=735:y=208",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Computer Applications & Tools')}':fontsize=22:fontcolor=white:x=720:y=250",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Operating systems, office suites, spreadsheets & Internet tools.')}':fontsize=15:fontcolor=0x94a3b8:x=720:y=285",
        "drawbox=x=720:y=345:w=220:h=44:color=0x059669@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DOWNLOAD PDF NOTES')}':fontsize=14:fontcolor=white:x=740:y=358",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('2 Credit Units')}':fontsize=14:fontcolor=0x38bdf8:x=1050:y=358",
        
        # Card 3: GST 111
        "drawbox=x=1280:y=170:w=540:h=250:color=0x0d1f42@0.95:t=fill",
        "drawbox=x=1280:y=170:w=540:h=250:color=0x2563eb@0.6:t=2",
        "drawbox=x=1310:y=200:w=100:h=32:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('GST 111')}':fontsize=16:fontcolor=white:x=1325:y=208",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Use of English & Library Skills')}':fontsize=22:fontcolor=white:x=1310:y=250",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Grammar, reading comprehension, report writing & library systems.')}':fontsize=15:fontcolor=0x94a3b8:x=1310:y=285",
        "drawbox=x=1310:y=345:w=220:h=44:color=0x059669@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DOWNLOAD PDF NOTES')}':fontsize=14:fontcolor=white:x=1330:y=358",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('2 Credit Units')}':fontsize=14:fontcolor=0x38bdf8:x=1640:y=358",
        
        # Row 2 of Course Cards (3 Cards)
        # Card 4: MTH 101
        "drawbox=x=100:y=460:w=540:h=250:color=0x0d1f42@0.95:t=fill",
        "drawbox=x=100:y=460:w=540:h=250:color=0x2563eb@0.6:t=2",
        "drawbox=x=130:y=490:w=100:h=32:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('MTH 101')}':fontsize=16:fontcolor=white:x=145:y=498",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Elementary Mathematics I')}':fontsize=22:fontcolor=white:x=130:y=540",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Set theory, quadratic equations, sequences & trigonometry.')}':fontsize=15:fontcolor=0x94a3b8:x=130:y=575",
        "drawbox=x=130:y=635:w=220:h=44:color=0x059669@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DOWNLOAD PDF NOTES')}':fontsize=14:fontcolor=white:x=150:y=648",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('3 Credit Units')}':fontsize=14:fontcolor=0x38bdf8:x=460:y=648",
        
        # Card 5: PHY 101
        "drawbox=x=690:y=460:w=540:h=250:color=0x0d1f42@0.95:t=fill",
        "drawbox=x=690:y=460:w=540:h=250:color=0x2563eb@0.6:t=2",
        "drawbox=x=720:y=490:w=100:h=32:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('PHY 101')}':fontsize=16:fontcolor=white:x=735:y=498",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('General Physics I (Mechanics & Heat)')}':fontsize=22:fontcolor=white:x=720:y=540",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Vectors, dynamics, work and energy, thermal physics & elasticity.')}':fontsize=15:fontcolor=0x94a3b8:x=720:y=575",
        "drawbox=x=720:y=635:w=220:h=44:color=0x059669@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DOWNLOAD PDF NOTES')}':fontsize=14:fontcolor=white:x=740:y=648",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('3 Credit Units')}':fontsize=14:fontcolor=0x38bdf8:x=1050:y=648",
        
        # Card 6: STA 111
        "drawbox=x=1280:y=460:w=540:h=250:color=0x0d1f42@0.95:t=fill",
        "drawbox=x=1280:y=460:w=540:h=250:color=0x2563eb@0.6:t=2",
        "drawbox=x=1310:y=490:w=100:h=32:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('STA 111')}':fontsize=16:fontcolor=white:x=1325:y=498",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Introductory Statistics')}':fontsize=22:fontcolor=white:x=1310:y=540",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Data presentation, measures of location, dispersion & probability.')}':fontsize=15:fontcolor=0x94a3b8:x=1310:y=575",
        "drawbox=x=1310:y=635:w=220:h=44:color=0x059669@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DOWNLOAD PDF NOTES')}':fontsize=14:fontcolor=white:x=1330:y=648",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('2 Credit Units')}':fontsize=14:fontcolor=0x38bdf8:x=1640:y=648",
        
        # Bottom Callout
        "drawbox=x=300:y=760:w=1320:h=80:color=0x0a1636@0.9:t=fill",
        "drawbox=x=300:y=760:w=1320:h=80:color=0x38bdf8@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Download complete syllabus lecture notes — study anywhere on any device.')}':fontsize=21:fontcolor=0x67e8f9:x=(w-text_w)/2:y=788",
        
        # Footer
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('OFFICIAL 100L COMPUTER SCIENCE REPOSITORY')}':fontsize=20:fontcolor=0x64748b:x=(w-text_w)/2:y=980"
    ]
    filter_str = ",".join(filters)
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "color=c=0x040816:s=1920x1080:d=3.8:r=30,format=yuv420p",
        "-vf", filter_str,
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        out_file
    ]
    run_cmd(cmd, "Building Scene 3 (Course Notes)")
    return out_file

# -------------------------------------------------------------
# SCENE 4: Weekly Lecture Timetable (3.8s)
# "Stay Ahead With Your Timetable."
# -------------------------------------------------------------
def build_scene4():
    out_file = os.path.join(WORK_DIR, "scene4.mp4")
    filters = [
        # Top Section Banner
        "drawbox=x=0:y=0:w=1920:h=130:color=0x09142d@0.98:t=fill",
        "drawbox=x=0:y=129:w=1920:h=2:color=0x1e3a8a@0.8:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('WEEKLY ACADEMIC SCHEDULE')}':fontsize=15:fontcolor=0x60a5fa:x=100:y=30",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Stay Ahead With Your Timetable')}':fontsize=42:fontcolor=white:x=100:y=60",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Know your exact class times, campus halls, and assigned course lecturers every week.')}':fontsize=18:fontcolor=0x94a3b8:x=850:y=75",
        
        # Schedule Table Container
        "drawbox=x=100:y=170:w=1720:h=670:color=0x0d1c3d@0.95:t=fill",
        "drawbox=x=100:y=170:w=1720:h=670:color=0x2563eb@0.6:t=2",
        
        # Table Header Row
        "drawbox=x=100:y=170:w=1720:h=65:color=0x172554@0.98:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DAY & TIME')}':fontsize=16:fontcolor=0x93c5fd:x=150:y=193",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('COURSE CODE')}':fontsize=16:fontcolor=0x93c5fd:x=400:y=193",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('COURSE TITLE')}':fontsize=16:fontcolor=0x93c5fd:x=600:y=193",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('LECTURE VENUE')}':fontsize=16:fontcolor=0x93c5fd:x=1080:y=193",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('LECTURER')}':fontsize=16:fontcolor=0x93c5fd:x=1440:y=193",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('STATUS')}':fontsize=16:fontcolor=0x93c5fd:x=1680:y=193",
        
        # Row 1: Monday
        "drawbox=x=100:y=245:w=1720:h=85:color=0x0f224a@0.8:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('MON  08:00 - 10:00 AM')}':fontsize=16:fontcolor=0x38bdf8:x=150:y=278",
        "drawbox=x=400:y=265:w=90:h=35:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('COS 101')}':fontsize=15:fontcolor=white:x=415:y=274",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Introduction to Computer Science')}':fontsize=18:fontcolor=white:x=600:y=276",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('New Science Lecture Theatre (NSLT)')}':fontsize=17:fontcolor=0x67e8f9:x=1080:y=276",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Prof. C. Inyang')}':fontsize=16:fontcolor=0xcbd5e1:x=1440:y=276",
        "drawbox=x=1675:y=268:w=80:h=28:color=0x065f46@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Active')}':fontsize=13:fontcolor=0x6ee7b7:x=1695:y=274",
        
        # Row 2: Tuesday
        "drawbox=x=100:y=340:w=1720:h=85:color=0x0d1d3f@0.6:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('TUE  10:00 - 12:00 PM')}':fontsize=16:fontcolor=0x38bdf8:x=150:y=373",
        "drawbox=x=400:y=360:w=90:h=35:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('CSC 181')}':fontsize=15:fontcolor=white:x=415:y=369",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Computer Applications & Tools')}':fontsize=18:fontcolor=white:x=600:y=371",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Departmental Computer Lab 1')}':fontsize=17:fontcolor=0x67e8f9:x=1080:y=371",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Dr. M. Okon')}':fontsize=16:fontcolor=0xcbd5e1:x=1440:y=371",
        "drawbox=x=1675:y=363:w=80:h=28:color=0x065f46@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Active')}':fontsize=13:fontcolor=0x6ee7b7:x=1695:y=369",
        
        # Row 3: Wednesday
        "drawbox=x=100:y=435:w=1720:h=85:color=0x0f224a@0.8:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('WED  02:00 - 04:00 PM')}':fontsize=16:fontcolor=0x38bdf8:x=150:y=468",
        "drawbox=x=400:y=455:w=90:h=35:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('MTH 101')}':fontsize=15:fontcolor=white:x=415:y=464",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Elementary Mathematics I')}':fontsize=18:fontcolor=white:x=600:y=466",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Faculty of Physical Sciences Hall A')}':fontsize=17:fontcolor=0x67e8f9:x=1080:y=466",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Dr. E. Udoh')}':fontsize=16:fontcolor=0xcbd5e1:x=1440:y=466",
        "drawbox=x=1675:y=458:w=80:h=28:color=0x065f46@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Active')}':fontsize=13:fontcolor=0x6ee7b7:x=1695:y=464",
        
        # Row 4: Thursday
        "drawbox=x=100:y=530:w=1720:h=85:color=0x0d1d3f@0.6:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('THU  08:00 - 10:00 AM')}':fontsize=16:fontcolor=0x38bdf8:x=150:y=563",
        "drawbox=x=400:y=550:w=90:h=35:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('PHY 101')}':fontsize=15:fontcolor=white:x=415:y=559",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('General Physics I (Mechanics)')}':fontsize=18:fontcolor=white:x=600:y=561",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Physics Main Auditorium')}':fontsize=17:fontcolor=0x67e8f9:x=1080:y=561",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Dr. Archibong')}':fontsize=16:fontcolor=0xcbd5e1:x=1440:y=561",
        "drawbox=x=1675:y=553:w=80:h=28:color=0x065f46@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Active')}':fontsize=13:fontcolor=0x6ee7b7:x=1695:y=559",
        
        # Row 5: Friday
        "drawbox=x=100:y=625:w=1720:h=85:color=0x0f224a@0.8:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('FRI  10:00 - 12:00 PM')}':fontsize=16:fontcolor=0x38bdf8:x=150:y=658",
        "drawbox=x=400:y=645:w=90:h=35:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('GST 111')}':fontsize=15:fontcolor=white:x=415:y=651",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Use of English & Library Skills')}':fontsize=18:fontcolor=white:x=600:y=656",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('University Grand Pavilion')}':fontsize=17:fontcolor=0x67e8f9:x=1080:y=656",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('GST Directorate')}':fontsize=16:fontcolor=0xcbd5e1:x=1440:y=656",
        "drawbox=x=1675:y=648:w=80:h=28:color=0x065f46@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Active')}':fontsize=13:fontcolor=0x6ee7b7:x=1695:y=651",
        
        # Footer
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('REAL-TIME CAMPUS LECTURE VENUES & LECTURER UPDATES')}':fontsize=20:fontcolor=0x64748b:x=(w-text_w)/2:y=960"
    ]
    filter_str = ",".join(filters)
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "color=c=0x040816:s=1920x1080:d=3.8:r=30,format=yuv420p",
        "-vf", filter_str,
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        out_file
    ]
    run_cmd(cmd, "Building Scene 4 (Timetable)")
    return out_file

# -------------------------------------------------------------
# SCENE 5: Assignments & Tasks (3.8s)
# "Never Miss An Assignment."
# -------------------------------------------------------------
def build_scene5():
    out_file = os.path.join(WORK_DIR, "scene5.mp4")
    filters = [
        # Top Section Banner
        "drawbox=x=0:y=0:w=1920:h=130:color=0x09142d@0.98:t=fill",
        "drawbox=x=0:y=129:w=1920:h=2:color=0x1e3a8a@0.8:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('COURSEWORK ASSIGNMENTS & TASKS')}':fontsize=15:fontcolor=0x60a5fa:x=100:y=30",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Never Miss An Assignment')}':fontsize=42:fontcolor=white:x=100:y=60",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Official continuous assessment tasks, detailed instructions, marks, and countdown deadlines.')}':fontsize=18:fontcolor=0x94a3b8:x=820:y=75",
        
        # 3 Detailed Assignment Cards
        # Card 1: COS 101 Task
        "drawbox=x=100:y=170:w=540:h=560:color=0x0d1f42@0.95:t=fill",
        "drawbox=x=100:y=170:w=540:h=560:color=0x2563eb@0.6:t=2",
        "drawbox=x=130:y=200:w=100:h=32:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('COS 101')}':fontsize=16:fontcolor=white:x=145:y=208",
        "drawbox=x=450:y=200:w=150:h=32:color=0x065f46@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Max: 20 Marks')}':fontsize=15:fontcolor=0x6ee7b7:x=465:y=208",
        
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Algorithm & Flowchart Design')}':fontsize=24:fontcolor=white:x=130:y=260",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Detailed Task Instructions:')}':fontsize=15:fontcolor=0x93c5fd:x=130:y=310",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Design and implement comprehensive')}':fontsize=16:fontcolor=0xcbd5e1:x=130:y=340",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('flowcharts for Bubble Sort and Binary Search.')}':fontsize=16:fontcolor=0xcbd5e1:x=130:y=370",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Include full pseudocode and variable tracing.')}':fontsize=16:fontcolor=0xcbd5e1:x=130:y=400",
        
        "drawbox=x=130:y=460:w=480:h=70:color=0x450a0a@0.9:t=fill",
        "drawbox=x=130:y=460:w=480:h=70:color=0xf43f5e@0.6:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DEADLINE: Friday, 11:59 PM (In 3 Days)')}':fontsize=16:fontcolor=0xfecdd3:x=150:y=485",
        
        "drawbox=x=130:y=620:w=480:h=50:color=0x2563eb@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('SUBMIT SOLUTION FILE')}':fontsize=17:fontcolor=white:x=270:y=635",
        
        # Card 2: CSC 181 Task
        "drawbox=x=690:y=170:w=540:h=560:color=0x0d1f42@0.95:t=fill",
        "drawbox=x=690:y=170:w=540:h=560:color=0x2563eb@0.6:t=2",
        "drawbox=x=720:y=200:w=100:h=32:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('CSC 181')}':fontsize=16:fontcolor=white:x=735:y=208",
        "drawbox=x=1040:y=200:w=150:h=32:color=0x065f46@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Max: 15 Marks')}':fontsize=15:fontcolor=0x6ee7b7:x=1055:y=208",
        
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Spreadsheet & Data Modeling')}':fontsize=24:fontcolor=white:x=720:y=260",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Detailed Task Instructions:')}':fontsize=15:fontcolor=0x93c5fd:x=720:y=310",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Build a student grading sheet utilizing')}':fontsize=16:fontcolor=0xcbd5e1:x=720:y=340",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('VLOOKUP, nested IF statements, and')}':fontsize=16:fontcolor=0xcbd5e1:x=720:y=370",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('dynamic charting for 50 records.')}':fontsize=16:fontcolor=0xcbd5e1:x=720:y=400",
        
        "drawbox=x=720:y=460:w=480:h=70:color=0x1e293b@0.9:t=fill",
        "drawbox=x=720:y=460:w=480:h=70:color=0x38bdf8@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DEADLINE: In 5 Days (Next Tuesday)')}':fontsize=16:fontcolor=0xbae6fd:x=740:y=485",
        
        "drawbox=x=720:y=620:w=480:h=50:color=0x2563eb@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('SUBMIT SOLUTION FILE')}':fontsize=17:fontcolor=white:x=860:y=635",
        
        # Card 3: MTH 101 Task
        "drawbox=x=1280:y=170:w=540:h=560:color=0x0d1f42@0.95:t=fill",
        "drawbox=x=1280:y=170:w=540:h=560:color=0x2563eb@0.6:t=2",
        "drawbox=x=1310:y=200:w=100:h=32:color=0x1d4ed8@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('MTH 101')}':fontsize=16:fontcolor=white:x=1325:y=208",
        "drawbox=x=1630:y=200:w=150:h=32:color=0x065f46@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Max: 30 Marks')}':fontsize=15:fontcolor=0x6ee7b7:x=1645:y=208",
        
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Quadratic Equations & Series')}':fontsize=24:fontcolor=white:x=1310:y=260",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Detailed Task Instructions:')}':fontsize=15:fontcolor=0x93c5fd:x=1310:y=310",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Solve tutorial sheet problem set 1 to 15')}':fontsize=16:fontcolor=0xcbd5e1:x=1310:y=340",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('covering roots of quadratic equations,')}':fontsize=16:fontcolor=0xcbd5e1:x=1310:y=370",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('arithmetic and geometric progressions.')}':fontsize=16:fontcolor=0xcbd5e1:x=1310:y=400",
        
        "drawbox=x=1310:y=460:w=480:h=70:color=0x1e293b@0.9:t=fill",
        "drawbox=x=1310:y=460:w=480:h=70:color=0x38bdf8@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DEADLINE: In 7 Days (Department Test Week)')}':fontsize=16:fontcolor=0xbae6fd:x=1330:y=485",
        
        "drawbox=x=1310:y=620:w=480:h=50:color=0x2563eb@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('SUBMIT SOLUTION FILE')}':fontsize=17:fontcolor=white:x=1450:y=635",
        
        # Bottom Callout Ribbon
        "drawbox=x=250:y=760:w=1420:h=80:color=0x081530@0.9:t=fill",
        "drawbox=x=250:y=760:w=1420:h=80:color=0x38bdf8@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Stay organized, beat every submission deadline, and secure all your continuous assessment marks.')}':fontsize=20:fontcolor=0x67e8f9:x=(w-text_w)/2:y=788",
        
        # Footer
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('CONTINUOUS ASSESSMENT & SUBMISSION TRACKING')}':fontsize=20:fontcolor=0x64748b:x=(w-text_w)/2:y=970"
    ]
    filter_str = ",".join(filters)
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "color=c=0x040816:s=1920x1080:d=3.8:r=30,format=yuv420p",
        "-vf", filter_str,
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        out_file
    ]
    run_cmd(cmd, "Building Scene 5 (Assignments)")
    return out_file

# -------------------------------------------------------------
# SCENE 6: Seamless Student Navigation (3.0s)
# "Everything You Need For Your Academic Journey."
# -------------------------------------------------------------
def build_scene6():
    out_file = os.path.join(WORK_DIR, "scene6.mp4")
    filters = [
        # Center Hero Box
        "drawbox=x=200:y=120:w=1520:h=780:color=0x0a1638@0.96:t=fill",
        "drawbox=x=200:y=120:w=1520:h=780:color=0x2563eb@0.7:t=2",
        "drawbox=x=197:y=117:w=1526:h=786:color=0x38bdf8@0.3:t=1",
        
        # Section Label
        "drawbox=x=710:y=160:w=500:h=40:color=0x1e3a8a@0.9:t=fill",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('SEAMLESS STUDENT EXPERIENCE')}':fontsize=17:fontcolor=0x93c5fd:x=790:y=172",
        
        # Headline
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Everything You Need For Your Academic Journey.')}':fontsize=46:fontcolor=white:x=(w-text_w)/2:y=230",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Instant navigation with sub-domain speed, zero latency, and persistent student state.')}':fontsize=22:fontcolor=0x94a3b8:x=(w-text_w)/2:y=295",
        
        # 4 Interactive Feature Pillars
        # Pillar 1
        "drawbox=x=260:y=370:w=320:h=260:color=0x0e2047@0.9:t=fill",
        "drawbox=x=260:y=370:w=320:h=260:color=0x38bdf8@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('[ 01 ]')}':fontsize=32:fontcolor=0x38bdf8:x=380:y=400",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Instant Search')}':fontsize=22:fontcolor=white:x=340:y=470",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Find any course, slide,')}':fontsize=16:fontcolor=0xcbd5e1:x=330:y=515",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('or task in seconds.')}':fontsize=16:fontcolor=0xcbd5e1:x=345:y=545",
        
        # Pillar 2
        "drawbox=x=620:y=370:w=320:h=260:color=0x0e2047@0.9:t=fill",
        "drawbox=x=620:y=370:w=320:h=260:color=0x38bdf8@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('[ 02 ]')}':fontsize=32:fontcolor=0x38bdf8:x=740:y=400",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Dark / Light Theme')}':fontsize=22:fontcolor=white:x=680:y=470",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Comfortable night reading')}':fontsize=16:fontcolor=0xcbd5e1:x=675:y=515",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('or crisp daytime study.')}':fontsize=16:fontcolor=0xcbd5e1:x=685:y=545",
        
        # Pillar 3
        "drawbox=x=980:y=370:w=320:h=260:color=0x0e2047@0.9:t=fill",
        "drawbox=x=980:y=370:w=320:h=260:color=0x38bdf8@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('[ 03 ]')}':fontsize=32:fontcolor=0x38bdf8:x=1100:y=400",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Mobile Optimized')}':fontsize=22:fontcolor=white:x=1040:y=470",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Flawless performance')}':fontsize=16:fontcolor=0xcbd5e1:x=1050:y=515",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('on phones & tablets.')}':fontsize=16:fontcolor=0xcbd5e1:x=1050:y=545",
        
        # Pillar 4
        "drawbox=x=1340:y=370:w=320:h=260:color=0x0e2047@0.9:t=fill",
        "drawbox=x=1340:y=370:w=320:h=260:color=0x38bdf8@0.5:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('[ 04 ]')}':fontsize=32:fontcolor=0x38bdf8:x=1460:y=400",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Verified Access')}':fontsize=22:fontcolor=white:x=1410:y=470",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('Secure OTP verification')}':fontsize=16:fontcolor=0xcbd5e1:x=1405:y=515",
        f"drawtext=fontfile='{FONT_REG}':text='{esc('protects student data.')}':fontsize=16:fontcolor=0xcbd5e1:x=1405:y=545",
        
        # Bottom Navigation Quick Bar
        "drawbox=x=360:y=690:w=1200:h=60:color=0x172554@0.9:t=fill",
        "drawbox=x=360:y=690:w=1200:h=60:color=0x3b82f6@0.6:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('Notes  >  Timetable  >  Tasks  >  Venues  >  Payments  |  Instant Access')}':fontsize=18:fontcolor=0x93c5fd:x=(w-text_w)/2:y=712",
        
        # Footer
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('DESIGNED EXCLUSIVELY FOR UNIVERSITY OF CALABAR')}':fontsize=18:fontcolor=0x64748b:x=(w-text_w)/2:y=960"
    ]
    filter_str = ",".join(filters)
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "color=c=0x040816:s=1920x1080:d=3.0:r=30,format=yuv420p",
        "-vf", filter_str,
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        out_file
    ]
    run_cmd(cmd, "Building Scene 6 (Navigation & Journey)")
    return out_file

# -------------------------------------------------------------
# SCENE 7: Grand Outro & Call to Action (4.2s)
# UNICAL CS HUB
# "Your Department. Your Resources. Your Academic Advantage."
# Website: https://unicalcshub.netlify.app/
# -------------------------------------------------------------
def build_scene7():
    out_file = os.path.join(WORK_DIR, "scene7.mp4")
    filters = [
        # Grand Outro Backdrop Card
        "drawbox=x=260:y=120:w=1400:h=820:color=0x081329@0.96:t=fill",
        "drawbox=x=260:y=120:w=1400:h=820:color=0x2563eb@0.8:t=3",
        "drawbox=x=256:y=116:w=1408:h=828:color=0x38bdf8@0.4:t=1",
        
        # University Department Crest Top Badge
        "drawbox=x=560:y=180:w=800:h=50:color=0x1e3a8a@0.9:t=fill",
        "drawbox=x=560:y=180:w=800:h=50:color=0x60a5fa@0.6:t=1",
        f"drawtext=fontfile='{FONT_BOLD}':text='DEPARTMENT OF COMPUTER SCIENCE • UNIVERSITY OF CALABAR':fontsize=20:fontcolor=0xdbeafe:x=(w-text_w)/2:y=195",
        
        # Center Brand Icon Box
        "drawbox=x=870:y=270:w=180:h=120:color=0x1d4ed8@0.95:t=fill",
        "drawbox=x=870:y=270:w=180:h=120:color=0x60a5fa@0.8:t=3",
        f"drawtext=fontfile='{FONT_BOLD}':text='[ 100L ]':fontsize=36:fontcolor=white:x=895:y=312",
        
        # Huge Logo Title
        f"drawtext=fontfile='{FONT_BOLD}':text='UNICAL CS HUB':fontsize=76:fontcolor=white:x=(w-text_w)/2:y=430",
        
        # The Mandatory Closing Tagline
        f"drawtext=fontfile='{FONT_BOLD}':text='Your Department. Your Resources. Your Academic Advantage.':fontsize=30:fontcolor=0x38bdf8:x=(w-text_w)/2:y=540",
        
        # Website Launch URL Pill
        "drawbox=x=480:y=630:w=960:h=90:color=0x1e40af@0.95:t=fill",
        "drawbox=x=480:y=630:w=960:h=90:color=0x60a5fa@0.8:t=2",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('OFFICIAL WEB PORTAL')}':fontsize=16:fontcolor=0x93c5fd:x=(w-text_w)/2:y=648",
        f"drawtext=fontfile='{FONT_BOLD}':text='{esc('https://unicalcshub.netlify.app/')}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=674",
        
        # Supporting Subtext
        f"drawtext=fontfile='{FONT_REG}':text='Available 24/7 on All Devices • Powered for 100L Computer Science Scholars':fontsize=18:fontcolor=0x94a3b8:x=(w-text_w)/2:y=765",
        
        # Bottom Copyright / Department Badge
        f"drawtext=fontfile='{FONT_BOLD}':text='University of Calabar • Faculty of Physical Sciences • Department of Computer Science':fontsize=16:fontcolor=0x64748b:x=(w-text_w)/2:y=860",
        
        # Fade to black at end
        "fade=t=out:st=3.7:d=0.5"
    ]
    filter_str = ",".join(filters)
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "color=c=0x030712:s=1920x1080:d=4.2:r=30,format=yuv420p",
        "-vf", filter_str,
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        out_file
    ]
    run_cmd(cmd, "Building Scene 7 (Outro & CTA)")
    return out_file

def main():
    print("=" * 60)
    print("STARTING UNICAL CS HUB PROMOTIONAL VIDEO GENERATION")
    print("=" * 60)
    
    # 1. Build all 7 individual scenes
    s1 = build_scene1()
    s2 = build_scene2()
    s3 = build_scene3()
    s4 = build_scene4()
    s5 = build_scene5()
    s6 = build_scene6()
    s7 = build_scene7()
    
    print("\nAll 7 video scenes generated successfully!")
    
    # 2. Cinematic Crossfade transitions using FFmpeg xfade
    video_joined = os.path.join(WORK_DIR, "video_joined.mp4")
    xfade_filter = (
        "[0:v][1:v]xfade=transition=fade:duration=0.4:offset=3.1[v1];"
        "[v1][2:v]xfade=transition=wipeleft:duration=0.4:offset=6.5[v2];"
        "[v2][3:v]xfade=transition=fade:duration=0.4:offset=9.9[v3];"
        "[v3][4:v]xfade=transition=smoothleft:duration=0.4:offset=13.3[v4];"
        "[v4][5:v]xfade=transition=wipeleft:duration=0.4:offset=16.7[v5];"
        "[v5][6:v]xfade=transition=fade:duration=0.4:offset=19.3[vout]"
    )
    
    cmd_join = [
        "ffmpeg", "-y",
        "-i", s1, "-i", s2, "-i", s3, "-i", s4, "-i", s5, "-i", s6, "-i", s7,
        "-filter_complex", xfade_filter,
        "-map", "[vout]",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        video_joined
    ]
    run_cmd(cmd_join, "Compositing 7 scenes with cinematic crossfade transitions")
    
    # 3. Audio Mixing
    music_src = os.path.join(ASSETS_DIR, "music", "happy-beats-business-moves-vol-1-by-ende-dot-app.mp3")
    sfx_click = os.path.join(ASSETS_DIR, "sfx", "interface", "click_002.ogg")
    sfx_drop = os.path.join(ASSETS_DIR, "sfx", "interface", "drop_001.ogg")
    sfx_switch = os.path.join(ASSETS_DIR, "sfx", "interface", "switch_001.ogg")
    sfx_bong = os.path.join(ASSETS_DIR, "sfx", "interface", "bong_001.ogg")
    sfx_impact = os.path.join(ASSETS_DIR, "sfx", "impact", "impactBell_heavy_000.ogg")
    
    final_output = os.path.join(OUT_DIR, "brag.mp4")
    
    audio_filter = (
        "[1:a]volume=0.82,afade=t=out:st=21.5:d=2.0[m];"
        "[2:a]adelay=100|100,volume=0.45[s1];"
        "[3:a]adelay=3100|3100,volume=0.4[s2];"
        "[4:a]adelay=6500|6500,volume=0.4[s3];"
        "[5:a]adelay=9900|9900,volume=0.4[s4];"
        "[6:a]adelay=13300|13300,volume=0.4[s5];"
        "[7:a]adelay=16700|16700,volume=0.45[s6];"
        "[8:a]adelay=19300|19300,volume=0.5[s7];"
        "[m][s1][s2][s3][s4][s5][s6][s7]amix=inputs=8:duration=first:dropout_transition=2[aout]"
    )
    
    cmd_audio = [
        "ffmpeg", "-y",
        "-i", video_joined,
        "-i", music_src,
        "-i", sfx_impact,
        "-i", sfx_click,
        "-i", sfx_drop,
        "-i", sfx_switch,
        "-i", sfx_click,
        "-i", sfx_bong,
        "-i", sfx_impact,
        "-filter_complex", audio_filter,
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", "23.5",
        final_output
    ]
    run_cmd(cmd_audio, "Mixing master video with soundtrack and synchronized SFX")
    
    # 4. Extract best poster frame into brag.jpg
    poster_jpg = os.path.join(OUT_DIR, "brag.jpg")
    cmd_poster = [
        "ffmpeg", "-y",
        "-ss", "00:00:21.000",
        "-i", final_output,
        "-vframes", "1",
        "-q:v", "2",
        poster_jpg
    ]
    run_cmd(cmd_poster, "Extracting official poster thumbnail (brag.jpg)")
    
    # 5. Bake poster frame as frame 0 of brag.mp4
    baked_video = os.path.join(OUT_DIR, "brag_baked.mp4")
    cmd_bake = [
        "ffmpeg", "-y",
        "-i", final_output,
        "-i", poster_jpg,
        "-filter_complex", "[0:v][1:v]overlay=enable='eq(n,0)'[v]",
        "-map", "[v]",
        "-map", "0:a",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-c:a", "copy",
        baked_video
    ]
    run_cmd(cmd_bake, "Baking poster thumbnail into frame 0 of video")
    
    # Replace final output with baked version
    if os.path.exists(baked_video):
        os.replace(baked_video, final_output)
    
    print("\n" + "=" * 60)
    print("PROMOTIONAL VIDEO COMPLETED SUCCESSFULLY!")
    print(f"Video file: {final_output}")
    print(f"Poster frame: {poster_jpg}")
    print("=" * 60)

if __name__ == "__main__":
    main()
