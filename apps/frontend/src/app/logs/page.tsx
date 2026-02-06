import Link from 'next/link';

export default function GlobalLogsPage() {
    return (
        <div className="p-8">
            <div className="mb-4">
                <Link href="/dashboard" className="text-blue-500 hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-4">Global Logs</h1>
            <div className="bg-gray-100 p-4 rounded">
                <p className="text-gray-600">System wide logs will appear here.</p>
            </div>
        </div>
    );
}
