import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Inicializa desde localStorage
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [user, setUser] = useState<{ id: string; email: string } | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('https://flask-n5b4.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        // Si la respuesta del servidor no es OK, lanza un error con el mensaje del servidor
        throw new Error(result.message || 'Error desconocido');
      }
  
      if (result.message === 'Login successful') {
        const user = result.user;
        
        // Guarda el estado de autenticación y el usuario
        setIsAuthenticated(true);
        setUser({
          id: user._id,
          email,
          nombre: user.nombre,
          apellido: user.apellido,
        });
  
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: user._id,
            nombre: user.nombre,
            apellido: user.apellido,
            email,
          })
        );
      } else {

        throw new Error('Credenciales incorrectas');
      }
    } catch (error: unknown) {

      if (error instanceof Error) {
        console.error('Error al iniciar sesión:', error.message);
        setIsAuthenticated(false);
        setUser(null);
        
        throw error; 
      } else {
        console.error('Error desconocido');
        setIsAuthenticated(false);
        setUser(null);
        
        throw new Error('Error desconocido');
      }
    }
  };
  
  
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
