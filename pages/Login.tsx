import React, { useState } from 'react';
import { db } from '../services/mockDb';
import { Button } from '../components/Button';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Correção: Usar caminho absoluto
  const logoImg = "/logo.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await db.login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/12301/12301351.png"; // Fallback icon
    e.currentTarget.onerror = null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1503951914290-934c487a1716?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/90 to-dark-900/60"></div>
      
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-sm shadow-2xl border-t border-white/10 animate-slide-up">
        
        {/* HEADER: LOGO LADO A LADO COM O TEXTO */}
        <div className="flex flex-row items-center justify-center gap-5 mb-10">
            {/* Logo Image */}
            <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-brand-500 blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-500"></div>
                <img 
                  src={logoImg}
                  onError={handleImageError}
                  alt="Logo Corte Fácil" 
                  className="w-20 h-20 object-contain relative z-10 drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300" 
                />
            </div>
            
            {/* Texto à Direita */}
            <div className="flex flex-col items-start">
                <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase leading-none">
                    CORTE <span className="text-brand-500">FÁCIL</span>
                </h1>
                <div className="h-0.5 w-full bg-gradient-to-r from-brand-500 to-transparent mt-1 mb-1"></div>
                <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase font-bold">Acesso Exclusivo</p>
            </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border-l-2 border-red-500 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-brand-500 transition-colors">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:bg-dark-700 outline-none transition-all duration-300"
              placeholder="seu@email.com"
            />
          </div>
          
          <div className="group">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-brand-500 transition-colors">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:bg-dark-700 outline-none transition-all duration-300"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full shadow-glow-sm" isLoading={loading}>
            ACESSAR SISTEMA
          </Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/5">
          <p className="text-sm text-gray-500">
            Ainda não é membro?{' '}
            <button onClick={onNavigateRegister} className="text-white hover:text-brand-400 font-bold uppercase tracking-wide transition-colors ml-1">
              Criar Conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};