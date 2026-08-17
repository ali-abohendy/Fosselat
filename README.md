# 🕌 Fosselat Academy — Islamic Qur'an School

> **كِتَابٌ فُصِّلَتْ آيَاتُهُ قُرْآنًا عَرَبِيًّا لِّقَوْمٍ يَعْلَمُونَ**
>
> *Inspiring Faith through Qur'an, Arabic, and Islamic Studies*

🌍 **Live Website:** [https://fosselatacademy.com/](https://fosselatacademy.com/)

A full-stack web application for an online Islamic Qur'an academy — featuring student enrollment, teacher management, session scheduling, attendance tracking, payment recording, placement tests, and a role-based dashboard system for admins, teachers, and students.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Cairo + Amiri fonts) |
| Backend | Node.js + Express |
| Database | MongoDB |
| Auth | JWT |
| Deployment | Hostinger (Shared Hosting) + PM2 |

## 🎨 Design System

- **Primary Background**: Dark navy `#0A1A28`
- **Accent**: Gold `#C8A763` / `#B8952D`
- **Secondary**: Teal `#0F3D46`
- **Text**: Cream `#F7F3E6`
- **Typography**: Cairo (UI), Amiri (Arabic Qur'anic text)
- **Theme**: Premium dark with Islamic aesthetics

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/fosselat.git
cd fosselat
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env        # Edit .env with your backend URL
npm run dev
```
Frontend runs at [http://localhost:5173](http://localhost:5173)

### 3. Backend
```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env        # Edit with your MongoDB URI and JWT secret

# Start the Node.js server
npm run dev
```
Backend API runs at [http://localhost:5000](http://localhost:5000)

### 4. Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```env
MONGO_URI=mongodb://localhost:27017/fosselat
JWT_SECRET_KEY=your-secret-key-here
FLASK_ENV=development
```

---

## 📁 Project Structure

```
Fosselat/
├── frontend/                        # React SPA (Vite)
│   ├── public/
│   │   ├── logo.png                 # Academy logo
│   │   ├── hero-bg.jpg              # Hero section background
│   │   └── curriculum.pdf           # Downloadable curriculum
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Navbar.jsx/.css      # Navigation bar
│   │   │   ├── Footer.jsx/.css      # Footer
│   │   │   ├── Button.jsx/.css      # Button component
│   │   │   ├── DashboardLayout.jsx  # Sidebar layout for dashboards
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Curriculum.jsx       # Curriculum page
│   │   │   ├── PlacementTests.jsx   # Placement test selector
│   │   │   ├── PlacementTest.jsx    # Active test (Qur'an/Arabic/Islamic)
│   │   │   ├── Pricing.jsx          # Pricing plans
│   │   │   ├── About.jsx            # About the academy
│   │   │   ├── Contact.jsx          # Contact form
│   │   │   ├── Login.jsx            # Authentication
│   │   │   ├── admin/               # Admin dashboard pages
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminStudents.jsx
│   │   │   │   ├── AdminTeachers.jsx
│   │   │   │   ├── AdminSchedule.jsx
│   │   │   │   ├── AdminAttendance.jsx
│   │   │   │   ├── AdminStudentPayments.jsx
│   │   │   │   └── AdminTeacherPayments.jsx
│   │   │   ├── teacher/             # Teacher dashboard pages
│   │   │   │   ├── TeacherDashboard.jsx
│   │   │   │   ├── TeacherCalendar.jsx
│   │   │   │   ├── TeacherRecordSession.jsx
│   │   │   │   └── TeacherTimeSlots.jsx
│   │   │   └── student/             # Student dashboard pages
│   │   │       ├── StudentDashboard.jsx
│   │   │       ├── StudentReview.jsx
│   │   │       └── StudentTimeSlots.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT auth context
│   │   ├── services/
│   │   │   └── api.js               # API client
│   │   ├── config.js                # Central API URL config
│   │   ├── index.css                # Global design tokens
│   │   └── App.jsx                  # Router + protected routes
│   ├── vercel.json                  # Vercel deployment config
│   └── vite.config.js
│
├── backend/                         # Express REST API
│   ├── routes/                      # API endpoint definitions
│   │   ├── auth.js                  # Login, register
│   │   ├── admin.js                 # Admin-only endpoints
│   │   ├── teacher_dash.js          # Teacher endpoints
│   │   └── student_dash.js          # Student endpoints
│   ├── middleware/                  # JWT auth and role checks
│   ├── db.js                        # MongoDB connection
│   ├── package.json                 # Node dependencies
│   └── server.js                    # Entry point
│
└── README.md
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Admin** | Full access — manage students, teachers, schedule, attendance, payments, test routing |
| **Teacher** | Dashboard, calendar, record sessions, time slots |
| **Student** | Dashboard, session history, time slots, reviews, **Placement Tests Progress & History** |

---

## ✨ Recent Features & Improvements

- **Student Tests Dashboard Redesign:** A modern "Progress Dashboard" displaying top-level statistics (tests taken, average score), current progress bars per program, and a chronological test history log with expandable details.
- **Smart Placement Testing:** Placement tests automatically bypass the "Who is this for?" screen based on the student's registered age, sending direct email results.
- **Dynamic Test Recommendations:** Students receive personalized test recommendations in their dashboard 30 days after enrollment, based on their registered programs.
- **Searchable ID Selection:** Administrators can now easily search and select Student/Teacher IDs via a custom dropdown component that filters typing on-the-fly.
- **Mobile Responsive Dashboards:** Bottom navigation bars, grids, and history tables are fully responsive and optimized for mobile and iPad screens.

---

## 📄 Public Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, features, stats, placement test teaser, blog |
| Curriculum | `/curriculum` | Full course curriculum (PDF viewer) |
| Placement Tests | `/placement-tests` | Choose a test track |
| Placement Test | `/placement-tests/take` | Interactive placement test |
| Pricing | `/pricing` | Plans and packages *(hidden from teachers)* |
| About | `/about` | Mission, team, stats |
| Contact | `/contact` | Contact form |
| Blog | `/blog` | Articles and posts |
| Login | `/login` | Role-based authentication |

---

## 🔒 Dashboard Routes

| Role | Route |
|------|-------|
| Admin | `/admin/dashboard` |
| Teacher | `/teacher/dashboard` |
| Student | `/student/dashboard` |

---

## 💰 Payment & Pricing Logic

### Student Payments
- Standard hourly rate: **$8/hr**
- Elite plan discount: **$7.20/hr** (10% off)
- Total due = sum of each student's `(actual hours attended × hourly rate)`
- Sessions counted per student independently within the selected month

### Teacher Payments
- Teacher hourly rates are stored in **Egyptian Pounds (L.E)**
- Conversion: **50 L.E = $1 USD**
- Net salary displayed in L.E with USD equivalent shown
- Elite plan students get 10% discount applied to their rate

### Plans

| Plan | Sessions/Week |
|------|--------------|
| Starter | 2 |
| Growth | 3 |
| Excellence | 4 |
| Elite | 5 (+ 10% discount) |

---

## 🔌 Key API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats overview |
| GET/POST | `/api/admin/students` | List / create students |
| GET/POST | `/api/admin/teachers` | List / create teachers |
| POST | `/api/admin/schedule` | Assign student to teacher slot |
| GET | `/api/admin/attendance` | Attendance records |
| GET/POST | `/api/admin/payments/students` | Student payment records |
| GET/POST | `/api/admin/payments/teachers` | Teacher payroll records |

### Teacher
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teacher/dashboard` | Today's sessions + stats |
| GET | `/api/teacher/calendar` | Weekly schedule |
| POST | `/api/teacher/sessions` | Record a session |
| GET/POST | `/api/teacher/timeslots` | Availability slots |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/dashboard` | Student overview |
| GET | `/api/student/sessions` | Session history |
| POST | `/api/student/review` | Submit session review |

---

## 🌐 Deployment

The project is designed to be deployed on **Hostinger Shared Hosting** (or any cPanel-based host).

### 1. Build the Frontend
```bash
cd frontend
npm install
npm run build
```
This generates a `dist/` folder containing the compiled React SPA. Upload the contents of `dist/` directly into your `public_html/` directory on Hostinger.

### 2. Deploy the Backend
1. Create a folder named `backend` (or similar) outside of `public_html` (for security).
2. Upload the contents of your local `backend/` folder (excluding `node_modules`).
3. Via SSH or the Hostinger terminal, run `npm install`.
4. Ensure your `.env` file is properly configured with your production `MONGO_URI`.

### 3. Start the Backend API
On Hostinger, you can start the backend using a process manager like PM2 (or node if PM2 isn't available):
```bash
pm2 start server.js --name "fosselat-api"
```
Or you can use Hostinger's built-in **Node.js App** tool in hPanel.

### 4. Configure Domain & Routing
- Set up an `.htaccess` file in `public_html/` to handle React Router (redirecting all non-file requests to `index.html`).
- Set up a reverse proxy (if required) or configure your frontend's `VITE_API_URL` to point to the backend's address/port (e.g., `https://api.fosselatacademy.com`).

---

© 2026 Fosselat Academy. All rights reserved.
"# trigger rebuild" 
