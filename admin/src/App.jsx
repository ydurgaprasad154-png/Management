import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Financials from './pages/Financials';
import Domains from './pages/Domains';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import CMS from './pages/CMS';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects" element={<Projects />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="cms" element={<CMS />} />
          <Route path="financials" element={<Financials />} />
          <Route path="domains" element={<Domains />} />
          <Route path="services" element={<Services />} />
          <Route path="notifications" element={<div className="p-4 bg-primary rounded-xl shadow-sm">Notifications Page (Under Construction)</div>} />
          <Route path="settings" element={<div className="p-4 bg-primary rounded-xl shadow-sm">Settings Page (Under Construction)</div>} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
