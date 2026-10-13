# DreamDecor - Event & Celebration Decoration Platform

DreamDecor is a full-stack celebration and event decoration booking platform built with **React 19**, **Vite**, **Express**, **Prisma ORM**, **MySQL**, and **Firebase Authentication**.

---

## Features

- **Dynamic Homepage**:
  - Interactive multi-slide auto-carousel hero banner.
  - Category showcase (Birthday, Romantic Anniversary, Kids Special, Baby Shower, Weddings).
  - Quick Assam cities selector.
  - Floating WhatsApp instant chat button.
- **Customer Portal**:
  - Customer sign-in & sign-up with **Firebase Google Authentication** and Email/Password.
  - Package browsing, details view with photo gallery, price calculation, and discounts.
  - One-click booking with date/venue scheduling and payment method selection.
  - Customer dashboard for viewing booking statuses.
- **Admin Management Panel (`/admin`)**:
  - Secure admin authentication.
  - Dashboard overview with real-time counts.
  - Package manager: Add, edit, upload photos, and toggle active packages.
  - Booking manager: Review pending bookings, approve/confirm bookings, and track events.

---

## Tech Stack

- **Frontend**: React 19, Vite, React Router v7, SweetAlert2, Firebase Web SDK, Vanilla CSS Design System.
- **Backend**: Node.js, Express, Prisma ORM, MySQL, JWT, bcryptjs, Multer for file uploads.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MySQL Server (running locally or cloud)
- Git

---

### 2. Backend Setup
1. Open a terminal in the `backend` directory:
   ```bash
   cd backend
   npm install
   ```
2. Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your MySQL credentials, JWT secret, and admin password:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/dreamdecor"
   JWT_SECRET="your_jwt_secret"
   ADMIN_USERNAME="dreamdecor"
   ADMIN_PASSWORD="your_admin_password"
   PORT=5000
   ```
4. Run Prisma database migrations & seed sample packages:
   ```bash
   npx prisma db push
   node seed-packages.js
   ```
5. Start the backend API server:
   ```bash
   node server.js
   ```
   Server runs at `http://localhost:5000`.

---

### 3. Frontend Setup
1. Open a terminal in the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Configure your Firebase Web App credentials in `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Firebase API keys to `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## License
MIT
