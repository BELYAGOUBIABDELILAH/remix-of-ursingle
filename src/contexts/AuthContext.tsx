import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'patient' | 'provider' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'patient' | 'provider') => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'cityhealth_auth_user';
const USERS_KEY = 'cityhealth_users';

const getMockUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMockUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const users = getMockUsers();
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('Email ou mot de passe incorrect');
      }

      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
      toast.success('Connexion réussie!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de la connexion';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'patient' | 'provider') => {
    setIsLoading(true);
    try {
      const users = getMockUsers();
      
      if (users.some(u => u.email === email)) {
        throw new Error('Un compte existe déjà avec cet email');
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveMockUsers(users);
      
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      toast.success('Compte créé avec succès!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de l\'inscription';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const mockGoogleUser: User = {
        id: crypto.randomUUID(),
        email: 'demo@gmail.com',
        name: 'Utilisateur Demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        role: 'patient',
        createdAt: new Date().toISOString(),
      };

      const users = getMockUsers();
      const existingUser = users.find(u => u.email === mockGoogleUser.email);
      
      const finalUser = existingUser || mockGoogleUser;
      
      if (!existingUser) {
        users.push(mockGoogleUser);
        saveMockUsers(users);
      }

      setUser(finalUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalUser));
      toast.success('Connexion Google réussie!');
    } catch (error) {
      toast.error('Échec de la connexion Google');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Échec de la déconnexion');
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      const users = getMockUsers();
      const index = users.findIndex(u => u.id === user.id);
      
      if (index !== -1) {
        users[index] = updatedUser;
        saveMockUsers(users);
      }

      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Échec de la mise à jour du profil');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
