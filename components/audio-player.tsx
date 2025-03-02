"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  fileName: string;
  generationTime?: number;
}

export function AudioPlayer({ audioUrl, fileName, generationTime }: AudioPlayerProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="text-sm font-medium mb-2">Final Audio</h4>
        <audio
          controls
          src={audioUrl}
          className="w-full"
        >
          Your browser does not support the audio element.
        </audio>
        
        <div className="flex items-center justify-between mt-2">
          <Button asChild variant="outline" size="sm">
            <a href={audioUrl} download={fileName} className="flex items-center gap-1">
              <Download size={16} />
              Download Audio
            </a>
          </Button>
          
          {generationTime && (
            <div className="text-xs text-muted-foreground">
              Generated in {Math.round(generationTime)}ms
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}