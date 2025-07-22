import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBackendAuth } from '../useBackendAuth';
import { authService } from '@/lib/services/auth.service';

// Mock the auth service
jest.mock('@/lib/services/auth.service', () => ({
    authService: {
        hasStoredToken: jest.fn(),
        validateToken: jest.fn(),
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
    },
}));
const mockedAuthService = authService as jest.Mocked<typeof authService>;

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
}));

// Create a wrapper component for testing
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('useBackendAuth', () => {
    let Wrapper: ReturnType<typeof createWrapper>;

    beforeEach(() => {
        jest.clearAllMocks();
        Wrapper = createWrapper();
    });

    it('should have initial state', async () => {
        // Mock to return false so useEffect completes quickly
        mockedAuthService.hasStoredToken.mockReturnValue(false);
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        // Test the final state after useEffect completes
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.signingOut).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set loading to false if no stored token', async () => {
        mockedAuthService.hasStoredToken.mockReturnValue(false);
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            // Wait for the useEffect to complete
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(result.current.loading).toBe(false);
    });

    it('should set user and isAuthenticated if token is valid', async () => {
        mockedAuthService.hasStoredToken.mockReturnValue(true);
        mockedAuthService.validateToken.mockResolvedValue({
            success: true,
            user: { id: '1', email: 'test@example.com' }
        });
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(result.current.user).toEqual({ id: '1', email: 'test@example.com' });
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.loading).toBe(false);
    });

    it('should set loading to false if token is invalid', async () => {
        mockedAuthService.hasStoredToken.mockReturnValue(true);
        mockedAuthService.validateToken.mockResolvedValue({
            success: false,
            user: null
        });
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    it('should handle error during token validation', async () => {
        mockedAuthService.hasStoredToken.mockReturnValue(true);
        mockedAuthService.validateToken.mockRejectedValue(new Error('Network error'));
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    it('signIn: should set user and isAuthenticated on success', async () => {
        mockedAuthService.signIn.mockResolvedValue({
            success: true,
            user: { id: '1', email: 'test@example.com' }
        });
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            const response = await result.current.signIn('test@example.com', 'password');
            expect(response.data?.success).toBe(true);
        });
        
        expect(result.current.user).toEqual({ id: '1', email: 'test@example.com' });
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.loading).toBe(false);
    });

    it('signIn: should handle error', async () => {
        mockedAuthService.signIn.mockResolvedValue({
            success: false,
            error: 'Invalid credentials'
        });
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            const response = await result.current.signIn('test@example.com', 'password');
            expect(response.error).toBe('Invalid credentials');
        });
        
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    it('signUp: should set user and isAuthenticated on success', async () => {
        mockedAuthService.signUp.mockResolvedValue({
            success: true,
            user: { id: '1', email: 'test@example.com' }
        });
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            const response = await result.current.signUp('test@example.com', 'password');
            expect(response.data?.success).toBe(true);
        });
        
        expect(result.current.user).toEqual({ id: '1', email: 'test@example.com' });
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.loading).toBe(false);
    });

    it('signUp: should handle error', async () => {
        mockedAuthService.signUp.mockResolvedValue({
            success: false,
            error: 'Email already exists'
        });
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            const response = await result.current.signUp('test@example.com', 'password');
            expect(response.error).toBe('Email already exists');
        });
        
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    it('signOut: should clear user state', async () => {
        mockedAuthService.signOut.mockResolvedValue({ success: true, message: 'Signed out' });
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            await result.current.signOut();
        });
        
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
        expect(result.current.signingOut).toBe(false);
    });

    it('signOut: should handle error', async () => {
        mockedAuthService.signOut.mockRejectedValue(new Error('fail'));
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            const res = await result.current.signOut();
            expect(res.error).toBe('fail');
        });
        
        expect(result.current.signingOut).toBe(false);
    });

    it('clearAuthState: should clear all auth state', async () => {
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            await result.current.clearAuthState();
        });
        
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
        expect(result.current.signingOut).toBe(false);
    });

    it('should call authService methods correctly', async () => {
        mockedAuthService.hasStoredToken.mockReturnValue(true);
        mockedAuthService.validateToken.mockResolvedValue({ success: true, user: { id: '1', email: 'test@example.com' } });
        
        renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        await act(async () => { });
        
        expect(mockedAuthService.hasStoredToken).toHaveBeenCalled();
        expect(mockedAuthService.validateToken).toHaveBeenCalled();
    });

    it('should handle signIn with authService correctly', async () => {
        mockedAuthService.signIn.mockResolvedValue({
            success: true,
            user: { id: '1', email: 'test@example.com' }
        });
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            await result.current.signIn('test@example.com', 'password');
        });
        
        expect(mockedAuthService.signIn).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password'
        });
    });

    it('should handle signUp with authService correctly', async () => {
        mockedAuthService.signUp.mockResolvedValue({
            success: true,
            user: { id: '1', email: 'test@example.com' }
        });
        
        const { result } = renderHook(() => useBackendAuth(), { wrapper: Wrapper });
        
        await act(async () => {
            await result.current.signUp('test@example.com', 'password', {
                full_name: 'Test User'
            });
        });
        
        expect(mockedAuthService.signUp).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password',
            full_name: 'Test User'
        });
    });
}); 