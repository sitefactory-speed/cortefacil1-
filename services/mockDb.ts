import { User, Service, Appointment, UserRole, AppointmentStatus } from '../types';

// Initial Seed Data
const DEFAULT_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte Clássico',
    price: 50,
    durationMinutes: 30,
    imageUrl: 'https://picsum.photos/400/300?random=1',
    description: 'Corte tradicional com tesoura e acabamento na navalha.'
  },
  {
    id: '2',
    name: 'Barba Terapia',
    price: 40,
    durationMinutes: 30,
    imageUrl: 'https://picsum.photos/400/300?random=2',
    description: 'Modelagem de barba com toalha quente e óleos essenciais.'
  },
  {
    id: '3',
    name: 'Corte + Barba (Combo)',
    price: 80,
    durationMinutes: 50,
    imageUrl: 'https://picsum.photos/400/300?random=3',
    description: 'O pacote completo para o homem moderno.'
  },
  {
    id: '4',
    name: 'Pezinho / Acabamento',
    price: 20,
    durationMinutes: 15,
    imageUrl: 'https://picsum.photos/400/300?random=4',
    description: 'Manutenção rápida dos contornos.'
  }
];

const DEFAULT_ADMIN: User = {
  id: 'admin-1',
  name: 'Mestre Barbeiro',
  email: 'admin@salon.com',
  phone: '11999999999',
  role: UserRole.ADMIN,
  password: '123' 
};

// LocalStorage Keys
const KEYS = {
  USERS: 'salon_users',
  SERVICES: 'salon_services',
  APPOINTMENTS: 'salon_appointments',
  CURRENT_USER: 'salon_current_user'
};

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for compatible IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

class MockDB {
  constructor() {
    this.init();
  }

  private init() {
    // Only set default services if the key truly doesn't exist.
    // If it exists but is an empty array "[]", we respect that (user deleted all).
    if (localStorage.getItem(KEYS.SERVICES) === null) {
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    }
    if (!localStorage.getItem(KEYS.USERS)) {
      const users = [DEFAULT_ADMIN];
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
    if (!localStorage.getItem(KEYS.APPOINTMENTS)) {
      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify([]));
    }
  }

  // --- Auth ---

  async login(email: string, password: string): Promise<User> {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) throw new Error('Credenciais inválidas');
    
    const { password: _, ...safeUser } = user;
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(safeUser));
    return safeUser;
  }

  async register(data: Omit<User, 'id' | 'role'>): Promise<User> {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    
    if (users.find(u => u.email === data.email)) {
      throw new Error('E-mail já cadastrado');
    }

    const newUser: User = {
      ...data,
      id: generateId(),
      role: UserRole.CLIENT
    };

    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(safeUser));
    return safeUser;
  }

  logout() {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  // --- Services ---

  getServices(): Service[] {
    return JSON.parse(localStorage.getItem(KEYS.SERVICES) || '[]');
  }

  async addService(service: Omit<Service, 'id'>): Promise<Service> {
    await delay(300);
    const services = this.getServices();
    const newService = { ...service, id: generateId() };
    services.push(newService);
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
    return newService;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    await delay(300);
    const services = this.getServices();
    const index = services.findIndex(s => String(s.id) === String(id));
    
    if (index === -1) throw new Error("Serviço não encontrado");

    const updatedService = { ...services[index], ...updates };
    services[index] = updatedService;
    
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
    return updatedService;
  }

  async deleteService(id: string): Promise<void> {
    await delay(300);
    let services = this.getServices();
    // Strict string comparison to ensure deletion works for both '1' and '123abcde'
    services = services.filter(s => String(s.id) !== String(id));
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  }

  async deleteAllServices(): Promise<void> {
    await delay(500);
    localStorage.setItem(KEYS.SERVICES, JSON.stringify([]));
  }

  // --- Appointments & Conflicts ---

  getAppointments(): Appointment[] {
    return JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS) || '[]');
  }

  async createAppointment(
    userId: string, 
    userName: string,
    serviceIds: string[], 
    startTimeIso: string
  ): Promise<Appointment> {
    await delay(600);
    const services = this.getServices();
    const selectedServices = services.filter(s => serviceIds.includes(s.id));
    
    if (selectedServices.length === 0) throw new Error("Nenhum serviço selecionado");

    const totalDuration = selectedServices.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);

    const startDate = new Date(startTimeIso);
    const endDate = new Date(startDate.getTime() + totalDuration * 60000);
    const endTimeIso = endDate.toISOString();

    // CONFLICT CHECK
    const allAppointments = this.getAppointments();
    const hasConflict = allAppointments.some(appt => {
      if (appt.status === 'CANCELLED') return false;
      const apptStart = new Date(appt.startTime).getTime();
      const apptEnd = new Date(appt.endTime).getTime();
      const reqStart = startDate.getTime();
      const reqEnd = endDate.getTime();

      // Overlap logic: (StartA < EndB) and (StartB < EndA)
      return (reqStart < apptEnd && apptStart < reqEnd);
    });

    if (hasConflict) {
      throw new Error("Horário indisponível. Por favor, escolha outro horário.");
    }

    const newAppointment: Appointment = {
      id: generateId(),
      userId,
      userName,
      serviceIds,
      totalPrice,
      totalDuration,
      startTime: startTimeIso,
      endTime: endTimeIso,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    allAppointments.push(newAppointment);
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(allAppointments));
    
    return newAppointment;
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
    await delay(300);
    const list = this.getAppointments();
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      list[index].status = status;
      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(list));
    }
  }
}

export const db = new MockDB();