import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PartnerProvider } from './contexts/PartnerContext';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewPartner } from './pages/NewPartner';
import { PartnersList } from './pages/PartnersList';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <PartnerProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/partners" element={<PartnersList />} />
                  <Route path="/partners/new" element={<NewPartner />} />
                  <Route path="/partners/final-registration" element={<div className="p-8 text-center text-gray-500">Página em desenvolvimento</div>} />
                  <Route path="/partners/training" element={<div className="p-8 text-center text-gray-500">Página em desenvolvimento</div>} />
                  <Route path="/reports" element={<div className="p-8 text-center text-gray-500">Página em desenvolvimento</div>} />
                  <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Página em desenvolvimento</div>} />
                </Routes>
              </Layout>
            </PartnerProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;