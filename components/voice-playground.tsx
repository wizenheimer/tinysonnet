"use client";

import { useTinyLM } from "@/providers/tinylm-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "@/components/audio-player";
import { StreamChunks } from "@/components/stream-chunks";
import { Badge } from "@/components/ui/badge";

export function VoicePlayground() {
  const context = useTinyLM();

  // Return early if context is null
  if (!context) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            TinyLM context is not available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    modelStatus,
    isGenerating,
    streamingEnabled,
    setStreamingEnabled,
    selectedVoice,
    setSelectedVoice,
    playgroundText,
    setPlaygroundText,
    playgroundSpeed,
    setPlaygroundSpeed,
    generateSpeech,
    audioResult,
    voicesList,
    streamChunks,
  } = context;

  const isLoaded = modelStatus === "loaded";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="playground-text">
                Enter text to try with multiple voices:
              </Label>
              <Textarea
                id="playground-text"
                placeholder="Enter text here..."
                value={playgroundText}
                onChange={(e) => setPlaygroundText(e.target.value)}
                disabled={!isLoaded}
                className="mt-1.5 h-32"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="playground-speed">Speed</Label>
                <span className="text-sm">{playgroundSpeed}x</span>
              </div>
              <Slider
                id="playground-speed"
                min={0.5}
                max={1.5}
                step={0.1}
                value={[playgroundSpeed]}
                onValueChange={(value) => setPlaygroundSpeed(value[0])}
                disabled={!isLoaded}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="stream-toggle"
                checked={streamingEnabled}
                onCheckedChange={setStreamingEnabled}
                disabled={!isLoaded}
                defaultChecked={true}
              />
              <Label htmlFor="stream-toggle">Enable Streaming</Label>
              <div className="text-xs text-muted-foreground ml-2">
                Streaming processes text in chunks, useful for longer texts
              </div>
            </div>

            <div className="pt-4">
              <Label className="mb-2 block">Select Voice</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Object.entries(voicesList).map(([id, voice]) => (
                  <div
                    key={id}
                    role="button"
                    onClick={() => isLoaded && setSelectedVoice(id)}
                    className={`
                      p-3 border rounded-md cursor-pointer transition-colors
                      ${!isLoaded ? "opacity-50 cursor-not-allowed" : ""}
                      ${id === selectedVoice ? "border-primary bg-primary/5" : "hover:bg-muted"}
                    `}
                  >
                    <div className="font-medium flex gap-1 items-center">
                      {voice.name}
                      {voice.traits && <span>{voice.traits}</span>}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{voice.language.toUpperCase()}</span>
                      <span>{voice.gender}</span>
                      {voice.overallGrade && (
                        <span>Grade: {voice.overallGrade}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={generateSpeech}
              disabled={!isLoaded || isGenerating || !playgroundText.trim()}
              className="w-full mt-4"
            >
              {isGenerating ? (
                <>
                  <span className="loading-spinner mr-2"></span>
                  Generating...
                </>
              ) : (
                "Generate Speech"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {audioResult && (
        <div className="space-y-4">
          <div className="text-lg font-medium flex items-center gap-2">
            Generated Audio - {voicesList[audioResult.voice]?.name}
            <Badge variant="outline">
              {voicesList[audioResult.voice]?.gender},
              {voicesList[audioResult.voice]?.language.toUpperCase()}
              {audioResult.chunks && ` - ${audioResult.chunks} chunks`}
            </Badge>
          </div>

          {streamChunks.length > 0 && (
            <StreamChunks chunks={streamChunks} />
          )}

          <AudioPlayer
            audioUrl={audioResult.audioUrl}
            fileName={`voice_${audioResult.voice}_${new Date().toISOString().replace(/[-:.]/g, '')}.${audioResult.contentType.includes("mp3") ? "mp3" : "wav"}`}
            generationTime={audioResult.timeTaken}
          />
        </div>
      )}
    </div>
  );
}