"use client";

import { useTinyLM } from "@/providers/tinylm-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function SystemStatus() {
  const { 
    capabilities, 
    modelStatus, 
    modelStatusMessage,
    progressInfo
  } = useTinyLM();

  // Determine status indicator colors
  const getStatusColor = (status: boolean) => {
    return status ? "bg-green-500" : "bg-red-500";
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case "loaded":
        return "bg-green-500";
      case "loading":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(capabilities.isWebGPUSupported)}`}></div>
              <div className="font-medium">WebGPU:</div>
              <div>{capabilities.isWebGPUSupported ? "Available" : "Not Available"}</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(capabilities.fp16Supported)}`}></div>
              <div className="font-medium">FP16 Support:</div>
              <div>{capabilities.fp16Supported ? "Supported" : "Not Supported"}</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getModelStatusColor(modelStatus)}`}></div>
              <div className="font-medium">Model Status:</div>
              <div>{modelStatusMessage}</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="font-medium">Backend:</div>
              <div>{capabilities.backendName}</div>
            </div>
          </div>
        </div>

        {progressInfo.isVisible && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <div>{progressInfo.message}</div>
              <div>{progressInfo.percentComplete}%</div>
            </div>
            
            <Progress value={progressInfo.percentComplete} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <div>
                {progressInfo.overall.loadedSize} / {progressInfo.overall.totalSize}
              </div>
              <div>
                {progressInfo.overall.downloadSpeed} • {progressInfo.overall.eta}
              </div>
            </div>
            
            {progressInfo.files.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto space-y-2">
                {progressInfo.files.map(file => (
                  <div 
                    key={file.id} 
                    className="border rounded p-2 text-sm bg-background"
                  >
                    <div className="flex justify-between mb-1">
                      <div className="truncate max-w-[200px]">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {file.percentComplete}% • {formatBytes(file.bytesLoaded)} / {formatBytes(file.bytesTotal)}
                      </div>
                    </div>
                    <Progress value={file.percentComplete} className="h-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Format bytes helper
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}