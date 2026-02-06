
export default async function SheetPage({ params }: { params: Promise<{ sheetId: string }> }) {
    const { sheetId } = await params;
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Sheet Details: {sheetId}</h1>
            <div className="mb-4">
                <p>Configuration and sync status for sheet {sheetId} would go here.</p>
            </div>
        </div>
    );
}
