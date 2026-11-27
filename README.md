# NGO Management System — Microfinance & Field Operations Platform
**SE331 • Software Engineering Design Capstone Project • Fall 2026**  
Daffodil International University (DIU) • Group No: 04 • Lab Section: C2

---

## Group Division & Assigned Responsibilities

| Member | Assigned Responsibilities | Status |
| :--- | :--- | :--- |
| **Member 1** | **Module 1:**<br>• **Member Management**: Register, search, filter, update, toggle active/inactive<br>• **Field Officer Management**: Link field officers with members/collection groups<br><br>**Module 2:**<br>• **Savings Management**: Dedicated savings ledger for logging mandatory/voluntary deposits and withdrawals with real-time balance updates<br><br>**Module 3:**<br>• **Receipt Generation**: Digital receipt builder that instantly generates printable/downloadable PDF payment receipts upon collection | ✅ **Implemented & Verified** |
| **Member 2** | **Module 1:**<br>• **Member Verification**: NID & photo document upload with Multer, status tracking (Pending, Verified, Rejected), preview & file deletion<br><br>**Module 2:**<br>• **Loan Management**: Application portal, financial calculations, approval & disbursement workflow, and installment tracking<br>• **Due & Overdue Management**: Automated detection engine for past-due installments, risk analysis, and real-time Defaulters list | ✅ **Implemented & Verified** |
| **Member 3** | **Module 1:**<br>• **Employee Management**: CRUD operations for administrative and field staff profiles, designations & employment statuses, multi-field search & filtering, referential integrity with assignments<br><br>**Module 2:**<br>• **Installment Management**: Automated calculation and generation of repayment schedules upon loan disbursement, along with collecting and recording installment payments with receipt generation | ✅ **Implemented & Verified** |

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

### 3. Run Automated Tests
```bash
cd backend
npm test
# Runs automated test suites
```

---

## API Documentation

### Member 1 Scope: Member Management
- `GET /api/members` — Fetch members (supports `?search=` and `?status=`)
- `POST /api/members` — Register a new member
- `GET /api/members/:id` — View single member details
- `PUT /api/members/:id` — Update member profile
- `PATCH /api/members/:id/status` — Toggle Active/Inactive status
- `DELETE /api/members/:id` — Delete a member

### Member 1 Scope: Field Officer Assignments
- `GET /api/field-officers` — List field officers available for assignment
- `GET /api/assignments` — Fetch assignments (supports `?fieldOfficer=`, `?member=`, `?status=`)
- `POST /api/assignments` — Create a field officer assignment
- `GET /api/assignments/:id` — View assignment details
- `PUT /api/assignments/:id` — Update assignment notes/target
- `DELETE /api/assignments/:id` — Remove (soft-delete) assignment

### Member 1 Scope: Savings Management (Module 2)
- `GET /api/savings/accounts` — Fetch savings accounts (supports `?search=` and `?status=`)
- `POST /api/savings/accounts` — Open a new savings account for a member
- `GET /api/savings/accounts/:id` — View account details and recent transactions
- `PATCH /api/savings/accounts/:id/status` — Update account status (Active, Dormant, Closed)
- `GET /api/savings/ledger` — Dedicated savings ledger with filters (`?type=`, `?savingsType=`, `?search=`) and summary stats
- `POST /api/savings/transactions` — Log deposit/withdrawal with real-time balance update
- `GET /api/savings/stats` — Overall platform savings metrics
- `GET /api/savings/member/:memberId` — Member passbook and savings history

### Member 1 Scope: Receipt Generation (Module 3)
- `GET /api/receipts` — Fetch receipts (supports `?search=` and `?collectionType=`)
- `POST /api/receipts` — Generate a new digital payment receipt upon collection
- `GET /api/receipts/:id` — View single receipt details
- `GET /api/receipts/stats` — Aggregate metrics (total receipts, total amount, cash vs. digital collections)
- `DELETE /api/receipts/:id` — Delete receipt record

### Member 2 Scope: Member Verification (Module 1)
- `GET /api/verifications` — List all verification records (supports `?status=`, `?documentType=`, `?member=`, `?search=`)
- `POST /api/verifications/upload` — Upload verification document (multipart/form-data: `member`, `documentType`, `document`)
- `GET /api/verifications/:id` — Get single verification record by ID
- `GET /api/verifications/member/:memberId` — Get all verification documents for a member
- `PATCH /api/verifications/:id/status` — Update verification status (`Verified` / `Rejected`, with optional `remarks`)
- `DELETE /api/verifications/:id` — Delete verification record and remove document file from storage

### Member 2 Scope: Loan Management (Module 2)
- `GET /api/loans` — List all loans with filters (`?status=`, `?member=`, `?search=`)
- `POST /api/loans` — Submit a new micro-loan application
- `GET /api/loans/:id` — Get loan details with member profile and repayment schedule
- `PATCH /api/loans/:id/status` — Transition status (`Approved`, `Rejected`, `Disbursed`, `Closed`)
- `POST /api/loans/:id/installments/:installmentNumber/pay` — Record an installment payment
- `DELETE /api/loans/:id` — Delete pending or rejected loan application

### Member 2 Scope: Due & Overdue Management (Module 2)
- `GET /api/due-overdue/summary` — Analytics summary (total overdue amount, defaulter count, upcoming dues)
- `GET /api/due-overdue/defaulters` — Real-time defaulters list with risk levels (`Critical`, `Moderate`, `Low`)
- `GET /api/due-overdue/upcoming` — Upcoming installment collections in next 7-14 days

### Member 3 Scope: Employee Management (Module 1)
- `GET /api/employees` — Fetch employees (supports `?search=`, `?staffType=`, `?employmentStatus=`, `?department=`, `?designation=`, `?page=`, `?limit=`)
- `GET /api/employees/stats` — Aggregate metrics (total staff, administrative vs. field breakdown, status distribution, distinct designations/departments)
- `GET /api/employees/:id` — View employee profile details and active field assignments count
- `POST /api/employees` — Register a new staff profile (administrative or field staff)
- `PUT /api/employees/:id` — Update staff profile details
- `PATCH /api/employees/:id/status` — Update employment status (`Active`, `Inactive`, `On Leave`, `Probation`, `Terminated`)
- `DELETE /api/employees/:id` — Delete employee profile (enforces referential integrity check against active field assignments)

### Member 3 Scope: Installment Management (Module 2)
- `GET /api/installments/calculator-preview` — Simulate and preview repayment schedule (`?principalAmount=`, `?interestRate=`, `?termDuration=`, `?termType=`, `?startDate=`)
- `POST /api/installments/generate-schedule/:loanId` — Generate repayment schedule upon disbursement
- `POST /api/installments/collect` — Collect and record installment payment with digital receipt generation
- `GET /api/installments/schedule/:loanId` — Detailed repayment schedule, payment progress, and transactions
- `GET /api/installments/payments` — Collection receipts & payment transaction ledger (supports `?search=`, `?paymentMethod=`, `?loanId=`)
- `GET /api/installments/stats` — Aggregate installment collection metrics and pending repayment totals
