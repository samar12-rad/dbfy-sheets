import { toast } from "sonner";

// Environment-aware API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

/**
 * Core fetch wrapper that handles:
 * - Auth headers (Bearer token)
 * - Base URL prepending
 * - Global error handling (including 401 redirects)
 * - Response parsing
 */
async function fetchClient<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sheet_connect_token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Handle 401 Unauthorized globally
        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('sheet_connect_token');
                // Prevent redirect loop if already on login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
            throw new ApiError('Session expired. Please login again.', 401);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(data.error || data.message || 'An error occurred', response.status);
        }

        return data;
    } catch (error) {
        // Re-throw ApiErrors, wrap others
        if (error instanceof ApiError) {
            throw error;
        }
        const message = error instanceof Error ? error.message : 'Network error';
        // Optional: Log to monitoring service here
        console.error('API Request Failed:', error);
        throw new Error(message);
    }
}

// Convenience methods conforming to SWR fetcher signature
export const api = {
    get: <T>(url: string) => fetchClient<T>(url, { method: 'GET' }),
    post: <T>(url: string, body: any) => fetchClient<T>(url, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(url: string, body: any) => fetchClient<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(url: string, body: any) => fetchClient<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(url: string) => fetchClient<T>(url, { method: 'DELETE' }),
};

export const fetcher = <T>(url: string) => api.get<T>(url);

export default api;
