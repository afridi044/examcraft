import { renderHook, act } from '@testing-library/react';
import { useBackendAuth } from '../useBackendAuth';
import { authService } from '@/lib/services/auth.service';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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

describe('useBackendAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.localStorage.clear();
    });

    it('should have initial state', async () => {
        mockedAuthService.hasStoredToken.mockReturnValue(false);
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => { }); // let useEffect run
        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.signingOut).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set loading to false if no stored token', async () => {
        mockedAuthService.hasStoredToken.mockReturnValue(false);
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => { }); // let useEffect run
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set user and isAuthenticated if token is valid', async () => {
        mockedAuthService.hasStoredToken.mockReturnValue(true);
        const user = { id: '1', auth_id: 'auth1', email: 'test@example.com' };
        mockedAuthService.validateToken.mockResolvedValue({ success: true, user });
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => { });
        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(user);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear localStorage and set loading to false if token is invalid', async () => {
        mockedAuthService.hasStoredToken.mockReturnValue(true);
        mockedAuthService.validateToken.mockResolvedValue({ success: false });
        window.localStorage.setItem('examcraft-user', 'something');
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => { });
        expect(result.current.loading).toBe(false);
        expect(window.localStorage.getItem('examcraft-user')).toBeNull();
    });

    it('should handle error during token validation', async () => {
        mockedAuthService.hasStoredToken.mockReturnValue(true);
        mockedAuthService.validateToken.mockRejectedValue(new Error('fail'));
        window.localStorage.setItem('examcraft-user', 'something');
        window.localStorage.setItem('access_token', 'token');
        window.localStorage.setItem('refresh_token', 'token');
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => { });
        expect(result.current.loading).toBe(false);
        expect(window.localStorage.getItem('examcraft-user')).toBeNull();
        expect(window.localStorage.getItem('access_token')).toBeNull();
        expect(window.localStorage.getItem('refresh_token')).toBeNull();
    });

    it('signIn: should set user and isAuthenticated on success', async () => {
        const user = { id: '1', auth_id: 'auth1', email: 'test@example.com' };
        mockedAuthService.signIn.mockResolvedValue({ success: true, user, message: 'Success' });
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => {
            const res = await result.current.signIn('test@example.com', 'pw');
            expect(res.data?.user).toEqual(user);
            expect(res.error).toBeNull();
        });
        expect(result.current.user).toEqual(user);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.loading).toBe(false);
        expect(window.localStorage.getItem('examcraft-user')).toBe(JSON.stringify(user));
    });

    it('signIn: should handle error', async () => {
        mockedAuthService.signIn.mockResolvedValue({ success: false, error: 'fail', message: 'Sign in failed' });
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => {
            const res = await result.current.signIn('test@example.com', 'pw');
            expect(res.data).toBeNull();
            expect(res.error).toBe('fail');
        });
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    it('signUp: should set user and isAuthenticated on success', async () => {
        const user = { id: '1', email: 'test@example.com' };
        mockedAuthService.signUp.mockResolvedValue({ success: true, user });
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => {
            const res = await result.current.signUp('test@example.com', 'pw', { full_name: 'Test' });
            expect(res.data.user).toEqual(user);
            expect(res.error).toBeNull();
        });
        expect(result.current.user).toEqual(user);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.loading).toBe(false);
        expect(window.localStorage.getItem('examcraft-user')).toBe(JSON.stringify(user));
    });

    it('signUp: should handle error', async () => {
        mockedAuthService.signUp.mockResolvedValue({ success: false, error: 'fail' });
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => {
            const res = await result.current.signUp('test@example.com', 'pw');
            expect(res.data).toBeNull();
            expect(res.error).toBe('fail');
        });
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    it('signOut: should clear user and localStorage', async () => {
        mockedAuthService.signOut.mockResolvedValue({});
        window.localStorage.setItem('examcraft-user', JSON.stringify({ id: '1' }));
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => {
            await result.current.signOut();
        });
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
        expect(result.current.signingOut).toBe(false);
        expect(window.localStorage.getItem('examcraft-user')).toBeNull();
    });

    it('signOut: should handle error', async () => {
        mockedAuthService.signOut.mockRejectedValue(new Error('fail'));
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => {
            const res = await result.current.signOut();
            expect(res.error).toBe('fail');
        });
        expect(result.current.signingOut).toBe(false);
    });

    it('clearAuthState: should clear all auth state and localStorage', async () => {
        window.localStorage.setItem('examcraft-user', 'something');
        window.localStorage.setItem('access_token', 'token');
        window.localStorage.setItem('refresh_token', 'token');
        const { result } = renderHook(() => useBackendAuth());
        await act(async () => {
            await result.current.clearAuthState();
        });
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
        expect(result.current.signingOut).toBe(false);
        expect(window.localStorage.getItem('examcraft-user')).toBeNull();
        expect(window.localStorage.getItem('access_token')).toBeNull();
        expect(window.localStorage.getItem('refresh_token')).toBeNull();
    });
}); 