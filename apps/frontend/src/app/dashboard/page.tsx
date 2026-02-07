"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { SheetCard } from "@/components/sheets/SheetCard";
import { ConnectSheetDialog } from "@/components/sheets/ConnectSheetDialog";
import { AppsScriptInstructionsDialog } from "@/components/sheets/AppsScriptInstructionsDialog";
import { InitialImportDialog } from "@/components/sheets/InitialImportDialog";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth"; // Protected

interface Sheet {
    id: string;
    name: string;
    owner_id: string;
    external_sheet_id: string;
    status: "connected" | "error" | "syncing";
    last_synced_at?: string;
    last_sync_status?: string;
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const [showInstructions, setShowInstructions] = useState(false);
    const [importSheetId, setImportSheetId] = useState<string | null>(null);

    const { data, error, isLoading, mutate } = useSWR<{ data: Sheet[] }>(
        "/sheets",
        fetcher
    );

    useEffect(() => {
        const status = searchParams.get("status");
        const sheetId = searchParams.get("sheetId");

        if (status === "success" && sheetId) {
            setImportSheetId(sheetId);

            // Clean up the URL to prevent the dialog from showing again on refresh
            const url = new URL(window.location.href);
            url.searchParams.delete("status");
            url.searchParams.delete("sheetId");
            window.history.replaceState({}, "", url.pathname);
        }
    }, [searchParams]);

    const handleImportComplete = () => {
        setImportSheetId(null);
        setShowInstructions(true);
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                Failed to load sheets. Please try refreshing.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Dashboard
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Manage your connected Google Sheets.
                        </p>
                    </div>
                    <ConnectSheetDialog />
                </header>

                <main>
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Spinner className="h-10 w-10 text-primary" />
                        </div>
                    ) : (
                        <>
                            {(!data?.data || data.data.length === 0) ? (
                                <div className="text-center py-20 border-2 border-dashed rounded-lg bg-white">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        No sheets connected
                                    </h3>
                                    <p className="text-gray-500 mt-2 mb-6">
                                        Connect a Google Sheet to get started.
                                    </p>
                                    <ConnectSheetDialog />
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {data.data.map((sheet) => (
                                        <SheetCard
                                            key={sheet.id}
                                            id={sheet.id}
                                            name={sheet.name || "Untitled Sheet"}
                                            external_sheet_id={sheet.external_sheet_id}
                                            status={
                                                sheet.last_sync_status === "FAILED"
                                                    ? "error"
                                                    : sheet.external_sheet_id
                                                        ? "connected"
                                                        : "error"
                                            }
                                            last_synced_at={sheet.last_synced_at}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>

                <AppsScriptInstructionsDialog
                    open={showInstructions}
                    onOpenChange={setShowInstructions}
                />

                <InitialImportDialog
                    sheetId={importSheetId || ""}
                    open={!!importSheetId}
                    onComplete={handleImportComplete}
                />
            </div>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div className="flex justify-center p-20"><Spinner className="w-10 h-10 text-blue-600" /></div>}>
            <DashboardContent />
        </Suspense>
    );
}
