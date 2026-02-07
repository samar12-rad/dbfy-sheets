'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { useParams } from 'next/navigation';
import { Download, RefreshCw } from 'lucide-react';

export function SheetActions() {
    const params = useParams();
    const sheetId = params.sheetId as string;

    const [isImportWarningOpen, setIsImportWarningOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // --- Import ---
    const handleImport = async () => {
        setIsImporting(true);
        try {
            const res = await api.post<{ rows: number }>(`/sheets/${sheetId}/import`, {});
            toast.success(`Imported ${res.rows} rows`);
            setIsImportWarningOpen(false);
            mutate(`/sheets/${sheetId}/rows`); // Refresh grid
            mutate(`/sheets/${sheetId}/logs`); // Refresh logs
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => setIsImportWarningOpen(true)}>
                <Download className="w-4 h-4 mr-2" />
                Import Data
            </Button>

            {/* Import Warning Dialog */}
            <Dialog open={isImportWarningOpen} onOpenChange={setIsImportWarningOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Import</DialogTitle>
                        <DialogDescription>
                            Warning: This will replace ALL current data in this sheet with data from Google Sheets.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsImportWarningOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleImport} disabled={isImporting}>
                            {isImporting ? 'Importing...' : 'Yes, Overwrite Data'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

