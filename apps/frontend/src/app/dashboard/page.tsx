import Link from 'next/link';

export default function Dashboard() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="mb-6">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Add New Sheet
                </button>
            </div>
            <div className="grid gap-4">
                <h2 className="text-xl font-semibold">Connected Sheets</h2>
                {/* Mock Data */}
                {[1, 2, 3].map((id) => (
                    <div key={id} className="border p-4 rounded shadow">
                        <h3 className="font-medium">Google Sheet {id}</h3>
                        <div className="mt-2 space-x-2">
                            <Link href={`/sheets/${id}`} className="text-blue-500 hover:underline">
                                View Details
                            </Link>
                            <Link href={`/sheets/${id}/logs`} className="text-gray-500 hover:underline">
                                View Logs
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8">
                <Link href="/logs" className="text-blue-600 hover:underline">
                    View All Global Logs
                </Link>
            </div>
        </div>
    );
}
