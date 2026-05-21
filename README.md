# FinTrack — Modern Expense Tracker

A full-stack personal finance management app with React frontend and Node.js backend.

## Tech Stack

**Frontend:** React 18 + Vite, Chart.js, React Router, React Hot Toast, Lucide Icons  
**Backend:** Node.js + Express.js, MongoDB + Mongoose, JWT Auth, bcryptjs, PDFKit  

---

## Prerequisites

- **Node.js** v18+ — https://nodejs.org  
- **MongoDB** — either local install or free cloud Atlas: https://cloud.mongodb.com  
- **npm** v9+

---

## Setup

### 1. Clone / Extract the project

```
fintrack/
├── backend/
└── frontend/
```

---

### 2. Backend Setup

```bash
cd fintrack/backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=30d
NODE_ENV=development
```

**If using MongoDB Atlas (cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fintrack
```

Start backend:
```bash
# Development (auto-restart on changes)
npm run dev

# OR Production
npm start
```

✅ Backend runs at: `http://localhost:5000`  
✅ Test: `http://localhost:5000/api/health`

---

### 3. Frontend Setup

```bash
cd fintrack/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend runs at: `http://localhost:5173`

---

## Usage

1. Open `http://localhost:5173` in your browser
2. Click **"Create one"** to register a new account
3. Login and start tracking your finances!

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/expenses | Get all expenses |
| POST | /api/expenses | Add expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/income | Get all income |
| POST | /api/income | Add income |
| PUT | /api/income/:id | Update income |
| DELETE | /api/income/:id | Delete income |
| GET | /api/export/pdf | Download PDF report |

---

## Features

- ✅ JWT Authentication (register/login/logout)
- ✅ Dashboard with summary cards
- ✅ Income vs Expense bar chart
- ✅ Expense category donut chart
- ✅ Add/Edit/Delete expenses with categories
- ✅ Add/Edit/Delete income records
- ✅ Search & filter expenses
- ✅ Pagination
- ✅ PDF export report
- ✅ Analytics page with 4 charts
- ✅ Dark/Light mode toggle
- ✅ Fully responsive mobile design
- ✅ Toast notifications

---

## Build for Production

```bash
# Build frontend
cd frontend
npm run build
# Output in frontend/dist/

# Backend stays as Node.js
cd backend
npm start
```

---

## Troubleshooting

**MongoDB connection failed:**
- Make sure MongoDB is running: `mongod` (local) or check Atlas credentials

**Port already in use:**
- Backend: change `PORT` in `.env`
- Frontend: `npm run dev -- --port 3001`

**CORS errors:**
- Backend allows `localhost:5173` and `localhost:3000` by default
- Adjust in `server.js` if needed
