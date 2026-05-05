import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../App';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', interest: ''
  });
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/auth/register`, formData, { withCredentials: true });
      setUser(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao cadastrar');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#050505] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] py-12">
      <div className="w-full max-w-lg rounded-2xl bg-[#0a0a0a] p-8 shadow-[0_0_40px_rgba(212,175,55,0.1)] border border-[#d4af37]/30">
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-full bg-[#d4af37]/10 p-3 mb-4">
            <UserPlus className="h-8 w-8 text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Cadastro Gênesis</h2>
          <p className="text-gray-400 mt-2 text-sm text-center">Cadastre-se para ver o histórico de 16 meses e solicitar acesso</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {error && <div className="rounded bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{error}</div>}
          
          <div>
            <label className="mb-1 block text-sm font-medium text-[#d4af37]">Nome Completo</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full rounded-lg border border-white/10 bg-[#111] p-2.5 text-white focus:border-[#d4af37] focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#d4af37]">Email</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-lg border border-white/10 bg-[#111] p-2.5 text-white focus:border-[#d4af37] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#d4af37]">WhatsApp</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full rounded-lg border border-white/10 bg-[#111] p-2.5 text-white focus:border-[#d4af37] focus:outline-none" />
            </div>
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-[#d4af37]">Senha</label>
            <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full rounded-lg border border-white/10 bg-[#111] p-2.5 text-white focus:border-[#d4af37] focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#d4af37]">Qual o seu interesse?</label>
            <select required value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value})}
              className="w-full rounded-lg border border-white/10 bg-[#111] p-2.5 text-white focus:border-[#d4af37] focus:outline-none">
              <option value="" disabled>Selecione uma opção...</option>
              <option value="Quero automatizar meus trades">Quero automatizar meus trades</option>
              <option value="Busco diversificação de investimentos">Busco diversificação de investimentos</option>
              <option value="Quero renda extra passiva">Quero renda extra passiva</option>
              <option value="Sou investidor profissional avaliando ferramentas">Sou investidor profissional avaliando ferramentas</option>
              <option value="Apenas curiosidade">Apenas curiosidade</option>
            </select>
          </div>
          
          <button type="submit" 
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b5952f] p-3 font-bold text-black uppercase tracking-wider hover:opacity-90 transition-all">
            Criar Conta
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          Já possui conta? <Link to="/login" className="text-[#d4af37] hover:underline">Faça login</Link>
        </div>
      </div>
    </div>
  );
}
