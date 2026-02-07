'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { useAuth } from '@/lib/auth'; // Protected
import { SheetActions } from '@/components/sheets/SheetActions';
import { SheetGrid } from '@/components/sheets/SheetGrid';
import { ActivityLogViewer } from '@/components/logs/ActivityLogViewer';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

export default function SheetPage() {
    const params = useParams();
    const router = useRouter();
    // Resolve sheetId safely
    const sheetId = Array.isArray(params.sheetId) ? params.sheetId[0] : params.sheetId; // Should be string

    // Auth Check
    const { isAuthenticated, logout } = useAuth();
    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('sheet_connect_token')) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const { data, error, isLoading } = useSWR<{ data: { name: string } }>(sheetId ? `/sheets/${sheetId}` : null, fetcher);

    if (isLoading) return <div className="flex justify-center p-20"><Spinner className="w-10 h-10 text-blue-600" /></div>;
    if (error) return <div className="p-8 text-red-600">Error loading sheet: {error.message}</div>;
    if (!data) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster />
            {/* Header */}
            <header className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-900">
                        ← Back
                    </Link>
                    <h1 className="text-xl font-bold">{data.data.name}</h1>
                </div>
                <div>
                    <Button size="sm" variant="ghost" onClick={logout}>Logout</Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-hidden">
                <div className="h-full flex flex-col max-w-[1600px] mx-auto">

                    <SheetActions />

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                        {/* Grid Section */}
                        <div className="lg:col-span-3 flex flex-col min-h-0 bg-white rounded-lg border shadow-sm p-4 overflow-hidden">
                            <div className="flex-1 overflow-auto">
                                <SheetGrid />
                            </div>
                        </div>

                        {/* Logs Section */}
                        <div className="lg:col-span-1 bg-white rounded-lg border shadow-sm p-4 flex flex-col min-h-0">
                            <h3 className="font-semibold text-gray-700 mb-2">Audit Logs</h3>
                            <div className="flex-1 overflow-auto">
                                <ActivityLogViewer sheetId={sheetId} />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
