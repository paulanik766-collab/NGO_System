# NGO Management System

**SE331 Software Engineering Design Capstone Project**  
Daffodil International University  
**Group:** 04 | **Section:** C2  

## Technology Stack
- **Frontend:** React.js (Vite), React Router v6, Axios, Vanilla CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Testing:** Jest, Supertest, MongoDB Memory Server

---

## Group Division & Assigned Responsibilities

| Member | Assigned Responsibilities | Status |
| :--- | :--- | :--- |
| **Member 1** | **1. Member Management**<br>• Register new NGO members with form validation<br>• List, search (name/ID/phone), and filter by status<br>• View member profile details & update information<br>• Toggle status between Active and Inactive<br><br>**2. Field Officer Management**<br>• View available field officers (integrated with Employee model)<br>• Assign field officer to members and/or collection groups<br>• View, filter, update, and remove assignments<br>• Prevent duplicate active assignments and enforce referential integrity | ✅ **Implemented & Verified** |
| **Member 2** | • Member Verification<br>• NID & photo document upload<br>• Verification statuses (Pending, Verified, Rejected) | ⏳ Dedicated workspace reserved |
| **Member 3 (Current)** | **Employee Management**<br>• CRUD operations for administrative and field staff profiles<br>• Designations management with presets & departmental mapping<br>• Employment statuses (Active, Inactive, On Leave, Probation, Terminated)<br>• Multi-field search, filtering, and aggregated statistics<br>• Referential integrity validation preventing deletion of staff with active field assignments<br>• Auto-synchronization with Member 1's Field Officer Assignment system | ✅ **Implemented & Verified** |

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
# Runs both Member 1 and Member 3 automated test suites
```

---

## API Documentation

### Member 3 Scope: Employee Management
- `GET /api/employees` — Fetch employees (supports `?search=`, `?staffType=`, `?employmentStatus=`, `?department=`, `?designation=`, `?page=`, `?limit=`)
- `GET /api/employees/stats` — Aggregate metrics (total staff, administrative vs. field breakdown, status distribution, distinct designations/departments)
- `GET /api/employees/:id` — View employee profile details and active field assignments count
- `POST /api/employees` — Register a new staff profile (administrative or field staff)
- `PUT /api/employees/:id` — Update staff profile details
- `PATCH /api/employees/:id/status` — Update employment status (`Active`, `Inactive`, `On Leave`, `Probation`, `Terminated`)
- `DELETE /api/employees/:id` — Delete employee profile (enforces referential integrity check against active field assignments)

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
