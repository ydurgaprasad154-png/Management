import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, Mail, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import api from '../../utils/api';

// Custom inline SVG icons because lucide-react v1.0.0+ does not export brand icons
const Github = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// Custom Cursor Component
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };
    const onMouseEnter = () => setHidden(false);
    const onMouseLeave = () => setHidden(true);
    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    // Clickable hover effects
    const clickables = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
    const onLinkEnter = () => setLinkHovered(true);
    const onLinkLeave = () => setLinkHovered(false);

    clickables.forEach((el) => {
      el.addEventListener('mouseenter', onLinkEnter);
      el.addEventListener('mouseleave', onLinkLeave);
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      clickables.forEach((el) => {
        el.removeEventListener('mouseenter', onLinkEnter);
        el.removeEventListener('mouseleave', onLinkLeave);
      });
    };
  }, []);

  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null; // Touch device
  }

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-50 border border-gold-premium mix-blend-difference hidden md:block"
      animate={{
        x: position.x - 12,
        y: position.y - 12,
        scale: clicked ? 0.75 : linkHovered ? 1.6 : 1,
        backgroundColor: linkHovered ? 'rgba(197, 168, 90, 0.25)' : 'rgba(0,0,0,0)',
      }}
      transition={{ type: 'spring', stiffness: 600, damping: 30, mass: 0.1 }}
    />
  );
};

// Main Layout Component
const PortfolioLayout = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

  // Scroll animations progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Sync theme class
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    fetchSettings();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/homepage-settings');
      setSettings(data);
    } catch (err) {
      console.error('Error loading layout settings:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-primary text-secondary'
    }`}>
      {/* Custom cursor */}
      <CustomCursor />

      {/* Sticky Header with Scroll Indicator */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled 
          ? 'py-4 bg-[#0A0A0A]/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 shadow-lg' 
          : 'py-6 bg-transparent'
      }`}>
        {/* Scroll Progress Bar */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-premium via-gold to-gold-light origin-left"
          style={{ scaleX }}
        />

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold tracking-widest flex items-center gap-1.5 group">
            <span className="text-white dark:text-white">HEVEN</span>
            <span className="text-gold-premium">STUDIOS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gold-premium group-hover:scale-150 transition-transform"></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  text-sm font-semibold tracking-wider uppercase transition-all relative py-1
                  ${isActive 
                    ? 'text-gold-premium' 
                    : 'text-gray-400 hover:text-white dark:hover:text-white hover:scale-105'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {item.name}
                    {isActive && (
                      <motion.span 
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gold-premium"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-white/5 transition-colors border border-white/10"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-gold-premium" /> : <Moon size={18} className="text-gray-600" />}
            </button>

            {/* Client Portal CTA */}
            <Link 
              to="/login"
              className="px-5 py-2 text-xs font-bold tracking-widest uppercase border border-gold-premium text-gold-premium hover:bg-gold-premium hover:text-black transition-all rounded-full"
            >
              Client Login
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} className="text-gold-premium" /> : <Moon size={18} className="text-gray-400" />}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors text-white dark:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-[60px] z-30 bg-[#0A0A0A] border-t border-white/5 flex flex-col justify-between p-8 md:hidden"
          >
            <nav className="flex flex-col gap-6 pt-10">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    text-2xl font-bold tracking-widest uppercase transition-all
                    ${isActive ? 'text-gold-premium pl-4 border-l-2 border-gold-premium' : 'text-gray-400 hover:text-white'}
                  `}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="flex flex-col gap-4 mt-auto">
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-4 bg-gold-premium text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-gold-light transition-all"
              >
                Client Portal Login
              </Link>
              <div className="text-center text-xs text-gray-500 py-2">
                © {new Date().getFullYear()} Heven Studios. All Rights Reserved.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pages Content */}
      <main className="pt-24 min-h-[calc(100vh-380px)]">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-white/5 bg-[#050505] text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="text-lg font-bold tracking-widest flex items-center gap-1.5 text-white">
              <span>HEVEN</span>
              <span className="text-gold-premium">STUDIOS</span>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm text-gray-500">
              We engineer luxury digital experiences, tailoring high-performance web systems, applications, and bespoke branding for clients worldwide.
            </p>
            <div className="flex gap-4 pt-2">
              <a href={settings?.socialGithub || "https://github.com"} target="_blank" rel="noreferrer" className="hover:text-gold-premium transition-colors"><Github size={18} /></a>
              <a href={settings?.socialLinkedin || "https://linkedin.com"} target="_blank" rel="noreferrer" className="hover:text-gold-premium transition-colors"><Linkedin size={18} /></a>
              <a href={settings?.socialTwitter || "https://twitter.com"} target="_blank" rel="noreferrer" className="hover:text-gold-premium transition-colors"><Twitter size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h4>
            <ul className="space-y-2 text-xs">
              {navItems.map(item => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-gold-premium transition-colors flex items-center gap-1">
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/login" className="hover:text-gold-premium transition-colors">Client Portal</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contact Agency</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-gold-premium" />
                <span>{settings?.contactEmail || 'hello@hevenstudios.com'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-gold-premium" />
                <span>{settings?.contactPhone || '+1 (555) 234-5678'}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-gold-premium" />
                <span>{settings?.contactAddress || '120 Broadway, Suite 4000, New York, NY'}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Join Our Club</h4>
            <p className="text-xs text-gray-500">Get private agency updates, design advice, and tech insight directly.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }} className="flex gap-2">
              <input 
                type="email" 
                required
                placeholder="Email address"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-premium flex-1"
              />
              <button 
                type="submit" 
                className="px-3 py-2 bg-gold-premium hover:bg-gold-light text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 gap-4">
          <div>
            © {new Date().getFullYear()} Heven Studios. Made for luxury agencies.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortfolioLayout;
