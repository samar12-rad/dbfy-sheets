"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function ConnectSheetDialog({ onConnect }: { onConnect?: () => void }) {
    const [open, setOpen] = useState(false);
    const [spreadsheetId, setSpreadsheetId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post<{ url: string }>("/auth/google/start", {
                spreadsheetId,
            });

            if (res.url) {
                toast.info("Redirecting to Google...");
                window.location.href = res.url;
            } else {
                throw new Error("No redirect URL returned");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to initiate connection");
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Connect New Sheet
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Connect Google Sheet</DialogTitle>
                    <DialogDescription>
                        Enter the Google Spreadsheet ID you want to connect. We will redirect
                        you to Google to authorize access.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="spreadsheetId" className="text-right">
                                Sheet ID
                            </Label>
                            <Input
                                id="spreadsheetId"
                                value={spreadsheetId}
                                onChange={(e) => setSpreadsheetId(e.target.value)}
                                className="col-span-3"
                                placeholder="1BxiMVs0XRA5nFMdKbBdB..."
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Connecting..." : "Connect"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
