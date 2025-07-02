// Simple Backend Auth Hook - Clean and focused on core functionality
"use client";

import { useState, useCallback } from "react";
import { authService, type AuthUser } from "@/lib/services/auth.service";

interface SimpleAuthState {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface SignInResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export function useSimpleAuth() {
  const [state, setState] = useState<SimpleAuthState>(() => {
    // Check for stored user session on initialization (client-side only)
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('examcraft-user');
        if (storedUser) {
          const user = JSON.parse(storedUser) as AuthUser;
          return {
            user,
            loading: false,
            isAuthenticated: true,
          };
        }
      } catch (error) {
        localStorage.removeItem('examcraft-user');
      }
    }
    
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
    };
  });

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await authService.signIn({ email, password });
      
      if (response.success && response.user) {
        // Store user in localStorage (client-side only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('examcraft-user', JSON.stringify(response.user));
        }
        
        setState({
          user: response.user,
          loading: false,
          isAuthenticated: true,
        });

        return { success: true, user: response.user };
      } else {
        setState(prev => ({ ...prev, loading: false }));
        return { 
          success: false, 
          error: response.error || 'Sign in failed' 
        };
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      };
    }
  }, []);

  const signOut = useCallback(() => {
    // Remove user from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('examcraft-user');
    }
    setState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  }, []);

  return {
    ...state,
    signIn,
    signOut,
  };
}
