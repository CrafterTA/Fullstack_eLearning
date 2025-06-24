
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAuthenticated as checkAuth } from '../services/AuthService';


interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar?: string;
}


interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setAuth: (isAuthenticated: boolean, user: User | null) => void;
}


export const authEventEmitter = {
  listeners: [] as Array<() => void>,
  emit: function () {
    console.log('authEventEmitter emitted'); 
    this.listeners.forEach((listener) => listener());
  },
  subscribe: function (listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkAuth());
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Lỗi khi parse user từ localStorage:', error);
      return null;
    }
  });

  
  const updateAuthStatus = useCallback(() => {
    console.log('updateAuthStatus called'); 
    const authStatus = checkAuth();
    console.log('authStatus:', authStatus);

   
    setIsAuthenticated(authStatus);

   
    if (authStatus) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Lỗi khi parse user từ localStorage:', error);
          setUser(null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
       
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
    }
  }, []);

 
  useEffect(() => {
    updateAuthStatus();

    const unsubscribe = authEventEmitter.subscribe(updateAuthStatus);

    return () => {
      unsubscribe();
    };
  }, [updateAuthStatus]);

 
  const setAuth = useCallback((auth: boolean, userData: User | null) => {
    console.log('setAuth called:', { auth, userData }); // Debug
    setIsAuthenticated(auth);
    setUser(userData);

 
    if (auth && userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }

    
    authEventEmitter.emit();
  }, []);


  const value: AuthContextType = {
    isAuthenticated,
    user,
    setAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};