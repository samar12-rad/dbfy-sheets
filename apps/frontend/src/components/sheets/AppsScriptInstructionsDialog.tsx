"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, Smartphone } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface AppsScriptInstructionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AppsScriptInstructionsDialog({
    open,
    onOpenChange,
}: AppsScriptInstructionsDialogProps) {
    const [copied, setCopied] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const webhookUrl = `${backendUrl}/sheet`;

    const scriptCode = `const BACKEND_URL = "${webhookUrl}";

function handleEdit(e) {
  try {
    var range = e.range;
    var sheet = range.getSheet();

    // Use getValue() - more reliable than e.value
    var value = range.getValue();

    var payload = {
      spreadsheetId: e.source.getId(),
      sheetName: sheet.getName(),
      row: range.getRow(),
      column: range.getColumn(),
      value: value !== undefined ? String(value) : "",
      time: new Date().toISOString()
    };

    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "ngrok-skip-browser-warning": "true"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(BACKEND_URL, options);
    Logger.log("Response: " + response.getContentText()); // Debug log
  } catch (err) {
    Logger.log("Error: " + err);
  }
}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(scriptCode);
        setCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const steps = [
        {
            title: "1. Open Extensions",
            description: "In your connected Google Sheet, go to Extensions > Apps Script.",
            image: "/selectAPpscriptfromextension.png",
        },
        {
            title: "2. Paste the Code",
            description: "Delete any existing code in the editor and paste the snippet below. Then press the Save (disk) icon.",
            image: "/pasteCOde.png",
        },
        {
            title: "3. Go to Triggers",
            description: "Click the clock icon (Triggers) on the left sidebar of the Apps Script editor.",
            image: "/goTotriggers.png",
        },
        {
            title: "4. Add a New Trigger",
            description: "Click the '+ Add Trigger' button at the bottom right corner.",
            image: "/clickonAddTrigger.png",
        },
        {
            title: "5. Configure the Trigger",
            description: "Set 'Choose function to run' to 'handleEdit', 'Select event source' to 'From spreadsheet', and 'Select event type' to 'On edit'. Set 'Failure notification settings' to 'Notify me immediately'.",
            image: "/ChooseOnEditNotfyImmediatly.png",
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">
                        Setup Real-time Sync
                    </DialogTitle>
                    <DialogDescription>
                        Complete these steps to enable real-time updates from your Google Sheet to this dashboard.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-10 py-6">
                    {steps.map((step, index) => (
                        <div key={index} className="space-y-4 border-b pb-10 last:border-0 last:pb-0">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
                                    {index + 1}
                                </span>
                                {step.title}
                            </h3>
                            <p className="text-muted-foreground">{step.description}</p>
                            <div className="relative aspect-video rounded-lg overflow-hidden border shadow-sm bg-muted">
                                <Image
                                    src={step.image}
                                    alt={step.title}
                                    fill
                                    className="object-contain"
                                />
                            </div>

                            {index === 1 && (
                                <div className="mt-4 space-y-2">
                                    <div className="relative group">
                                        <pre className="p-4 bg-slate-950 text-slate-50 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
                                            {scriptCode}
                                        </pre>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="absolute top-2 right-2 opacity-100 group-hover:opacity-100 transition-opacity"
                                            onClick={copyToClipboard}
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copy Code
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">
                                        Note: The URL in the script is pre-configured for your instance.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>
                        I've completed setup
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
