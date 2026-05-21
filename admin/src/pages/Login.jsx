import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4">
      <div className="bg-primary w-full max-w-md p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-secondary">
            HFM<span className="text-gray-400">Admin</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to the control center</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all" 
              placeholder="admin@heven.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 px-4 bg-secondary text-primary rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
