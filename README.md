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
| **Member 1 (Current)** | **Module 1:**<br>• **Member Management**: Register, search, filter, update, toggle active/inactive<br>• **Field Officer Management**: Link field officers with members/collection groups<br><br>**Module 2:**<br>• **Savings Management**: Dedicated savings ledger for logging mandatory/voluntary deposits and withdrawals with real-time balance updates | ✅ **Implemented & Verified** |
| **Member 2** | • Member Verification (M1)<br>• Loan Management & Due/Overdue Management (M2) | ⏳ Team Member Scope |
| **Member 3** | • Employee Management (M1)<br>• Installment Management (M2) | ⏳ Team Member Scope |

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

## API Documentation (Member 1 Scope)

### Member Management
- `GET /api/members` — Fetch members (supports `?search=` and `?status=`)
- `POST /api/members` — Register a new member
- `GET /api/members/:id` — View single member details
- `PUT /api/members/:id` — Update member profile
- `PATCH /api/members/:id/status` — Toggle Active/Inactive status
- `DELETE /api/members/:id` — Delete a member

### Field Officer Assignments
- `GET /api/field-officers` — List field officers available for assignment
- `GET /api/assignments` — Fetch assignments (supports `?fieldOfficer=`, `?member=`, `?status=`)
- `POST /api/assignments` — Create a field officer assignment
- `GET /api/assignments/:id` — View assignment details
- `PUT /api/assignments/:id` — Update assignment notes/target
- `DELETE /api/assignments/:id` — Remove (soft-delete) assignment

### Savings Management (Module 2)
- `GET /api/savings/accounts` — Fetch savings accounts (supports `?search=` and `?status=`)
- `POST /api/savings/accounts` — Open a new savings account for a member
- `GET /api/savings/accounts/:id` — View account details and recent transactions
- `PATCH /api/savings/accounts/:id/status` — Update account status (Active, Dormant, Closed)
- `GET /api/savings/ledger` — Dedicated savings ledger with filters (`?type=`, `?savingsType=`, `?search=`) and summary stats
- `POST /api/savings/transactions` — Log deposit/withdrawal with real-time balance update
- `GET /api/savings/stats` — Overall platform savings metrics
- `GET /api/savings/member/:memberId` — Member passbook and savings history

