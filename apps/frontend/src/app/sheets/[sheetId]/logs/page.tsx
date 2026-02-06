import Link from 'next/link';

export default async function SheetLogsPage({ params }: { params: Promise<{ sheetId: string }> }) {
    const { sheetId } = await params;
    return (
        <div className="p-8">
            <div className="mb-4">
                <Link href={`/sheets/${sheetId}`} className="text-blue-500 hover:underline">
                    &larr; Back to Sheet
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-4">Logs for Sheet: {sheetId}</h1>
            <div className="bg-gray-100 p-4 rounded">
                <p className="text-gray-600">No logs found for this sheet yet.</p>
            </div>
        </div>
    );
}
