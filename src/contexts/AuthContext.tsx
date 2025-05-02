
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signOut: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('invoiceUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock authentication - In production this would call an API
    try {
      setLoading(true);
      // For demo purposes only - in real app this would be validated on server
      if (email === 'demo@example.com' && password === 'password') {
        const mockUser: User = {
          id: 'user-1',
          email: email,
          name: 'Demo User',
          role: 'admin'
        };
        setUser(mockUser);
        localStorage.setItem('invoiceUser', JSON.stringify(mockUser));
        toast({
          title: "Success",
          description: "You have successfully signed in!",
        });
        navigate('/app');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, name: string, password: string) => {
    try {
      setLoading(true);
      // Mock sign-up - In production this would call an API
      const mockUser: User = {
        id: 'user-' + Date.now(),
        email: email,
        name: name,
        role: 'admin'
      };
      setUser(mockUser);
      localStorage.setItem('invoiceUser', JSON.stringify(mockUser));
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      navigate('/app');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('invoiceUser');
    navigate('/');
  };

  const forgotPassword = async (email: string) => {
    try {
      // Mock password reset - In production this would call an API
      toast({
        title: "Password reset email sent",
        description: "If an account with that email exists, we've sent a password reset link.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
