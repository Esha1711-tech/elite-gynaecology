# Elite Gynaecology Lahore

A full-stack doctor and patient appointment management system for **Elite Gynaecology Lahore**.

## Branding
- Project name: **Elite Gynaecology Lahore**
- Palette: deep plum, dusty rose, blush, and warm cream based on the provided Elite Gynaecology logo.
- Logo files: `public/logo.png` and `public/logo-mark.png`

## Tech Stack
- React + Vite
- Tailwind CSS
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Nodemailer

## Run locally

### 1. Requirements
- Node.js
- Local MongoDB running on port `27017`

### 2. Backend
```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend runs on `http://localhost:5000`.

### 3. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`. Vite proxies `/api` requests to the backend.

## Default local doctor account
Run `npm run seed` once in the backend folder. Then use:

- **Email:** `doctor@elitegynaecology.com`
- **Password:** `REMOVED_OLD_PASSWORD`
- **Login As:** `Doctor`

These credentials are for local development/demo only. Change them before any production deployment.

## Patient account
Use the **Register** page to create a patient account, then log in with the same email and password.

## Email configuration
The project starts without email credentials. To enable Gmail notifications, edit `backend/.env` and replace:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```
Use a Gmail App Password rather than your normal Gmail password.

## MongoDB
The default local database is:
```text
mongodb://localhost:27017/elite_gynaecology
```
MongoDB creates the database automatically when the first record is inserted.

## Important
- `backend/.env` is included with safe local development defaults so the project can start immediately.
- Do not use the development JWT secret or demo credentials in production.
- Multer is configured on the maintained 2.x line.
