import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../App';
import { useNavigate, Link } from 'react-router-dom';
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
      setError(err.response?.data?.detail || 'Login falhou');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#050505] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <div className="w-full max-w-md rounded-2xl bg-[#0a0a0a] p-8 shadow-[0_0_40px_rgba(212,175,55,0.1)] border border-[#d4af37]/30">
        <div className="mb-8 flex flex-col items-center">
          <div className="rounded-full bg-[#d4af37]/10 p-3 mb-4">
            <LogIn className="h-8 w-8 text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Acesso Gênesis</h2>
          <p className="text-gray-400 mt-2 text-sm text-center">Entre para acessar seu histórico completo de operações</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="rounded bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{error}</div>}
          
          <div>
            <label className="mb-1 block text-sm font-medium text-[#d4af37]">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#111] p-3 text-white focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-[#d4af37]">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#111] p-3 text-white focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
            />
          </div>
          
          <button 
            type="submit" 
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b5952f] p-3 font-bold text-black uppercase tracking-wider hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Entrar no Sistema
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Ainda não tem conta? <Link to="/register" className="text-[#d4af37] hover:underline">Cadastre-se aqui</Link><br/>
          <Link to="/" className="text-gray-400 hover:text-white mt-3 inline-block">Voltar ao Painel Público</Link>
        </div>
      </div>
    </div>
  );
}
