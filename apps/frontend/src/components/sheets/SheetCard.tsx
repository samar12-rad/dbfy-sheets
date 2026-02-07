import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileSpreadsheet, Activity, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { mutate } from "swr";

interface SheetCardProps {
    id: string;
    name: string;
    external_sheet_id: string;
    status: "connected" | "error" | "syncing";
    last_synced_at?: string;
}

export function SheetCard({ id, name, external_sheet_id, status, last_synced_at }: SheetCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/sheets/${id}`);
            toast.success("Sheet deleted successfully");
            mutate("/sheets");
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete sheet");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow relative group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        {name || "Untitled Sheet"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium border",
                                status === "connected" && "bg-green-50 text-green-700 border-green-200",
                                status === "error" && "bg-red-50 text-red-700 border-red-200",
                                status === "syncing" && "bg-blue-50 text-blue-700 border-blue-200"
                            )}
                        >
                            {status}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsDeleteDialogOpen(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="text-sm text-gray-500 truncate" title={external_sheet_id}>
                    ID: {external_sheet_id}
                </div>
                {last_synced_at && (
                    <div className="text-xs text-gray-400 mt-1">
                        Last synced: {new Date(last_synced_at).toLocaleString()}
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-4 flex justify-between gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/sheets/${id}`}>View Data</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="px-2">
                    <Link href={`/sheets/${id}#logs`} title="View Logs">
                        <Activity className="h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete dbfy-sheet</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-bold">"{name}"</span>?
                            This will also delete all imported rows and audit logs. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Sheet"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
