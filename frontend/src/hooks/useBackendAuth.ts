"use client";

import { useState, useEffect, useCallback } from "react";
import { authService, type AuthUser } from "@/lib/services/auth.service";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  signingOut: boolean;
  isAuthenticated: boolean;
}

export function useBackendAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    signingOut: false,
    isAuthenticated: false,
  });

  // Check for stored user session on mount
  useEffect(() => {
    const checkStoredSession = async () => {
      try {
        // First check if we have a stored token
        if (!authService.hasStoredToken()) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        // Validate the token with the backend
        const validation = await authService.validateToken();
        
        if (validation.success && validation.user) {
          setState(prev => ({
            ...prev,
            user: validation.user!,
            isAuthenticated: true,
            loading: false,
          }));
        } else {
          // Token is invalid, clear local state
          localStorage.removeItem('examcraft-user');
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error validating session:', error);
        // Clear corrupted data
        localStorage.removeItem('examcraft-user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    checkStoredSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await authService.signIn({ email, password });
      
      if (response.success && response.user) {
        // Store user in localStorage for persistence (legacy support)
        localStorage.setItem('examcraft-user', JSON.stringify(response.user));
        
        setState(prev => ({
          ...prev,
          user: response.user!,
          isAuthenticated: true,
          loading: false,
        }));

        return { data: response, error: null };
      } else {
        setState(prev => ({ ...prev, loading: false }));
        return { 
          data: null, 
          error: response.error || response.message || 'Sign in failed' 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({ ...prev, loading: false }));
      return { data: null, error: errorMessage };
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { 
      full_name?: string;
      institution?: string;
      field_of_study?: string;
    }
  ) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await authService.signUp({ 
        email, 
        password, 
        full_name: metadata?.full_name,
        institution: metadata?.institution,
        field_of_study: metadata?.field_of_study,
      });
      
      if (response.success && response.user) {
        // Store user in localStorage for persistence (legacy support)
        localStorage.setItem('examcraft-user', JSON.stringify(response.user));
        
        setState(prev => ({
          ...prev,
          user: response.user!,
          isAuthenticated: true,
          loading: false,
        }));

        return { data: response, error: null };
      } else {
        setState(prev => ({ ...prev, loading: false }));
        return { 
          data: null, 
          error: response.error || response.message || 'Sign up failed' 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setState(prev => ({ ...prev, loading: false }));
      return { data: null, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, signingOut: true }));

    try {
      // Call backend signout endpoint (this will clear tokens)
      await authService.signOut();
      
      // Clear stored session (legacy support)
      localStorage.removeItem('examcraft-user');
      
      setState({
        user: null,
        loading: false,
        signingOut: false,
        isAuthenticated: false,
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setState(prev => ({ ...prev, signingOut: false }));
      return { error: errorMessage };
    }
  }, []);

  const clearAuthState = useCallback(async () => {
    try {
      // Clear localStorage auth data and JWT tokens
      localStorage.removeItem('examcraft-user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      setState({
        user: null,
        loading: false,
        signingOut: false,
        isAuthenticated: false,
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear auth state';
      return { error: errorMessage };
    }
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    signingOut: state.signingOut,
    isAuthenticated: state.isAuthenticated,
    signIn,
    signUp,
    signOut,
    clearAuthState,
  };
}
