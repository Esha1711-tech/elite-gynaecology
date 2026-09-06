# Elite Gynaecology – Updated Project

## Main changes
- One configured doctor/admin account only.
- Doctor seed: `doctor@elitegynaecology.com` / `REMOVED_OLD_PASSWORD`.
- Three blogs are seeded in MongoDB with featured images; blogs are not hard-coded in the React page.
- Appointment booking has no doctor-selection field because this is a single-doctor clinic.
- Pakistani patients: PKR 3000; payment methods Easypaisa/JazzCash.
- International patients: USD 50; payment method Payoneer.
- Appointment submission is blocked unless a payment slip is uploaded.
- Payment slip is stored and must be verified by the doctor before appointment confirmation.
- Doctor dashboard includes appointment history, patient list, payment verification, prescriptions and report uploads.
- Patients can view prescriptions/recommendations and upload their own medical reports.
- Doctors can upload reports for patients.
- Color palette follows white + light pink + sage green with navy as the primary dark accent.

## Setup
### Backend
```bash
cd backend
npm install
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Set the frontend environment from `.env.example` if needed.

## Payment note
This implementation uses payment-slip submission and doctor verification. It does **not** pretend to charge a real Easypaisa, JazzCash or Payoneer account without the providers' merchant/API credentials. For production gateway payments, provider credentials and webhook verification must be configured.

## Uploads
Payment slips and medical reports are stored in `backend/uploads/` and served from `/uploads/...`.
