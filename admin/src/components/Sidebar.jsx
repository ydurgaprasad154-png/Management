import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Briefcase,
  Wallet,
  Globe,
  Wrench,
  Bell,
  Settings,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Clients', path: '/clients', icon: <Users size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={20} /> },
    { name: 'Portfolio', path: '/portfolio', icon: <Briefcase size={20} /> },
    { name: 'Website CMS', path: '/cms', icon: <Layers size={20} /> },
    { name: 'Financials', path: '/financials', icon: <Wallet size={20} /> },
    { name: 'Domains', path: '/domains', icon: <Globe size={20} /> },
    { name: 'Services', path: '/services', icon: <Wrench size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
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
              HFM<span className="text-gray-400">Admin</span>
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

      {/* Admin Profile Snippet */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center ${!isExpanded && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
            A
          </div>
          {isExpanded && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-secondary truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@heven.com</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
