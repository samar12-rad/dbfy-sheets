'use client';

import { useAuth } from '../../lib/auth'; // Ensure this path is correct relative to app/logs/page.tsx
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ActivityLogViewer } from '../../components/logs/ActivityLogViewer';

export default function LogsPage() {
    const router = useRouter(); // Use useRouter from next/navigation
    const { isAuthenticated, user, logout } = useAuth();

    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('sheet_token')) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Simple header */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-900">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold">Global Activity Logs</h1>
                </div>
                <Button variant="ghost" onClick={logout}>Logout</Button>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <ActivityLogViewer />
            </div>
        </div>
    );
}
