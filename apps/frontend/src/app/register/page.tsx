'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import api from '@/lib/api';

import { BarChart3, Mail, Lock, Loader2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/register', { email, password });
            const res = await api.post<{ data: { token: string; user: any } }>('/auth/login', { email, password });
            login(res.data.token, res.data.user);
        } catch (error: any) {
            toast.error(error.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100-5rem)] items-center justify-center p-6 bg-gray-50/50">
            <div className="w-full max-w-[400px] space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 mb-4">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Get Started</h1>
                    <p className="text-gray-500">Create an account to start syncing sheets</p>
                </div>

                <Card className="border-none shadow-2xl shadow-gray-200/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Create account</CardTitle>
                        <CardDescription>Enter your email and choose a password</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Min. 8 characters"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-6">
                            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account
                                    </>
                                ) : "Sign up"}
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-gray-500">Already have an account? </span>
                                <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-gray-400 px-6">
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
