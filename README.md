# ⚡ QuizEngine

An algorithm-powered interactive quiz platform with adaptive scoring, dependency-based topic unlocking, and real-time leaderboards.

---
## 🚀 Live Demo

- Frontend: https://quizengine-sepia.vercel.app
- Backend API: https://quizengine-makv.onrender.com

## 📌 Features
- User authentication (JWT)
- Topic-based quiz system
- Adaptive unlocking of topics
- Leaderboard system
- Real-time scoring
---

## 📁 Project Structure

```
quizengine/
├── backend/
│   ├── algorithms/
│   │   ├── shuffle.js       ← Fisher–Yates shuffle
│   │   ├── scoring.js       ← Greedy streak scoring engine
│   │   ├── sorting.js       ← Leaderboard & difficulty sort
│   │   └── graph.js         ← Topological sort, unlock logic
│   ├── config/
│   │   └── db.js            ← MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── quizController.js
│   │   ├── topicController.js
│   │   ├── questionController.js
│   │   └── leaderboardController.js
│   ├── data/
│   │   └── seed.js          ← Seed script (6 topics, 30 questions)
│   ├── middleware/
│   │   └── auth.js          ← JWT protect + admin middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Topic.js         ← Graph nodes
│   │   ├── Question.js
│   │   └── QuizAttempt.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── quiz.js
│   │   ├── topics.js
│   │   ├── questions.js
│   │   ├── leaderboard.js
│   │   └── users.js
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Graph/
│   │   │   │   ├── TopicGraph.jsx   ← Interactive SVG graph
│   │   │   │   └── TopicCard.jsx
│   │   │   └── UI/
│   │   │       ├── Navbar.jsx
│   │   │       └── Navbar.module.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx      ← Global auth state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── TopicsPage.jsx
│   │   │   ├── QuizPage.jsx         ← Main quiz experience
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   └── HistoryPage.jsx
│   │   ├── styles/
│   │   │   └── global.css           ← Design system tokens
│   │   ├── utils/
│   │   │   ├── api.js               ← Axios instance
│   │   │   └── algorithms.js        ← Client-side algorithm mirrors
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

### 1. Clone & configure backend

```bash
cd quizengine/backend
cp .env.example .env
# Edit .env → set MONGODB_URI and JWT_SECRET
npm install
```

### 2. Seed the database

```bash
npm run seed
```

This creates:
- 6 topics in a dependency graph (HTML → CSS → JS → React/Node → Full Stack)
- 30 questions (5 per topic, easy/medium/hard)
- Demo accounts

**Login credentials after seeding:**
| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@quizengine.dev     | admin123  |
| Demo  | demo@quizengine.dev      | demo1234  |

### 3. Start backend

```bash
npm run dev       # development (nodemon)
# or
npm start         # production
```

Backend runs on **http://localhost:5000**

### 4. Start frontend

```bash
cd ../frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000** (proxies `/api` to port 5000)

---

## 🐳 Docker (All-in-one)

```bash
# From project root
docker-compose up --build

# Seed after containers start
docker-compose exec backend node data/seed.js
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:5000
- MongoDB:  localhost:27017

---

## 🌐 API Reference

### Auth
| Method | Route                | Auth | Description        |
|--------|----------------------|------|--------------------|
| POST   | /api/auth/register   | ✗    | Create account     |
| POST   | /api/auth/login      | ✗    | Login → JWT token  |
| GET    | /api/auth/me         | ✓    | Current user       |

### Topics (Graph Nodes)
| Method | Route            | Auth  | Description               |
|--------|------------------|-------|---------------------------|
| GET    | /api/topics      | ✓     | All topics + unlock status |
| GET    | /api/topics/:id  | ✓     | Single topic               |
| POST   | /api/topics      | Admin | Create topic               |
| PUT    | /api/topics/:id  | Admin | Update topic               |
| DELETE | /api/topics/:id  | Admin | Delete topic               |

### Questions
| Method | Route                  | Auth  | Description         |
|--------|------------------------|-------|---------------------|
| GET    | /api/questions         | ✓     | List (filterable)   |
| POST   | /api/questions         | Admin | Create question     |
| POST   | /api/questions/bulk    | Admin | Bulk create         |
| PUT    | /api/questions/:id     | Admin | Update question     |
| DELETE | /api/questions/:id     | Admin | Delete question     |

### Quiz
| Method | Route            | Auth | Description                     |
|--------|------------------|------|---------------------------------|
| POST   | /api/quiz/start  | ✓    | Get shuffled questions           |
| POST   | /api/quiz/submit | ✓    | Grade answers, save attempt      |
| GET    | /api/quiz/history| ✓    | Last 20 attempts                 |

### Leaderboard
| Method | Route                         | Auth | Description            |
|--------|-------------------------------|------|------------------------|
| GET    | /api/leaderboard              | ✓    | Global top 50          |
| GET    | /api/leaderboard/topic/:id    | ✓    | Per-topic leaderboard  |

---

## 🧠 Algorithms Explained

### 1. Fisher–Yates Shuffle — `backend/algorithms/shuffle.js`
Runs in **O(n)** time. Guarantees every permutation is equally likely (unlike `sort(() => Math.random() - 0.5)` which is biased). Used every time a quiz session starts.

### 2. Greedy Scoring — `backend/algorithms/scoring.js`
Scores each answer immediately without lookahead:
- ✅ Correct: **+5**
- ❌ Wrong: **−1** (floor: 0)
- 🔥 3-in-a-row streak: **+2 bonus**
- 🔥🔥 5-in-a-row streak: **+5 bonus**

### 3. Graph Topology — `backend/algorithms/graph.js`
Topics form a **directed acyclic graph (DAG)**. Kahn's Algorithm (BFS-based topological sort) determines display order. `isTopicUnlocked()` checks all prerequisites are completed before allowing quiz access.

### 4. Sorting — `backend/algorithms/sorting.js`
- Leaderboard: stable sort by score desc, alphabetical tiebreak
- Questions: difficulty order (easy → medium → hard), date tiebreak
- Dynamic sort: composable multi-field comparator

---

## 🏗️ Topic Graph Layout

```
HTML ──────► CSS ──────► JavaScript ──────► React
                                │
                                └──────────► Node.js ──► Full Stack
```

Prerequisites must be completed (≥ passing score) before the next topic unlocks.

---

## ✅ Checklist

- [x] Fisher–Yates shuffle (no repeats in a session)
- [x] Difficulty sorting (easy → medium → hard)
- [x] Greedy scoring with streak bonuses (+2 at 3×, +5 at 5×)
- [x] Real-time score updates with animated feedback
- [x] Per-question countdown timer
- [x] Progress bar
- [x] Graph-based topic dependencies (DAG + topological sort)
- [x] Interactive SVG topic graph with pan support
- [x] Leaderboard with toggle sort
- [x] Quiz history
- [x] JWT authentication (register / login)
- [x] Dark / light theme toggle
- [x] Responsive design (mobile + desktop)
- [x] MongoDB models with proper indexes
- [x] REST API with admin routes
- [x] Seed script (30 questions, 6 topics, demo users)
- [x] Docker + nginx for deployment
