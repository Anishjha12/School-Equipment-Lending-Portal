export interface User {
  id: number;
  email: string;
  name: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  createdAt: string;
}

export interface Equipment {
  id: number;
  name: string;
  category: string;
  condition: string;
  quantity: number;
  available: boolean;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  requests?: BorrowRequest[];
}

export interface BorrowRequest {
  id: number;
  userId: number;
  equipmentId: number;
  requestDate: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  purpose: string;
  returnedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  equipment?: Equipment;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  errors?: Array<{ msg: string }>;
}