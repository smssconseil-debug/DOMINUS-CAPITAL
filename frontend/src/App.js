import { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/auth/me`, { withCredentials: true })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#050505] text-[#d4af37] text-xl font-bold tracking-widest">INICIANDO SISTEMA GÊNESIS...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      <div className="dark min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-[#d4af37]/30">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Removing Register route as per user request to simplify and just keep 'Saiba Mais' */}
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
