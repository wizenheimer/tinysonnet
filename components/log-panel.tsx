"use client";

import { useTinyLM } from "@/providers/tinylm-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

export function LogPanel() {
  const context = useTinyLM();

  // Return early if context is null
  if (!context) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>System Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full rounded-md border p-4 bg-black/90 text-white font-mono text-sm flex items-center justify-center">
            <div className="text-muted-foreground">TinyLM context is not available.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { logEntries, clearLogs } = context;

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>System Log</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearLogs}
          className="h-8 w-8 p-0"
        >
          <Trash2 size={18} />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-black/90 text-white font-mono text-sm">
          {logEntries.length === 0 ? (
            <div className="text-muted-foreground">No log entries yet.</div>
          ) : (
            logEntries.map((entry, index) => (
              <div key={index} className="pb-1.5 leading-relaxed break-words">
                <span className="text-gray-400">
                  [{entry.timestamp.toLocaleTimeString()}]
                </span>{" "}
                {entry.message}
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}