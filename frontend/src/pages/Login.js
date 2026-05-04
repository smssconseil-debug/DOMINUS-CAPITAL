import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../App';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      setUser(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
      <div className="w-full max-w-md rounded-2xl bg-[#111111] p-8 shadow-2xl border border-white/10">
        <div className="mb-8 flex flex-col items-center">
          <div className="rounded-full bg-emerald-500/10 p-3 mb-4">
            <LogIn className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Trading Dashboard</h2>
          <p className="text-gray-400 mt-2 text-sm">Sign in to access your analytics</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="rounded bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{error}</div>}
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
          
          <button 
            data-testid="login-submit-button"
            type="submit" 
            className="mt-6 w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white hover:bg-emerald-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
