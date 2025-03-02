"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

interface StreamChunk {
  index: number;
  text: string;
  audioUrl: string;
  size: number;
}

interface StreamChunksProps {
  chunks: StreamChunk[];
}

export function StreamChunks({ chunks }: StreamChunksProps) {
  // Helper function to format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className="text-sm font-medium mb-2">Stream Chunks</h4>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {chunks.map((chunk) => (
            <Card key={chunk.index} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex justify-between text-sm mb-1">
                  <div className="font-medium">Chunk {chunk.index + 1}/{chunks.length}</div>
                  <div className="text-xs text-muted-foreground">{formatBytes(chunk.size)}</div>
                </div>
                
                {chunk.text && (
                  <div className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    "{chunk.text}"
                  </div>
                )}
                
                <audio 
                  controls 
                  src={chunk.audioUrl}
                  className="w-full h-8"
                >
                  Your browser does not support the audio element.
                </audio>
                
                <Button 
                  asChild 
                  variant="ghost" 
                  size="sm" 
                  className="mt-1 h-7 px-2 text-xs"
                >
                  <a 
                    href={chunk.audioUrl} 
                    download={`chunk_${chunk.index + 1}.wav`}
                    className="flex items-center gap-1"
                  >
                    <Download size={12} />
                    Download Chunk
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}