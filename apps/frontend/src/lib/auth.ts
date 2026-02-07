'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:4000';

export interface User {
    id: number;
    email: string;
}

interface AuthResponse {
    data: {
        token: string;
        user: User;
    };
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Load from localStorage on mount
        const storedToken = localStorage.getItem('sheet_token');
        const storedUser = localStorage.getItem('sheet_user');

        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user', e);
                localStorage.removeItem('sheet_user');
            }
        }
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error?.message || 'Login failed');
        }

        const data: AuthResponse = await res.json();
        const { token, user } = data.data;

        localStorage.setItem('sheet_token', token);
        localStorage.setItem('sheet_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        router.push('/');
    };

    const register = async (email: string, password: string) => {
        // Register endpoint in backend is /auth/register
        // It returns { data: { id, email } } but NO token in the implementation I saw (lines 55-86 of auth.ts).
        // Wait, let me double check auth.ts.
        // Yes, register returns `res.status(201).json({ data: { id, email } })`.
        // It does NOT log the user in automatically.

        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error?.message || 'Registration failed');
        }

        // After register, user must login.
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('sheet_token');
        localStorage.removeItem('sheet_user');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    return {
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token
    };
}
