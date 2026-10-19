# 💧 WaterTracker

Командний семестровий вебпроєкт для відстеження щоденного споживання води.

## 🎯 Мета проєкту

Застосунок допомагає користувачам контролювати водний баланс: встановлювати денну норму, додавати записи про випиту воду та переглядати статистику.

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** — швидка збірка та HMR
- **Tailwind CSS** — utility-first стилізація з кастомними breakpoints (320px / 768px / 1440px)
- **React Router DOM** — клієнтська маршрутизація
- **Axios** — HTTP-клієнт

### Backend
- **Node.js** + **Express** — REST API сервер
- **PostgreSQL (Neon)** + **Prisma** — serverless база даних та ORM
- **JWT** — аутентифікація
- **Jest** + **Supertest** — тестування

## 📁 Структура проєкту

```
water-tracker-app/
├── frontend/          # React + Vite застосунок
├── backend/           # Node.js + Express API
├── .gitignore
└── README.md
```

## 🚀 Запуск

### Backend

```bash
cd backend
cp .env.example .env   # заповни змінні оточення
npm install
npm run dev            # development з nodemon
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Vite dev server
```

## 🔑 Архітектурні домовленості

- **Аутентифікація**: JWT (access token + refresh token)
- **Branching**: GitHub Flow — `main` + feature branches
- **Commit convention**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- **Code review**: мінімум 1 approve перед merge

## 🔐 Автентифікація

JWT видається при signup/signin і передається у httpOnly cookie `token` (вимога ТЗ), а також у тілі відповіді.
Захищені маршрути читають токен з cookie, а за його відсутності — із заголовка `Authorization: Bearer <token>` (сумісність із клієнтом).
Logout очищає cookie і анулює токен у БД. Налаштування cookie/CORS: `CLIENT_URL`, `COOKIE_SECURE`, `COOKIE_SAME_SITE`.

## 👥 Розподіл ролей

Проєкт розрахований на команду з 2 осіб. Усі учасники беруть участь у написанні коду (Fullstack підхід) із закріпленими зонами відповідальності:

| Учасник | Технічні обов'язки | Організаційна роль |
| :--- | :--- | :--- |
| **Денис Ужвенко** | Backend (API, аутентифікація, БД), DevOps (деплой, CI/CD), Smoke-тести | Team Lead (архітектурні рішення, фінальний рев'ю) |
| **Дмитро Мінков** | Frontend (інтерфейс, адаптивна верстка, роутинг, клієнтський стан), QA | GitHub Projects Owner (ведення таск-дошки, контроль спринтів) |