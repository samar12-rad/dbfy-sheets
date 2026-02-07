'use client';

import useSWR, { mutate } from 'swr';
import { fetcher, api } from '@/lib/api';
import { SheetCell } from './SheetCell';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';

const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

interface SheetData {
    data: {
        rows: any[];
        cells: any[];
    };
}

export function SheetGrid() {
    const params = useParams();
    const sheetId = params.sheetId as string;

    const { data, error, isLoading, mutate: mutateRows } = useSWR<SheetData>(`/sheets/${sheetId}/rows`, fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
    });
    const [isAddingRow, setIsAddingRow] = useState(false);
    const [deletingRowId, setDeletingRowId] = useState<number | null>(null);

    // SSE Subscription for real-time updates
    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const eventSource = new EventSource(`${API_URL}/events/${sheetId}`);

        eventSource.onmessage = (event) => {
            console.log('[SSE] Received update:', event.data);
            mutateRows(); // Trigger re-fetch of grid data
        };

        eventSource.onerror = (err) => {
            console.error('[SSE] Connection error:', err);
        };

        return () => {
            eventSource.close();
        };
    }, [sheetId, mutateRows]);

    // Transform flat cells to map for O(1) access
    const cellMap = useMemo(() => {
        const map = new Map<number, Map<string, string>>();
        if (data?.data?.cells) {
            for (const cell of data.data.cells) {
                if (!map.has(cell.row_id)) {
                    map.set(cell.row_id, new Map());
                }
                map.get(cell.row_id)!.set(cell.column_key, cell.value);
            }
        }
        return map;
    }, [data]);

    const handleAddRow = async () => {
        setIsAddingRow(true);
        try {
            const nextIndex = data?.data?.rows?.length || 0;
            await api.post(`/sheets/${sheetId}/rows`, {
                row_index: nextIndex
            });
            toast.success('Row added');
            mutate(`/sheets/${sheetId}/rows`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsAddingRow(false);
        }
    };

    const handleDeleteRow = async (rowId: number) => {
        if (!confirm('Are you sure you want to delete this row?')) return;
        setDeletingRowId(rowId);
        try {
            await api.delete(`/sheets/${sheetId}/rows/${rowId}`);
            toast.success('Row deleted');
            mutate(`/sheets/${sheetId}/rows`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setDeletingRowId(null);
        }
    };

    if (error) return <div className="text-red-600">Failed to load sheet data</div>;
    if (isLoading) return <div className="flex justify-center p-8"><Spinner className="w-8 h-8 text-blue-600" /></div>;

    const rows = data?.data?.rows || [];

    return (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="w-full border-collapse text-sm text-left">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border border-gray-300 px-2 py-1 w-12 text-center text-gray-500 font-medium">#</th>
                        {COLUMNS.map(col => (
                            <th key={col} className="border border-gray-300 px-2 py-1 font-medium min-w-[100px]">{col}</th>
                        ))}
                        <th className="border border-gray-300 px-2 py-1 w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row: any, index: number) => (
                        <tr key={row.id}>
                            <td className="border border-gray-300 px-2 py-1 bg-gray-50 text-center text-gray-500 font-mono text-xs">
                                {index + 1}
                            </td>
                            {COLUMNS.map(col => (
                                <SheetCell
                                    key={`${row.id}-${col}`}
                                    rowId={row.id}
                                    columnKey={col}
                                    initialValue={cellMap.get(row.id)?.get(col) || ''}
                                />
                            ))}
                            <td className="border border-gray-300 px-1 py-1 text-center">
                                <button
                                    onClick={() => handleDeleteRow(row.id)}
                                    className="text-gray-400 hover:text-red-600 font-bold px-2 disabled:opacity-50"
                                    title="Delete Row"
                                    disabled={deletingRowId === row.id}
                                >
                                    {deletingRowId === row.id ? <Spinner className="w-3 h-3 border-gray-400" /> : '×'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={COLUMNS.length + 2} className="px-4 py-8 text-center text-gray-500">
                                This sheet is empty. Add a row to start.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="p-2 bg-gray-50 border-t">
                <Button size="sm" variant="secondary" onClick={handleAddRow} disabled={isAddingRow}>
                    {isAddingRow ? <><Spinner className="w-3 h-3 mr-2" /> Adding...</> : '+ Add Row'}
                </Button>
            </div>
        </div>
    );
}
