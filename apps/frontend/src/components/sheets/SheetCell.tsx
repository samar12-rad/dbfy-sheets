'use client';

import { useState, useRef, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { mutate } from 'swr';
import { useParams } from 'next/navigation';

interface SheetCellProps {
    rowId: number;
    columnKey: string;
    initialValue: string;
}

export function SheetCell({ rowId, columnKey, initialValue }: SheetCellProps) {
    const params = useParams();
    const sheetId = params.sheetId as string;

    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync state with props if data changes externally (e.g. other user edit)
    // But ONLY if not editing.
    useEffect(() => {
        if (!isEditing) {
            setValue(initialValue);
        }
    }, [initialValue, isEditing]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (value === initialValue) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            await api.patch(`/sheets/${sheetId}/cells`, {
                row_id: rowId,
                column_key: columnKey,
                value: value
            });

            // Success
            setIsEditing(false);
            toast.success(`Saved ${columnKey}${rowId}`);
            // Mutate to refresh data from server (Single Source of Truth)
            mutate(`/sheets/${sheetId}/rows`);
            mutate(`/sheets/${sheetId}/logs`);
        } catch (error: any) {
            toast.error(`Failed to save: ${error.message}`);
            // Keep in edit mode? Or revert?
            // User might want to retry. Keep editing state enabled but show error.
            // Don't revert value so user can fix it.
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setValue(initialValue); // Revert
        }
    };

    if (isEditing || isSaving) {
        return (
            <td className="border border-gray-300 p-0 relative min-w-[100px] h-10">
                <div className="relative w-full h-full">
                    <input
                        ref={inputRef}
                        className="w-full h-full px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        disabled={isSaving}
                    />
                    {isSaving && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
                            <Spinner className="w-4 h-4 text-blue-600" />
                        </div>
                    )}
                </div>
            </td>
        );
    }

    return (
        <td
            className="border border-gray-300 px-2 py-1 min-w-[100px] h-10 cursor-pointer hover:bg-gray-50 transition-colors empty:bg-gray-50/50"
            onDoubleClick={() => setIsEditing(true)}
        >
            <div className="truncate selection:bg-blue-100 h-full flex items-center">
                {value}
            </div>
        </td>
    );
}
