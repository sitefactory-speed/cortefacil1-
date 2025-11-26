import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Button } from '../components/Button';
import { Service, Appointment, UserRole } from '../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    durationMinutes: 30,
    imageUrl: '', 
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Delete Item State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null); 

  // Delete ALL State
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setAppointments(db.getAppointments().sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
    setServices(db.getServices());
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    await db.updateAppointmentStatus(id, newStatus);
    refreshData();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      imageUrl: formData.imageUrl || 'https://via.placeholder.com/400x300?text=Sem+Imagem'
    };

    if (editingId) {
      await db.updateService(editingId, finalData);
    } else {
      await db.addService(finalData);
    }

    setEditingId(null);
    setFormData({ name: '', price: 0, durationMinutes: 30, imageUrl: '', description: '' });
    setIsFormOpen(false);
    refreshData();
  };

  const handleEditClick = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
      imageUrl: service.imageUrl,
      description: service.description || ''
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', price: 0, durationMinutes: 30, imageUrl: '', description: '' });
    setIsFormOpen(false);
  };

  const handleRequestDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setDeletingId(itemToDelete);
    try {
      await db.deleteService(itemToDelete);
      setServices(prev => prev.filter(s => String(s.id) !== String(itemToDelete)));
      setItemToDelete(null); 
    } catch (error) {
      console.error(error);
      alert("Erro ao remover serviço.");
      refreshData(); 
    } finally {
      setDeletingId(null);
    }
  };

  const handleRequestDeleteAll = () => {
    setIsDeleteAllModalOpen(true);
  };

  const confirmDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await db.deleteAllServices();
      setServices([]); 
      setIsDeleteAllModalOpen(false);
    } catch (error) {
      alert("Erro ao limpar catálogo.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      
      {/* --- SINGLE DELETE CONFIRMATION MODAL --- */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-dark-800 border border-red-900/50 p-6 rounded-sm max-w-sm w-full shadow-2xl shadow-red-900/20">
            <h3 className="text-xl font-display font-bold text-white uppercase mb-2">Remover Serviço?</h3>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed border-l-2 border-red-600 pl-3">
              Tem certeza que deseja remover este serviço? <br/>
              <span className="text-red-400 font-bold uppercase text-xs">Esta ação é irreversível.</span>
            </p>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1" 
                onClick={() => setItemToDelete(null)}
                disabled={deletingId !== null}
              >
                Cancelar
              </Button>
              <Button 
                variant="danger" 
                className="flex-1" 
                onClick={confirmDelete}
                isLoading={deletingId === itemToDelete}
              >
                CONFIRMAR
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE ALL CONFIRMATION MODAL --- */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-dark-800 border border-red-600 p-6 rounded-sm max-w-sm w-full shadow-2xl shadow-red-900/40">
            <h3 className="text-2xl font-display font-bold text-red-500 uppercase mb-2">ZONA DE PERIGO</h3>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              Você está prestes a apagar <strong>TODO</strong> o catálogo de serviços. <br/>
              Isso excluirá permanentemente todos os itens. Não há volta.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1" 
                onClick={() => setIsDeleteAllModalOpen(false)}
                disabled={isDeletingAll}
              >
                Cancelar
              </Button>
              <Button 
                variant="danger" 
                className="flex-1" 
                onClick={confirmDeleteAll}
                isLoading={isDeletingAll}
              >
                DELETAR TUDO
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Painel Admin</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Controle Gerencial</p>
        </div>
        
        <div className="flex bg-dark-800 p-1 rounded-sm border border-white/5">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'appointments' ? 'bg-brand-600 text-white shadow-glow-sm' : 'text-gray-500 hover:text-white'}`}
          >
            Agendamentos
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'services' ? 'bg-brand-600 text-white shadow-glow-sm' : 'text-gray-500 hover:text-white'}`}
          >
            Catálogo
          </button>
        </div>
      </div>

      {activeTab === 'appointments' ? (
        <div className="glass-panel rounded-sm border-t border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-800 border-b border-dark-700 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="p-5">Cliente</th>
                  <th className="p-5">Data/Hora</th>
                  <th className="p-5">Serviços</th>
                  <th className="p-5">Valor</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {appointments.map(appt => (
                  <tr key={appt.id} className="hover:bg-dark-700/50 transition duration-200">
                    <td className="p-5 font-bold text-white font-display uppercase">{appt.userName}</td>
                    <td className="p-5 text-gray-300 font-mono text-xs">{formatDate(appt.startTime)}</td>
                    <td className="p-5 text-gray-400 text-xs">{appt.serviceIds.length} selecionados</td>
                    <td className="p-5 text-brand-400 font-bold font-display">R$ {appt.totalPrice}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                        appt.status === 'CONFIRMED' ? 'bg-green-900/10 border-green-500/30 text-green-400' : 
                        appt.status === 'CANCELLED' ? 'bg-red-900/10 border-red-500/30 text-red-400' : 'bg-yellow-900/10 border-yellow-500/30 text-yellow-400'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {appt.status !== 'CANCELLED' && (
                        <Button 
                          variant="danger" 
                          className="px-4 py-1.5 text-[10px] h-auto"
                          onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {appointments.length === 0 && <div className="p-12 text-center text-gray-600 uppercase text-xs tracking-widest">Nenhum agendamento encontrado.</div>}
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
             <div className="text-gray-400 text-xs font-mono">
               TOTAL: {services.length} ITEMS
             </div>
             <div className="flex gap-3">
               {services.length > 0 && !isFormOpen && (
                 <Button 
                   variant="ghost" 
                   onClick={handleRequestDeleteAll}
                   isLoading={isDeletingAll}
                   className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                 >
                   LIMPAR CATÁLOGO
                 </Button>
               )}
               {!isFormOpen && (
                 <Button onClick={() => setIsFormOpen(true)} variant="primary">
                   + NOVO SERVIÇO
                 </Button>
               )}
             </div>
          </div>

          {isFormOpen && (
            <form onSubmit={handleSubmitService} className="bg-dark-800 p-8 rounded-sm border-l-4 border-brand-500 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-bl-full pointer-events-none"></div>
              
              <div className="md:col-span-2 flex justify-between items-center mb-4">
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-wide">
                  {editingId ? 'Editar Serviço' : 'Novo Serviço'}
                </h3>
                <button type="button" onClick={handleCancelEdit} className="text-gray-500 hover:text-white transition-colors">
                  ✕ ESC
                </button>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-sm p-3 text-white outline-none focus:border-brand-500 focus:bg-dark-950 transition-colors"/>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Preço (R$)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-dark-900 border border-dark-600 rounded-sm p-3 text-white outline-none focus:border-brand-500 focus:bg-dark-950 transition-colors"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Minutos</label>
                  <input required type="number" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} className="w-full bg-dark-900 border border-dark-600 rounded-sm p-3 text-white outline-none focus:border-brand-500 focus:bg-dark-950 transition-colors"/>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-dark-900 border border-dark-600 rounded-sm p-3 text-white outline-none focus:border-brand-500 focus:bg-dark-950 transition-colors" rows={2}></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {editingId ? 'Trocar Imagem' : 'Imagem do Serviço'}
                </label>
                <div className="flex gap-4 items-center bg-dark-900 p-2 rounded-sm border border-dark-600 border-dashed hover:border-brand-500 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1 w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-sm file:border-0
                      file:text-[10px] file:font-bold file:uppercase
                      file:bg-brand-600 file:text-white
                      hover:file:bg-brand-500
                      cursor-pointer"
                  />
                  {formData.imageUrl && (
                    <button type="button" onClick={handleRemoveImage} className="text-red-400 text-xs hover:text-red-300 font-bold px-4">
                      REMOVER
                    </button>
                  )}
                </div>
              </div>

              {formData.imageUrl && (
                <div className="md:col-span-2 flex justify-center py-4 bg-black/40 rounded-sm">
                  <img src={formData.imageUrl} alt="Preview" className="h-40 object-cover rounded-sm shadow-lg ring-1 ring-white/10" />
                </div>
              )}
              
              <div className="md:col-span-2 pt-4 flex gap-4">
                <Button type="button" variant="secondary" onClick={handleCancelEdit} className="flex-1">CANCELAR</Button>
                <Button type="submit" className="flex-1">
                  {editingId ? 'SALVAR ALTERAÇÕES' : 'CRIAR SERVIÇO'}
                </Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length === 0 && !isFormOpen && (
               <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-600 border-2 border-dark-800 border-dashed rounded-sm bg-dark-900/50">
                 <p className="mb-6 text-xl font-display uppercase font-bold">Catálogo Vazio</p>
                 <Button onClick={() => setIsFormOpen(true)}>Adicionar Primeiro Serviço</Button>
               </div>
            )}
            
            {services.map(service => (
              <div key={service.id} className="bg-dark-800 rounded-sm overflow-hidden border border-dark-700 group hover:border-brand-500 transition-all duration-300 shadow-lg hover:shadow-glow-sm">
                <div className="relative h-48 bg-black overflow-hidden">
                   {service.imageUrl && service.imageUrl !== 'https://via.placeholder.com/400x300?text=Sem+Imagem' ? (
                     <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-dark-900">
                       <span className="text-xs uppercase font-bold">Sem imagem</span>
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent"></div>
                   <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider border border-white/10">
                     {service.durationMinutes} min
                   </div>
                </div>
                <div className="p-5 relative">
                   <div className="absolute -top-6 left-5">
                      <span className="bg-brand-600 text-white font-display font-bold text-lg px-3 py-1 shadow-lg rounded-sm">R$ {service.price}</span>
                   </div>
                   
                   <div className="mt-4">
                     <h3 className="text-lg font-display font-bold text-white uppercase tracking-wide leading-tight group-hover:text-brand-400 transition-colors">{service.name}</h3>
                     <p className="text-gray-500 text-xs mt-2 line-clamp-2 h-8">{service.description}</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3 mt-6">
                     <Button variant="secondary" className="w-full text-[10px] py-2 h-8" onClick={() => handleEditClick(service)}>
                       EDITAR
                     </Button>
                     <Button 
                        variant="danger" 
                        className="w-full text-[10px] py-2 h-8 bg-transparent border-red-900 text-red-700 hover:bg-red-900 hover:text-white" 
                        onClick={() => handleRequestDelete(service.id)}
                        isLoading={deletingId === service.id}
                      >
                       REMOVER
                     </Button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};