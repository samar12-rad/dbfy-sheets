"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    History
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-white/80 backdrop-blur-md border-b shadow-sm py-3"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
                        <BarChart3 className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 tracking-tight">
                        SheetConnect
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {isAuthenticated ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1.5"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link
                                href="/logs"
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1.5"
                            >
                                <History className="w-4 h-4" />
                                Audit Logs
                            </Link>
                            <div className="h-6 w-px bg-gray-200 mx-1" />
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 font-medium">{user?.email}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={logout}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                            <Link href="/register">
                                <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                    {isAuthenticated ? (
                        <>
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium"
                            >
                                <LayoutDashboard className="w-5 h-5 text-blue-600" />
                                Dashboard
                            </Link>
                            <Link
                                href="/logs"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium"
                            >
                                <History className="w-5 h-5 text-blue-600" />
                                Audit Logs
                            </Link>
                            <div className="h-px bg-gray-100 my-1" />
                            <div className="p-3">
                                <p className="text-xs text-gray-400 mb-1">Signed in as</p>
                                <p className="font-medium text-gray-800">{user?.email}</p>
                            </div>
                            <Button
                                variant="destructive"
                                className="w-full justify-start"
                                onClick={() => {
                                    logout();
                                    setIsMenuOpen(false);
                                }}
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="p-3 rounded-lg hover:bg-blue-50 text-gray-700 font-medium"
                            >
                                Sign in
                            </Link>
                            <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
