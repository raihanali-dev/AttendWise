# 🎓 AttendWise

> Smart Attendance Tracking System for Students

AttendWise is a modern full-stack attendance management platform designed to help students track attendance, monitor subject-wise performance, and stay above their target attendance percentage with real-time insights.

Built using Next.js, TypeScript, Prisma, Neon PostgreSQL, Better Auth, and Vercel.

---

## ✨ Features

### 🔐 Authentication
- Secure user registration and login
- Session-based authentication with Better Auth
- Protected routes and user-specific data

### 📚 Subject Management
- Add unlimited subjects
- Edit or delete subjects anytime
- Custom subject names
- Configurable attendance weight per class
  - Theory class = 1 point
  - Practical class = 2 points
  - Fully customizable

### 📅 Daily Attendance Tracking
Mark attendance for each subject every day:

| Status | Meaning |
|----------|----------|
| ✅ Present | Attended class |
| ❌ Absent | Missed class |
| ⚪ No Class | Class was not conducted |

### 📊 Attendance Analytics
- Overall attendance percentage
- Subject-wise attendance percentage
- Visual progress indicators
- Attendance trend analysis

### 🎯 Smart Attendance Prediction
Set your target attendance percentage and instantly see:

#### If attendance is below target:
- Number of classes required to reach the target

#### If attendance is above target:
- Number of classes that can be skipped safely

### 📆 Attendance Calendar
- Monthly attendance view
- Quick attendance overview
- Historical tracking

### 📈 What-If Calculator
Simulate future attendance scenarios:

- What happens if I attend the next 5 classes?
- What happens if I miss the next 3 classes?
- Predict future attendance percentages instantly

### 📜 Attendance History
- Complete attendance records
- Subject filtering
- Date filtering
- Attendance review

### ⚙️ Settings
- Dark Mode
- Light Mode
- Attendance target customization
- Data management options

---

## 🛠 Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI

### Backend
- Next.js Server Actions
- Better Auth
- Prisma ORM

### Database
- Neon PostgreSQL

### Deployment
- Vercel

---

## 📂 Project Structure

```bash
app/
├── (auth)/
├── (dashboard)/
├── api/
├── attendance/
├── analytics/
├── calendar/
├── settings/
└── subjects/

components/
├── analytics/
├── attendance/
├── auth/
├── calendar/
├── dashboard/
├── history/
├── layout/
├── settings/
└── ui/

actions/
├── attendance.ts
├── dashboard.ts
├── settings.ts
└── subjects.ts

lib/
├── auth.ts
├── auth-client.ts
├── prisma.ts
└── session.ts

prisma/
└── schema.prisma
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/raihanali-dev/AttendWise.git
cd AttendWise
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=your_neon_database_url

BETTER_AUTH_SECRET=your_secret_key

BETTER_AUTH_URL=http://localhost:3000
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Database Migrations

```bash
npx prisma migrate deploy
```

### Start Development Server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## 🌐 Live Demo

**Production URL**

```text
https://attend-wise-liard.vercel.app
```

---

## 💡 Why AttendWise?

Many students calculate attendance manually using calculators, spreadsheets, or rough estimates.

AttendWise automates the entire process by providing:

- Accurate attendance tracking
- Attendance forecasting
- Subject-wise analytics
- Safe skip calculations
- Attendance recovery planning

All in one modern dashboard.

---

## 🔮 Future Enhancements

- Attendance reminders
- Timetable integration
- Excel export/import
- Custom attendance reports
- PWA support
- Multi-device synchronization
- Notification system

---

## 👨‍💻 Developer

### Raihan Ali

CSE AIML Student

- AI
- Full Stack Development
- Cloud Computing
- Machine Learning

GitHub:
https://github.com/raihanali-dev

---

## ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the project

🛠 Contribute improvements

---

## 📄 License

This project is licensed under the MIT License.

Built with ❤️ using Next.js, Prisma, Neon PostgreSQL, Better Auth, and Vercel.
