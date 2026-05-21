import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Wallet, 
  Wrench, 
  Bell, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/portal', icon: <LayoutDashboard size={20} /> },
    { name: 'My Projects', path: '/portal/projects', icon: <FolderKanban size={20} /> },
    { name: 'Payments & Invoices', path: '/portal/payments', icon: <Wallet size={20} /> },
    { name: 'Services', path: '/portal/services', icon: <Wrench size={20} /> },
    { name: 'Notifications', path: '/portal/notifications', icon: <Bell size={20} /> },
    { name: 'Settings', path: '/portal/settings', icon: <Settings size={20} /> },
  ];

  return (
    <motion.aside 
      animate={{ width: isExpanded ? 240 : 80 }}
      className="bg-primary border-r border-gray-200 h-screen sticky top-0 flex flex-col justify-between shadow-sm z-20"
    >
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {isExpanded && (
            <span className="font-bold text-xl tracking-tight text-secondary">
              Client<span className="text-gray-400">Portal</span>
            </span>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors mx-auto"
          >
            {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-lg transition-colors group
                ${isActive 
                  ? 'bg-secondary text-primary' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-secondary'
                }
              `}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isExpanded && (
                <span className="ml-3 font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
        >
          <LogOut size={20} />
          {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
