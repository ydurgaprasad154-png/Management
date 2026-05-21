import { Bell, Search, Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 bg-primary border-b border-gray-200 sticky top-0 z-10 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-96 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search clients, projects..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm placeholder-gray-400 text-secondary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
