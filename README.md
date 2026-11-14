# NGO Management System

**SE331 Software Engineering Design Capstone Project**  
Daffodil International University  
**Group:** 04 | **Section:** C2  

## Technology Stack
- **Frontend:** React.js (Vite), React Router v6, Axios, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM

---

## Group Division & Assigned Responsibilities

| Member | Assigned Responsibilities | Status in this Branch |
| :--- | :--- | :--- |
| **Member 1** | **1. Member Management**<br>• Register new NGO members with form validation<br>• List, search (name/ID/phone), and filter by status<br>• View member profile details & update information<br>• Toggle status between Active and Inactive<br><br>**2. Field Officer Management**<br>• View available field officers (integrated with Employee model)<br>• Assign field officer to members and/or collection groups<br>• View, filter, update, and remove assignments<br>• Prevent duplicate active assignments and enforce referential integrity | ✅ **Implemented & Verified** |
| **Member 2 (Current)** | **Module 1: Member Verification**<br>• NID & photo document upload with Multer<br>• Verification statuses (Pending, Verified, Rejected)<br>• In-browser document preview & file lifecycle<br><br>**Module 2: Credit & Field Operations**<br>• **Loan Management**: Application portal, financial calculations, approval & disbursement workflow, and installment tracking<br>• **Due & Overdue Management**: Automated detection engine for past-due installments, risk analysis, and real-time Defaulters list | ✅ **Implemented & Verified** |
| **Member 3** | • Employee Management CRUD<br>• Employee designations & employment statuses | ⏳ Model & Route scaffolding provided |

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or configured via `.env`)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server will start on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## API Documentation

### Member Management (Member 1 Scope)
- `GET /api/members` — Fetch members (supports `?search=` and `?status=`)
- `POST /api/members` — Register a new member
- `GET /api/members/:id` — View single member details
- `PUT /api/members/:id` — Update member profile
- `PATCH /api/members/:id/status` — Toggle Active/Inactive status
- `DELETE /api/members/:id` — Delete a member

### Field Officer Assignments (Member 1 Scope)
- `GET /api/field-officers` — List field officers available for assignment
- `GET /api/assignments` — Fetch assignments (supports `?fieldOfficer=`, `?member=`, `?status=`)
- `POST /api/assignments` — Create a field officer assignment
- `GET /api/assignments/:id` — View assignment details
- `PUT /api/assignments/:id` — Update assignment notes/target
- `DELETE /api/assignments/:id` — Remove (soft-delete) assignment

### Member Verification (Member 2 Scope — Module 1)
- `GET /api/verifications` — List all verification records (supports `?status=`, `?documentType=`, `?member=`, `?search=`)
- `POST /api/verifications/upload` — Upload verification document (multipart/form-data: `member`, `documentType`, `document`)
- `GET /api/verifications/:id` — Get single verification record by ID
- `GET /api/verifications/member/:memberId` — Get all verification documents for a member
- `PATCH /api/verifications/:id/status` — Update verification status (`Verified` / `Rejected`, with optional `remarks`)
- `DELETE /api/verifications/:id` — Delete verification record and remove document file from storage

### Loan Management (Member 2 Scope — Module 2)
- `GET /api/loans` — List all loans with filters (`?status=`, `?member=`, `?search=`)
- `POST /api/loans` — Submit a new micro-loan application
- `GET /api/loans/:id` — Get loan details with member profile and repayment schedule
- `PATCH /api/loans/:id/status` — Transition status (`Approved`, `Rejected`, `Disbursed`, `Closed`)
- `POST /api/loans/:id/installments/:installmentNumber/pay` — Record an installment payment
- `DELETE /api/loans/:id` — Delete pending or rejected loan application

### Due & Overdue Management (Member 2 Scope — Module 2)
- `GET /api/due-overdue/summary` — Analytics summary (total overdue amount, defaulter count, upcoming dues)
- `GET /api/due-overdue/defaulters` — Real-time defaulters list with risk levels (`Critical`, `Moderate`, `Low`)
- `GET /api/due-overdue/upcoming` — Upcoming installment collections in next 7-14 days


