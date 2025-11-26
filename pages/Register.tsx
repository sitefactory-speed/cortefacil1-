import React, { useState } from 'react';
import { db } from '../services/mockDb';
import { Button } from '../components/Button';
import { User } from '../types';

interface RegisterProps {
  onLogin: (user: User) => void;
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onLogin, onNavigateLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Correção: Usar caminho absoluto
  const logoImg = "/logo.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await db.register(formData);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
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
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1599351431202-6e0c06e71511?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-900/95 to-dark-900/80"></div>
      
      <div className="relative z-10 w-full max-w-md glass-panel p-8 rounded-sm shadow-2xl border-t border-white/10 animate-fade-in">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <div className="relative group">
                <div className="absolute inset-0 bg-brand-500 blur-lg opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>
                <img 
                  src={logoImg} 
                  onError={handleImageError}
                  alt="Logo" 
                  className="h-16 w-auto relative z-10 object-contain" 
                />
             </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-wide uppercase mb-2">
            Novo <span className="text-brand-500">Membro</span>
          </h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase">Preencha seus dados para acesso</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border-l-2 border-red-500 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-2.5 text-white focus:border-brand-500 focus:bg-dark-700 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">E-mail</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-2.5 text-white focus:border-brand-500 focus:bg-dark-700 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">WhatsApp</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-2.5 text-white focus:border-brand-500 focus:bg-dark-700 outline-none transition-all"
              placeholder="(11) 99999-9999"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Senha</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-dark-800 border border-dark-600 rounded-sm px-4 py-2.5 text-white focus:border-brand-500 focus:bg-dark-700 outline-none transition-all"
            />
          </div>

          <Button type="submit" className="w-full mt-4" isLoading={loading}>
            FINALIZAR CADASTRO
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-4">
          <p className="text-sm text-gray-500">
            Já possui cadastro?{' '}
            <button onClick={onNavigateLogin} className="text-white hover:text-brand-400 font-bold uppercase tracking-wide transition-colors">
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};