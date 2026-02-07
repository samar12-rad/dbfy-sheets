"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

import Link from "next/link";
import { BarChart3, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post<{ data: { token: string; user: any } }>('/auth/login', { email, password });
            login(res.data.token, res.data.user);
        } catch (error: any) {
            toast.error(error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100-5rem)] items-center justify-center p-6 bg-gray-50/50">
            <div className="w-full max-w-[400px] space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 mb-4">
                        <BarChart3 className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500">Sign in to manage your connected sheets</p>
                </div>

                <Card className="border-none shadow-2xl shadow-gray-200/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Sign in</CardTitle>
                        <CardDescription>Enter your account details below</CardDescription>
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
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <button type="button" className="text-xs text-blue-600 hover:underline">Forgot password?</button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-6">
                            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait
                                    </>
                                ) : "Sign in"}
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-gray-500">Don't have an account? </span>
                                <Link href="/register" className="font-semibold text-blue-600 hover:underline">
                                    Sign up
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-gray-400">
                    Secure 256-bit encrypted authentication
                </p>
            </div>
        </div>
    );
}
