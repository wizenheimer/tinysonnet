"use client";

import { useTinyLM } from "@/providers/tinylm-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HistoryList() {
  const { generationHistory, voicesList } = useTinyLM();

  if (generationHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No generation history yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {generationHistory.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="text-sm mb-2 line-clamp-1">
              {item.text.length > 100 
                ? item.text.substring(0, 100) + "..." 
                : item.text}
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <span>{voicesList[item.voice]?.name}</span>
                {voicesList[item.voice]?.traits && (
                  <span>{voicesList[item.voice]?.traits}</span>
                )}
                <span>• {item.speed}x speed</span>
                {item.chunks && (
                  <span>• {item.chunks} chunks</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {voicesList[item.voice]?.overallGrade && (
                  <span>Grade: {voicesList[item.voice]?.overallGrade}</span>
                )}
                <span>• {item.time.toLocaleTimeString()}</span>
              </div>
            </div>
            
            <audio 
              controls 
              src={item.audioUrl}
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
            
            <div className="flex justify-between items-center mt-2">
              <Button asChild variant="outline" size="sm">
                <a 
                  href={item.audioUrl} 
                  download={`history_${item.id}.${item.contentType.includes("mp3") ? "mp3" : "wav"}`}
                  className="flex items-center gap-1"
                >
                  <Download size={16} />
                  Download Audio
                </a>
              </Button>
              
              {item.timeTaken && (
                <div className="text-xs text-muted-foreground">
                  Generated in {Math.round(item.timeTaken)}ms
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}