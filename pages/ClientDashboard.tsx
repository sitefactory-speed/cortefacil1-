import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Button } from '../components/Button';
import { User, Service, Appointment } from '../types';

interface ClientDashboardProps {
  user: User;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    setServices(db.getServices());
    refreshAppointments();
  }, [user.id]);

  const refreshAppointments = () => {
    const all = db.getAppointments();
    setAppointments(all.filter(a => a.userId === user.id).sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
  };

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const calculateTotals = () => {
    const selected = services.filter(s => selectedServices.includes(s.id));
    return {
      price: selected.reduce((acc, s) => acc + s.price, 0),
      duration: selected.reduce((acc, s) => acc + s.durationMinutes, 0)
    };
  };

  const handleBooking = async () => {
    if (selectedServices.length === 0 || !date || !time) {
      setMessage({ type: 'error', text: 'Preencha todos os campos.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const startIso = `${date}T${time}:00`;

    try {
      await db.createAppointment(user.id, user.name, selectedServices, startIso);
      setMessage({ type: 'success', text: 'Agendamento confirmado. Aguardamos você!' });
      setSelectedServices([]);
      setDate('');
      setTime('');
      refreshAppointments();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const { price, duration } = calculateTotals();

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight">
            Bem-vindo, <span className="text-brand-500">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium tracking-wide">SELECIONE O TRATAMENTO PARA HOJE</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-sm border ${message.type === 'success' ? 'bg-green-900/20 border-green-500/50 text-green-300' : 'bg-red-900/20 border-red-500/50 text-red-300'} animate-slide-up`}>
          <span className="font-bold uppercase tracking-wider text-xs mr-2">{message.type === 'success' ? 'SUCESSO' : 'ERRO'}</span>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Services Grid */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold">1</span>
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-wide">SERVIÇOS DISPONÍVEIS</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {services.map(service => (
                <div 
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`
                    relative cursor-pointer group rounded-sm overflow-hidden border transition-all duration-300 
                    ${selectedServices.includes(service.id) 
                      ? 'border-brand-500 bg-dark-800 shadow-glow-sm' 
                      : 'border-dark-600 bg-dark-800/40 hover:border-gray-500 hover:bg-dark-800'
                    }
                  `}
                >
                  <div className="flex items-stretch h-32">
                    <div className="w-32 relative overflow-hidden">
                       <div className="absolute inset-0 bg-brand-900/20 mix-blend-overlay z-10"></div>
                       <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-400 transition-colors leading-tight uppercase">{service.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-brand-500 font-display font-bold text-xl">R$ {service.price}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-sm">{service.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>
                  {/* Selection Indicator */}
                  <div className={`absolute top-0 right-0 p-2 transition-all duration-300 ${selectedServices.includes(service.id) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <div className="bg-brand-500 text-white p-1 rounded-sm shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Date & Time Picker */}
          <section className="glass-panel p-6 rounded-sm border-t border-white/10">
             <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold">2</span>
              <h2 className="text-xl font-display font-bold text-white uppercase tracking-wide">AGENDA</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Data</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-sm p-3 text-white focus:border-brand-500 outline-none uppercase text-sm" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Horário</label>
                <input 
                  type="time" 
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-sm p-3 text-white focus:border-brand-500 outline-none uppercase text-sm" 
                />
              </div>
            </div>
            
            {/* Summary & Action */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-8">
                <div>
                   <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Valor Total</span>
                   <span className="text-2xl font-display font-bold text-brand-400">R$ {price}</span>
                </div>
                <div>
                   <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Tempo Total</span>
                   <span className="text-2xl font-display font-bold text-white">{duration} <span className="text-sm font-sans font-normal text-gray-500">min</span></span>
                </div>
              </div>
              <Button onClick={handleBooking} isLoading={loading} disabled={selectedServices.length === 0} className="w-full md:w-auto px-10">
                CONFIRMAR AGENDAMENTO
              </Button>
            </div>
          </section>
        </div>

        {/* Sidebar History */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-sm border border-white/5 sticky top-24">
            <div className="p-5 border-b border-white/5 bg-dark-800/50">
              <h2 className="font-display font-bold text-white uppercase tracking-wider text-sm">SEUS AGENDAMENTOS</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {appointments.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <svg className="w-12 h-12 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="text-xs text-gray-500 uppercase">Nenhum histórico</p>
                </div>
              ) : (
                appointments.map(appt => (
                  <div key={appt.id} className="bg-dark-900 p-4 rounded-sm border-l-2 border-l-brand-500 border-t border-r border-b border-dark-700 hover:bg-dark-800 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${appt.status === 'CONFIRMED' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {appt.status === 'CONFIRMED' ? 'CONFIRMADO' : appt.status}
                      </span>
                      <span className="text-gray-400 text-xs font-bold">R$ {appt.totalPrice}</span>
                    </div>
                    <p className="text-white font-display font-bold text-lg">{formatDate(appt.startTime)}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span className="w-1 h-1 bg-brand-500 rounded-full"></span>
                      {appt.serviceIds.length} serviços 
                      <span className="w-1 h-1 bg-brand-500 rounded-full"></span>
                      {appt.totalDuration} min
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};