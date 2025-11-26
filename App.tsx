import React, { useState, useEffect } from 'react';
import { db } from './services/mockDb';
import { User, UserRole } from './types';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ClientDashboard } from './pages/ClientDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [loading, setLoading] = useState(true);

  // Correção: Usar caminho absoluto em vez de import para evitar crash
  const logoImg = "/logo.png";
  const FALLBACK_LOGO = "https://cdn-icons-png.flaticon.com/512/12301/12301351.png";

  useEffect(() => {
    // Check for persisted session
    const currentUser = db.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setView('dashboard');
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
    setView('login');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_LOGO;
    e.currentTarget.onerror = null; 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse">
           <img 
             src={logoImg} 
             onError={handleImageError}
             alt="Corte Fácil" 
             className="w-24 h-24 mb-4 object-contain" 
           />
           <span className="font-display font-bold text-3xl text-white tracking-widest">CORTE <span className="text-brand-500">FÁCIL</span></span>
        </div>
      </div>
    );
  }

  // --- Authenticated Views ---
  if (user && view === 'dashboard') {
    return (
      <div className="min-h-screen bg-dark-900 text-gray-200 font-sans selection:bg-brand-500 selection:text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-dark-900">
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 glass-panel border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="relative group cursor-pointer">
                 <div className="absolute -inset-1 bg-brand-500 rounded blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                 <img 
                   src={logoImg}
                   onError={handleImageError}
                   alt="Logo" 
                   className="h-10 w-auto relative z-10 object-contain" 
                 />
              </div>
              <span className="hidden md:block font-display font-bold text-xl text-white tracking-wider">
                CORTE <span className="text-brand-500">FÁCIL</span>
              </span>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="hidden md:block text-right">
                 <p className="text-sm font-display font-bold text-white uppercase tracking-wide">{user.name}</p>
                 <p className="text-xs text-brand-400 font-medium">{user.role === UserRole.ADMIN ? 'DONO / ADMIN' : 'CLIENTE VIP'}</p>
               </div>
               <Button variant="ghost" onClick={handleLogout} className="text-xs border border-white/10 hover:border-brand-500 hover:bg-dark-800">
                 SAIR
               </Button>
            </div>
          </div>
        </nav>

        {/* Dynamic Dashboard based on Role */}
        <main className="relative z-10">
          {user.role === UserRole.ADMIN ? (
            <AdminDashboard />
          ) : (
            <ClientDashboard user={user} />
          )}
        </main>
      </div>
    );
  }

  // --- Public Views ---
  if (view === 'register') {
    return <Register onLogin={handleLogin} onNavigateLogin={() => setView('login')} />;
  }

  return <Login onLogin={handleLogin} onNavigateRegister={() => setView('register')} />;
};

export default App;