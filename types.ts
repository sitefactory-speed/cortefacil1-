export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string; // In a real app, never store plain text
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
  description?: string;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: string;
  userId: string;
  userName: string; // Denormalized for easier display
  serviceIds: string[]; // Can book multiple services
  totalPrice: number;
  totalDuration: number;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  status: AppointmentStatus;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
