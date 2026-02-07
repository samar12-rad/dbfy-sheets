"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { mutate } from "swr";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

interface InitialImportDialogProps {
    sheetId: string;
    open: boolean;
    onComplete: () => void;
}

export function InitialImportDialog({
    sheetId,
    open,
    onComplete,
}: InitialImportDialogProps) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"importing" | "completed" | "error">("importing");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !sheetId) return;

        let isMounted = true;

        const startImport = async () => {
            try {
                // Start the actual import
                const importPromise = api.post<{ rows: number }>(`/sheets/${sheetId}/import`, {});

                // Simulate progress bar while waiting for API
                const progressInterval = setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 90) {
                            clearInterval(progressInterval);
                            return 90;
                        }
                        return prev + Math.random() * 15;
                    });
                }, 400);

                await importPromise;

                if (isMounted) {
                    clearInterval(progressInterval);
                    setProgress(100);
                    setStatus("completed");
                    mutate(`/sheets/${sheetId}/rows`);
                    mutate(`/sheets/${sheetId}/logs`);
                    toast.success("Sheet created and data imported successfully!");

                    // Wait a bit to show 100% then finish
                    setTimeout(() => {
                        if (isMounted) onComplete();
                    }, 1500);
                }
            } catch (err: any) {
                if (isMounted) {
                    setStatus("error");
                    setError(err.message || "Failed to import data");
                    toast.error("Initial import failed");
                }
            }
        };

        startImport();

        return () => {
            isMounted = false;
        };
    }, [open, sheetId, onComplete]);

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {status === "completed" ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : status === "error" ? (
                            <div className="h-6 w-6 text-red-500">×</div>
                        ) : (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        )}
                        Creating dbfy-sheet
                    </DialogTitle>
                    <DialogDescription>
                        {status === "completed"
                            ? "All set! Your sheet is ready."
                            : status === "error"
                                ? "Something went wrong during the initial import."
                                : "Please wait while we set up your database connection and import initial data."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ease-out ${status === "error" ? "bg-red-500" : "bg-primary"
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{status === "error" ? "Error" : status === "completed" ? "Completed" : "Importing..."}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>

                    {status === "error" && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                            {error}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
