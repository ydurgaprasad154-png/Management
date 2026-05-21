import { Bell, Search } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 bg-primary border-b border-gray-200 sticky top-0 z-10 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-96 border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search projects, invoices..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm placeholder-gray-400 text-secondary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:block text-right mr-2">
          <p className="text-sm font-semibold text-secondary">Acme Corp</p>
          <p className="text-xs text-gray-500">client@acme.com</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-accent text-secondary flex items-center justify-center font-bold">
          A
        </div>
      </div>
    </header>
  );
};

export default Navbar;
