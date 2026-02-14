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
  login: (identifier: string, password: string) => Promise<boolean>; // เปลี่ยนจาก email เป็น identifier
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // 1. เช็คข้อมูลผู้ใช้จาก localStorage เมื่อโหลด Component
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        return null;
      }
    }
    return null;
  });

  // ฟังก์ชัน Login ที่ส่งค่า 'username' ไปหา Django
  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // ✨ ส่ง Key เป็น 'username' ตามที่ Backend รอรับ
        body: JSON.stringify({ 
          username: identifier, 
          password: password 
        }),
      });

      const data = await response.json();

      // ตรวจสอบความสำเร็จจาก Response
      if (response.ok && data.status === 'success') {
        setUser(data.user); 
        // บันทึกลง localStorage เพื่อให้รีเฟรชหน้าแล้วไม่หลุด
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        // กรณีรหัสผ่านผิด หรือไม่พบ Username
        console.error("Login failed:", data.message || "Invalid credentials");
        return false;
      }
    } catch (error) {
      console.error("Login connection error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
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