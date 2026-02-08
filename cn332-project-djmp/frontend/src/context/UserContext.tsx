import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'resident' | 'officer' | 'technician' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  unit?: string;
  phone?: string;
  joinDate?: string;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock users for different roles
const mockUsers: { [key: string]: User } = {
  'resident@demo.com': {
    id: '1',
    name: 'Sarah Johnson',
    email: 'resident@demo.com',
    role: 'resident',
    unit: 'Unit A-205',
    phone: '+66 81-234-5678',
    joinDate: '2023-01-15',
  },
  'officer@demo.com': {
    id: '2',
    name: 'Michael Chen',
    email: 'officer@demo.com',
    role: 'officer',
    phone: '+66 82-345-6789',
    joinDate: '2022-06-01',
  },
  'technician@demo.com': {
    id: '3',
    name: 'David Martinez',
    email: 'technician@demo.com',
    role: 'technician',
    phone: '+66 83-456-7890',
    joinDate: '2022-09-10',
  },
  'admin@demo.com': {
    id: '4',
    name: 'Jessica Williams',
    email: 'admin@demo.com',
    role: 'admin',
    phone: '+66 84-567-8901',
    joinDate: '2021-03-20',
  },
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    // Simple mock authentication
    const foundUser = mockUsers[email.toLowerCase()];
    if (foundUser && password === 'demo') {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
