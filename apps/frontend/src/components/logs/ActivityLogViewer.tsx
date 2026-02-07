'use client';

import useSWR from 'swr';
import { fetcher } from '../../lib/api';
import { Spinner } from '@/components/ui/spinner';

interface ActivityLogViewerProps {
    sheetId?: string; // If provided, fetches sheet specific logs. Else global.
}

export function ActivityLogViewer({ sheetId }: ActivityLogViewerProps) {
    const url = sheetId ? `/sheets/${sheetId}/logs` : '/logs';
    const { data, error, isLoading } = useSWR<{ data: any[] }>(url, fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0
    });

    if (error) return <div className="text-red-500 text-sm">Failed to load logs</div>;
    if (isLoading) return <div className="flex justify-center p-4"><Spinner className="w-4 h-4 text-gray-400" /></div>;

    const logs = data?.data || [];

    if (logs.length === 0) {
        return <div className="text-sm text-gray-500 italic p-4 text-center">No activity recorded yet.</div>;
    }

    return (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {logs.map((log: any) => (
                <div key={log.id} className="text-sm border-b pb-2 last:border-0">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="font-mono">
                            {new Date(log.created_at).toLocaleString()}
                        </span>
                        <span>{log.action_type}</span>
                    </div>
                    <div className="text-gray-800">
                        {renderLogDetails(log)}
                    </div>
                </div>
            ))}
        </div>
    );
}

function renderLogDetails(log: any) {
    // Customize message based on action type
    const details = [];

    if (log.sheet_id) details.push(`Sheet: ${log.sheet_id}`);
    if (log.entity_type === 'CELL') {
        details.push(`Cell ID: ${log.entity_id}`);
        try {
            const oldVal = log.old_value ? JSON.parse(log.old_value) : null;
            const newVal = log.new_value ? JSON.parse(log.new_value) : null;
            if (oldVal) details.push(`Old: "${oldVal.value}"`);
            if (newVal) details.push(`New: "${newVal.value}"`);
        } catch (e) { }
    } else if (log.entity_type === 'ROW') {
        details.push(`Row ID: ${log.entity_id}`);
    } else if (log.entity_type === 'SHEET' && log.action_type === 'SYNC_COMPLETE') {
        try {
            const stats = JSON.parse(log.new_value);
            details.push(`Added: ${stats.added}, Updated: ${stats.updated}`);
        } catch (e) { }
    }

    return details.join(' | ');
}
