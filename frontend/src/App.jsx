import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Payments from './pages/Payments';
import Projects from './pages/Projects';
import Services from './pages/Services';

// Public Portfolio Pages and Layout
import PortfolioLayout from './components/portfolio/PortfolioLayout';
import Home from './pages/portfolio/Home';
import ProjectsListing from './pages/portfolio/ProjectsListing';
import ProjectDetails from './pages/portfolio/ProjectDetails';
import About from './pages/portfolio/About';
import Contact from './pages/portfolio/Contact';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public Portfolio Website */}
      <Route path="/" element={<PortfolioLayout />}>
        <Route index element={<Home />} />
        <Route path="projects" element={<ProjectsListing />} />
        <Route path="projects/:slug" element={<ProjectDetails />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* Login Flow */}
      <Route path="/login" element={user ? <Navigate to="/portal" /> : <Login />} />
      
      {/* Protected Client Portal Routes under /portal */}
      <Route path="/portal" element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="payments" element={<Payments />} />
          <Route path="services" element={<Services />} />
          <Route path="notifications" element={
            <div className="bg-primary rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
              <p className="text-sm">No notifications yet.</p>
            </div>
          } />
          <Route path="settings" element={
            <div className="bg-primary rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
              <p className="text-sm">Settings coming soon.</p>
            </div>
          } />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
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
