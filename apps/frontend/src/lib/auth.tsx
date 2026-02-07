"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import api, { ApiError } from "./api";
import { toast } from "sonner";

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check for token on mount
        const storedToken = localStorage.getItem("sheet_connect_token");
        const storedUser = localStorage.getItem("sheet_connect_user");

        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem("sheet_connect_token", newToken);
        localStorage.setItem("sheet_connect_user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        router.push("/dashboard");
        toast.success("Welcome back!");
    };

    const logout = () => {
        localStorage.removeItem("sheet_connect_token");
        localStorage.removeItem("sheet_connect_user");
        setToken(null);
        setUser(null);
        router.push("/login");
        toast.info("Logged out successfully");
    };

    const isAuthenticated = !!token;

    // Protect routes
    useEffect(() => {
        if (!loading) {
            const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
            const isProtectedRoute = !isAuthRoute;

            if (isProtectedRoute && !isAuthenticated) {
                // Use window.location to force full reload if needed, but router is better
                router.push("/login");
            } else if (isAuthRoute && isAuthenticated) {
                router.push("/dashboard");
            }
        }
    }, [isAuthenticated, loading, pathname, router]);


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
