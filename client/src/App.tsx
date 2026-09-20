import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';

import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsBrowsePage from './pages/JobsBrowsePage';
import JobDetailPage from './pages/JobDetailPage';
import FreelancerProfilePage from './pages/FreelancerProfilePage';
import EditFreelancerProfilePage from './pages/EditFreelancerProfilePage';
import ClientProfilePage from './pages/ClientProfilePage';
import EditClientProfilePage from './pages/EditClientProfilePage';
import DashboardPage from './pages/DashboardPage';
import ClientJobsPage from './pages/ClientJobsPage';
import PostJobPage from './pages/PostJobPage';
import ClientJobProposalsPage from './pages/ClientJobProposalsPage';
import ClientProposalsPage from './pages/ClientProposalsPage';
import ClientContractsPage from './pages/ClientContractsPage';
import FreelancerProposalsPage from './pages/FreelancerProposalsPage';
import FreelancerContractsPage from './pages/FreelancerContractsPage';
import MessagesPage from './pages/MessagesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/jobs" element={<JobsBrowsePage />} />
            <Route path="/jobs/:jobId" element={<JobDetailPage />} />

            <Route path="/freelancers/:freelancerId" element={<FreelancerProfilePage />} />
            <Route path="/clients/:clientId" element={<ClientProfilePage />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

            <Route path="/client/jobs" element={<ProtectedRoute requiredRole="client"><ClientJobsPage /></ProtectedRoute>} />
            <Route path="/client/jobs/new" element={<ProtectedRoute requiredRole="client"><PostJobPage /></ProtectedRoute>} />
            <Route path="/client/jobs/:jobId/edit" element={<ProtectedRoute requiredRole="client"><PostJobPage /></ProtectedRoute>} />
            <Route path="/client/jobs/:jobId/proposals" element={<ProtectedRoute requiredRole="client"><ClientJobProposalsPage /></ProtectedRoute>} />
            <Route path="/client/proposals" element={<ProtectedRoute requiredRole="client"><ClientProposalsPage /></ProtectedRoute>} />
            <Route path="/client/contracts" element={<ProtectedRoute requiredRole="client"><ClientContractsPage /></ProtectedRoute>} />
            <Route path="/client/profile/edit" element={<ProtectedRoute requiredRole="client"><EditClientProfilePage /></ProtectedRoute>} />

            <Route path="/freelancer/proposals" element={<ProtectedRoute requiredRole="freelancer"><FreelancerProposalsPage /></ProtectedRoute>} />
            <Route path="/freelancer/profile/edit" element={<ProtectedRoute requiredRole="freelancer"><EditFreelancerProfilePage /></ProtectedRoute>} />
            <Route path="/freelancer/contracts" element={<ProtectedRoute requiredRole="freelancer"><FreelancerContractsPage /></ProtectedRoute>} />

            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  );
}
