"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService, type AuthUser } from "@/lib/services/auth.service";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  signingOut: boolean;
  isAuthenticated: boolean;
}

// Cross-tab communication constants
const AUTH_BROADCAST_KEY = 'examcraft_auth_change';
const LOGOUT_BROADCAST_KEY = 'examcraft_logout_request';

export function useBackendAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    signingOut: false,
    isAuthenticated: false,
  });

  // Cross-tab communication for auth changes
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Handle auth change broadcast (new user signed in)
      if (event.key === AUTH_BROADCAST_KEY && event.newValue) {
        try {
          const authData = JSON.parse(event.newValue);
          const currentUserId = state.user?.id;
          
          // If this tab has a different user logged in, log them out
          if (currentUserId && currentUserId !== authData.userId) {
            console.log('🔄 Another user signed in, logging out current user...');
            
            // Clear all data immediately
            queryClient.clear();
            sessionStorage.clear();
            
            // Set logout message
            sessionStorage.setItem('signOutMessage', 'You were logged out because another user signed in on a different tab.');
            
            // Clear local state
            setState({
              user: null,
              loading: false,
              signingOut: false,
              isAuthenticated: false,
            });
            
            // Redirect to sign in
            router.push('/auth/signin');
          }
        } catch (error) {
          console.error('Error parsing auth broadcast:', error);
        }
      }
      
      // Handle logout broadcast (user signed out)
      if (event.key === LOGOUT_BROADCAST_KEY && event.newValue) {
        try {
          const logoutData = JSON.parse(event.newValue);
          const currentUserId = state.user?.id;
          
          // If this tab has the same user logged in, log them out
          if (currentUserId && currentUserId === logoutData.userId) {
            console.log('🔄 User signed out in another tab, logging out here too...');
            
            // Clear all data immediately
            queryClient.clear();
            sessionStorage.clear();
            
            // Set logout message
            sessionStorage.setItem('signOutMessage', 'You were logged out from another tab.');
            
            // Clear local state
            setState({
              user: null,
              loading: false,
              signingOut: false,
              isAuthenticated: false,
            });
            
            // Redirect to sign in
            router.push('/auth/signin');
          }
        } catch (error) {
          console.error('Error parsing logout broadcast:', error);
        }
      }
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [state.user?.id, queryClient, router]);

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
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error validating session:', error);
        // Clear local state only
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    checkStoredSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // CRITICAL FIX: Clear any existing user state immediately when starting a new sign-in
    // This prevents showing previous user data during the login process
    setState(prev => ({ 
      ...prev, 
      loading: true,
      user: null,
      isAuthenticated: false 
    }));

    // CRITICAL FIX: Clear all React Query cache to prevent showing previous user data
    queryClient.clear();

    try {
      const response = await authService.signIn({ email, password });
      
      if (response.success && response.user) {
        // Broadcast to other tabs that a new user has signed in
        const authData = {
          userId: response.user.id,
          email: response.user.email,
          timestamp: Date.now(),
        };
        
        // Store in localStorage to trigger storage event in other tabs
        localStorage.setItem(AUTH_BROADCAST_KEY, JSON.stringify(authData));
        
        // Remove the item immediately to keep localStorage clean
        setTimeout(() => {
          localStorage.removeItem(AUTH_BROADCAST_KEY);
        }, 100);

        // Store user in state only (cookies handle persistence)
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
  }, [queryClient]);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { 
      full_name?: string;
      institution?: string;
      field_of_study?: string;
    }
  ) => {
    // CRITICAL FIX: Clear any existing user state immediately when starting a new sign-up
    setState(prev => ({ 
      ...prev, 
      loading: true,
      user: null,
      isAuthenticated: false 
    }));

    // CRITICAL FIX: Clear all React Query cache to prevent showing previous user data
    queryClient.clear();

    try {
      const response = await authService.signUp({ 
        email, 
        password, 
        full_name: metadata?.full_name,
        institution: metadata?.institution,
        field_of_study: metadata?.field_of_study,
      });
      
      if (response.success) {
        // Store user in state only (cookies handle persistence)
        if (response.user) {
          // Broadcast to other tabs that a new user has signed in
          const authData = {
            userId: response.user.id,
            email: response.user.email,
            timestamp: Date.now(),
          };
          
          // Store in localStorage to trigger storage event in other tabs
          localStorage.setItem(AUTH_BROADCAST_KEY, JSON.stringify(authData));
          
          // Remove the item immediately to keep localStorage clean
          setTimeout(() => {
            localStorage.removeItem(AUTH_BROADCAST_KEY);
          }, 100);

          setState(prev => ({
            ...prev,
            user: response.user!,
            isAuthenticated: true,
            loading: false,
          }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }

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
  }, [queryClient]);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, signingOut: true }));

    try {
      // Call backend signout endpoint (this will clear tokens)
      await authService.signOut();
      
      // Broadcast to other tabs that user has signed out
      if (state.user?.id) {
        const logoutData = {
          userId: state.user.id,
          timestamp: Date.now(),
        };
        
        // Store in localStorage to trigger storage event in other tabs
        localStorage.setItem(LOGOUT_BROADCAST_KEY, JSON.stringify(logoutData));
        
        // Remove the item immediately to keep localStorage clean
        setTimeout(() => {
          localStorage.removeItem(LOGOUT_BROADCAST_KEY);
        }, 100);
      }
      
      // CRITICAL FIX: Clear all React Query cache when signing out
      queryClient.clear();
      
      // ENHANCED CLEANUP: Clear browser history and URL parameters
      // This prevents showing previous user's URL parameters to new users
      if (typeof window !== 'undefined') {
        // Clear any URL parameters that might contain user-specific data
        const currentUrl = new URL(window.location.href);
        const hasUserSpecificParams = currentUrl.searchParams.has('topic') || 
                                     currentUrl.searchParams.has('topic_id') ||
                                     currentUrl.searchParams.has('quiz_id') ||
                                     currentUrl.searchParams.has('q') ||
                                     currentUrl.pathname.includes('/quiz/') ||
                                     currentUrl.pathname.includes('/flashcards/study/') ||
                                     currentUrl.pathname.includes('/dashboard/');
        
        if (hasUserSpecificParams) {
          // Replace current URL with clean landing page URL
          window.history.replaceState(null, '', '/');
        }
      }
      
      // Clear local state (cookies are cleared by backend)
      setState({
        user: null,
        loading: false,
        signingOut: false,
        isAuthenticated: false,
      });

      // CONSISTENT REDIRECT: Always redirect to landing page after sign out
      router.push('/');

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setState(prev => ({ ...prev, signingOut: false }));
      return { error: errorMessage };
    }
  }, [queryClient, router, state.user?.id]);

  // Helper function to set sign-out message for other tabs/pages
  const setSignOutMessage = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('signOutMessage', 'You were signed out. Please sign in to continue.');
    }
  }, []);

  const clearAuthState = useCallback(async () => {
    try {
      // CRITICAL FIX: Clear all React Query cache when clearing auth state
      queryClient.clear();
      
      // ENHANCED CLEANUP: Clear browser history and URL parameters
      if (typeof window !== 'undefined') {
        const currentUrl = new URL(window.location.href);
        const hasUserSpecificParams = currentUrl.searchParams.has('topic') || 
                                     currentUrl.searchParams.has('topic_id') ||
                                     currentUrl.searchParams.has('quiz_id') ||
                                     currentUrl.searchParams.has('q') ||
                                     currentUrl.pathname.includes('/quiz/') ||
                                     currentUrl.pathname.includes('/flashcards/study/') ||
                                     currentUrl.pathname.includes('/dashboard/');
        
        if (hasUserSpecificParams) {
          window.history.replaceState(null, '', '/');
        }
      }
      
      // Clear local state only (cookies are handled by backend)
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
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          user: response.data,
          isAuthenticated: true,
        }));
        return { error: null };
      } else {
        return { error: response.error || 'Failed to refresh user data' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh user data';
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
    setSignOutMessage,
    refreshUser,
  };
}
