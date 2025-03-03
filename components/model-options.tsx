"use client";

import { useTinyLM } from "@/providers/tinylm-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ModelOptions() {
  const context = useTinyLM();

  // Return early if context is null
  if (!context) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4 text-muted-foreground">
            TinyLM context is not available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    isInitialized,
    modelStatus,
    selectedModel,
    setSelectedModel,
    audioFormat,
    setAudioFormat,
    loadModel,
    unloadModel,
  } = context;

  const isLoading = modelStatus === "loading";
  const isLoaded = modelStatus === "loaded";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="model-select">TTS Model</Label>
            <Select
              disabled={!isInitialized || isLoading}
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onnx-community/Kokoro-82M-v1.0-ONNX">
                  Kokoro TTS
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio-format">Audio Format</Label>
            <Select
              disabled={!isInitialized || isLoading}
              value={audioFormat}
              onValueChange={(value) => setAudioFormat(value as "mp3" | "wav")}
            >
              <SelectTrigger id="audio-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wav">WAV</SelectItem>
                <SelectItem value="mp3">MP3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={loadModel}
              disabled={!isInitialized || isLoading || isLoaded}
              className="flex-1"
            >
              {isLoading ? "Loading..." : "Load Model"}
            </Button>
            <Button
              onClick={unloadModel}
              disabled={!isInitialized || isLoading || !isLoaded}
              variant="outline"
              className="flex-1"
            >
              Unload Model
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}