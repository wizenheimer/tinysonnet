"use client";

import { SystemStatus } from "@/components/system-status";
import { ModelOptions } from "@/components/model-options";
import { VoicePlayground } from "@/components/voice-playground";
import { HistoryList } from "@/components/history-list";
import { LogPanel } from "@/components/log-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="container mx-auto py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">TinyLM Voice Playground</h1>
        <p className="text-muted-foreground">
          Try different voices and generate natural speech in your browser
        </p>
      </header>

      <SystemStatus />

      <ModelOptions />

      <Tabs defaultValue="playground" className="space-y-4">
        <TabsList>
          <TabsTrigger value="playground">Voice Playground</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-4">
          <VoicePlayground />
        </TabsContent>

        <TabsContent value="history">
          <HistoryList />
        </TabsContent>
      </Tabs>

      <LogPanel />
    </main>
  );
}