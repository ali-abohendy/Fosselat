# 🕌 Fossclat Academy — Islamic Qur'an School

> **Learn Qur'an. The Right Way.**

A full-stack web application for an online Islamic Qur'an academy featuring course listings, teacher profiles, student enrollment, authentication, and contact functionality — wrapped in a premium dark-themed UI with gold accents.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Cairo font) |
| Backend | Python Flask |
| Database | MongoDB |
| Auth | JWT (Flask-JWT-Extended) |

## 🎨 Design

- **Color Palette**: Dark navy (`#0A1A28`) + Teal (`#0F3D46`) + Gold (`#C8A763`) + Cream (`#F7F3E6`)
- **Typography**: Cairo (Google Fonts)
- **Theme**: Premium dark with Islamic aesthetics

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Backend

```bash
cd backend
pip install -r requirements.txt

# Seed the database with sample data
python seed_data.py

# Start the Flask server
python run.py
```

API runs at [http://localhost:5000](http://localhost:5000)

---

## 📁 Project Structure

```
Foselat/
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # 10 page components
│   │   ├── context/            # AuthContext (JWT)
│   │   ├── services/           # API client + fallback data
│   │   ├── index.css           # Design system tokens
│   │   └── App.jsx             # Router + Layout
│   └── ...
│
├── backend/                    # Flask API
│   ├── app/
│   │   ├── models/             # MongoDB document helpers
│   │   ├── routes/             # API route blueprints
│   │   └── utils/              # Validators
│   ├── seed_data.py            # Database seeder
│   └── run.py                  # Entry point
│
└── README.md
```

## 📄 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, features, courses, stats |
| Courses | `/courses` | All courses grid |
| Course Detail | `/courses/:id` | Single course info |
| Teachers | `/teachers` | Teacher profiles grid |
| Teacher Profile | `/teachers/:id` | Single teacher bio |
| About | `/about` | Mission & stats |
| Contact | `/contact` | Contact form |
| Enroll | `/enroll` | Enrollment form |
| Login | `/login` | Authentication |
| Register | `/register` | Create account |

## 🔌 API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Yes |
| GET | `/api/courses` | No |
| GET | `/api/courses/popular` | No |
| GET | `/api/courses/:id` | No |
| GET | `/api/teachers` | No |
| GET | `/api/teachers/:id` | No |
| POST | `/api/enrollments` | No |
| GET | `/api/enrollments/my` | Yes |
| POST | `/api/contact` | No |

---

## 📝 Notes

- The frontend works **standalone** with built-in fallback data — no backend needed to preview the UI
- MongoDB connection defaults to `mongodb://localhost:27017/fossclat`
- Set a `MONGO_URI` environment variable for MongoDB Atlas

---

© 2026 Fossclat Academy. All rights reserved.
