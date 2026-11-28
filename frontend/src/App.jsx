import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import FieldOfficersPage from './pages/FieldOfficersPage';
import SavingsPage from './pages/SavingsPage';
import EmployeesPage from './pages/EmployeesPage';
import VerificationPage from './pages/VerificationPage';
import ReceiptsPage from './pages/ReceiptsPage';
import LoansPage from './pages/LoansPage';
import DueOverduePage from './pages/DueOverduePage';
import InstallmentsPage from './pages/InstallmentsPage';
import TransactionsPage from './pages/TransactionsPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/field-officers" element={<FieldOfficersPage />} />
              <Route path="/savings" element={<SavingsPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/receipts" element={<ReceiptsPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/due-overdue" element={<DueOverduePage />} />
              <Route path="/installments" element={<InstallmentsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/users" element={<UsersPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
