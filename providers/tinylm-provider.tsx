"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { TinyLM } from "tinylm";
import { toast } from "sonner";

// Types from TinyLM
type ProgressUpdate = {
  status?: string;
  progress?: number;
  percentComplete?: number;
  message?: string;
  type?: string;
  files?: any[];
  overall?: {
    formattedLoaded?: string;
    formattedTotal?: string;
    formattedSpeed?: string;
    formattedRemaining?: string;
  };
};

type SpeechChunk = {
  text: string;
  audio: ArrayBuffer;
  content_type: string;
};

type SpeechStreamResult = {
  object: 'audio.speech.stream';
  chunks: SpeechChunk[];
};

type SpeechResult = {
  object: 'audio.speech';
  audio: ArrayBuffer;
  content_type: string;
};

type FileInfo = {
  id: string;
  name: string;
  status: string;
  percentComplete: number;
  bytesLoaded: number;
  bytesTotal: number;
  speed: number;
  timeRemaining: number | null;
};

type LogEntry = {
  timestamp: Date;
  message: string;
};

type VoiceInfo = {
  name: string;
  language: string;
  gender: string;
  traits?: string;
  targetQuality?: string;
  overallGrade?: string;
};

type AudioResult = {
  id: string;
  text: string;
  voice: string;
  speed: number;
  audioUrl: string;
  audioBlob: Blob;
  contentType: string;
  time: Date;
  timeTaken: number;
  chunks?: number;
};

type TinyLMContextType = {
  tinyLM: TinyLM | null;
  isInitialized: boolean;
  modelStatus: "not_loaded" | "loading" | "loaded" | "error";
  modelStatusMessage: string;
  capabilities: {
    isWebGPUSupported: boolean;
    fp16Supported: boolean;
    backendName: string;
  };
  progressInfo: {
    isVisible: boolean;
    message: string;
    percentComplete: number;
    files: FileInfo[];
    overall: {
      loadedSize: string;
      totalSize: string;
      downloadSpeed: string;
      eta: string;
    };
  };
  logEntries: LogEntry[];
  selectedModel: string;
  audioFormat: "mp3" | "wav";
  isGenerating: boolean;
  streamingEnabled: boolean;
  selectedVoice: string;
  playgroundText: string;
  playgroundSpeed: number;
  audioResult: AudioResult | null;
  generationHistory: AudioResult[];
  voicesList: Record<string, VoiceInfo>;
  streamChunks: any[];

  // Methods
  initTinyLM: () => Promise<void>;
  loadModel: () => Promise<void>;
  unloadModel: () => Promise<void>;
  setSelectedModel: (model: string) => void;
  setAudioFormat: (format: "mp3" | "wav") => void;
  setStreamingEnabled: (enabled: boolean) => void;
  setSelectedVoice: (voice: string) => void;
  setPlaygroundText: (text: string) => void;
  setPlaygroundSpeed: (speed: number) => void;
  generateSpeech: () => Promise<void>;
  addLogEntry: (message: string) => void;
  clearLogs: () => void;
};

// Define VOICES constant matching the original
const VOICES: Record<string, VoiceInfo> = {
  af: {
    name: "Default",
    language: "en-us",
    gender: "Female",
  },
  af_heart: {
    name: "Heart",
    language: "en-us",
    gender: "Female",
    traits: "❤️",
    targetQuality: "A",
    overallGrade: "A",
  },
  af_bella: {
    name: "Bella",
    language: "en-us",
    gender: "Female",
    traits: "🔥",
    targetQuality: "A",
    overallGrade: "A-",
  },
  af_nicole: {
    name: "Nicole",
    language: "en-us",
    gender: "Female",
    traits: "🎧",
    targetQuality: "B",
    overallGrade: "B-",
  },
  af_sarah: {
    name: "Sarah",
    language: "en-us",
    gender: "Female",
    targetQuality: "B",
    overallGrade: "C+",
  },
  af_sky: {
    name: "Sky",
    language: "en-us",
    gender: "Female",
    targetQuality: "B",
    overallGrade: "C-",
  },
  am_adam: {
    name: "Adam",
    language: "en-us",
    gender: "Male",
    targetQuality: "D",
    overallGrade: "F+",
  },
  am_michael: {
    name: "Michael",
    language: "en-us",
    gender: "Male",
    targetQuality: "B",
    overallGrade: "C+",
  },
  bf_emma: {
    name: "Emma",
    language: "en-gb",
    gender: "Female",
    traits: "🚺",
    targetQuality: "B",
    overallGrade: "B-",
  },
  bf_isabella: {
    name: "Isabella",
    language: "en-gb",
    gender: "Female",
    targetQuality: "B",
    overallGrade: "C",
  },
  bm_george: {
    name: "George",
    language: "en-gb",
    gender: "Male",
    targetQuality: "B",
    overallGrade: "C",
  },
  bm_lewis: {
    name: "Lewis",
    language: "en-gb",
    gender: "Male",
    targetQuality: "C",
    overallGrade: "D+",
  },
  ef_dora: {
    name: "Dora",
    language: "es",
    gender: "Female",
  },
  em_alex: {
    name: "Alex",
    language: "es",
    gender: "Male",
  },
  em_santa: {
    name: "Santa",
    language: "es",
    gender: "Male",
  },
  hf_alpha: {
    name: "Alpha",
    language: "hi",
    gender: "Female",
  },
  hf_beta: {
    name: "Beta",
    language: "hi",
    gender: "Female",
  },
  hm_omega: {
    name: "Omega",
    language: "hi",
    gender: "Male",
  },
  hm_psi: {
    name: "Psi",
    language: "hi",
    gender: "Male",
  }
};

// Create context with default values
const TinyLMContext = createContext<TinyLMContextType | undefined>(undefined);

export function TinyLMProvider({ children }: { children: React.ReactNode }) {
  const [tinyLM, setTinyLM] = useState<TinyLM | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modelStatus, setModelStatus] = useState<"not_loaded" | "loading" | "loaded" | "error">("not_loaded");
  const [modelStatusMessage, setModelStatusMessage] = useState("Not loaded");
  const [capabilities, setCapabilities] = useState({
    isWebGPUSupported: false,
    fp16Supported: false,
    backendName: "Unknown",
  });

  const [progressInfo, setProgressInfo] = useState({
    isVisible: false,
    message: "Loading model...",
    percentComplete: 0,
    files: [] as FileInfo[],
    overall: {
      loadedSize: "0 B",
      totalSize: "0 B",
      downloadSpeed: "0 B/s",
      eta: "--",
    },
  });

  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [selectedModel, setSelectedModel] = useState("onnx-community/Kokoro-82M-v1.0-ONNX");
  const [audioFormat, setAudioFormat] = useState<"mp3" | "wav">("wav");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("af");
  const [playgroundText, setPlaygroundText] = useState("");
  const [playgroundSpeed, setPlaygroundSpeed] = useState(1.0);
  const [audioResult, setAudioResult] = useState<AudioResult | null>(null);
  const [generationHistory, setGenerationHistory] = useState<AudioResult[]>([]);
  const [streamChunks, setStreamChunks] = useState<any[]>([]);

  // Initialize TinyLM instance
  const initTinyLM = useCallback(async () => {
    try {
      addLogEntry("Initializing TinyLM...");

      // Create TinyLM instance with progress tracking
      const newTinyLM = new TinyLM({
        progressCallback: handleProgressUpdate,
        progressThrottleTime: 50
      });

      // Check hardware capabilities
      addLogEntry("Checking hardware capabilities...");
      const caps = await newTinyLM.models.check();

      setCapabilities({
        isWebGPUSupported: caps.isWebGPUSupported,
        fp16Supported: caps.fp16Supported,
        backendName: caps.environment?.backend || "Unknown",
      });

      // Initialize TinyLM (without loading model yet)
      await newTinyLM.init({ lazyLoad: true });

      setTinyLM(newTinyLM);
      setIsInitialized(true);
      addLogEntry("Initialization complete. Ready to load TTS model.");

    } catch (error) {
      addLogEntry(`Error initializing TinyLM: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Initialization Error", {
        description: String(error),
      });
    }
  }, []);

  // Handle progress updates from TinyLM
  const handleProgressUpdate = useCallback((progress: ProgressUpdate) => {
    // Log message if provided
    if (progress.message) {
      addLogEntry(`[${progress.status || "update"}] (${progress.type || "unknown"}) ${progress.message}`);
    }

    // Update progress bar for loading
    if (progress.type === "tts_model" || progress.type === "model") {
      if (typeof progress.percentComplete === "number") {
        // Show progress container
        setProgressInfo(prev => ({
          ...prev,
          isVisible: true,
          message: progress.message || "Loading model...",
          percentComplete: progress.percentComplete || 0,
        }));
      }

      // Handle file-specific progress if available
      if (Array.isArray(progress.files) && progress.files.length > 0) {
        setProgressInfo(prev => ({
          ...prev,
          files: progress.files as FileInfo[],
        }));
      }

      // Handle overall stats
      if (progress.overall) {
        setProgressInfo(prev => ({
          ...prev,
          overall: {
            loadedSize: progress.overall?.formattedLoaded || "0 B",
            totalSize: progress.overall?.formattedTotal || "0 B",
            downloadSpeed: progress.overall?.formattedSpeed || "0 B/s",
            eta: progress.overall?.formattedRemaining || "--",
          },
        }));
      }

      // Hide progress displays when complete
      if (progress.status === "ready" || progress.status === "error") {
        setTimeout(() => {
          setProgressInfo(prev => ({
            ...prev,
            isVisible: false,
          }));
        }, 1500);
      }

      // Update model status indicator
      if (progress.status === "loading" || progress.status === "initiate" || progress.status === "progress") {
        setModelStatus("loading");
        setModelStatusMessage("Loading...");
      } else if (progress.status === "ready" || progress.status === "done") {
        setModelStatus("loaded");
        setModelStatusMessage("Loaded");
      } else if (progress.status === "error") {
        setModelStatus("error");
        setModelStatusMessage("Error");
      } else if (progress.status === "offloaded") {
        setModelStatus("not_loaded");
        setModelStatusMessage("Not loaded");
      }
    }
  }, []);

  // Add log entry
  const addLogEntry = useCallback((message: string) => {
    setLogEntries(prev => [
      ...prev,
      { timestamp: new Date(), message }
    ]);
    console.log(message);
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogEntries([]);
  }, []);

  // Load the selected model
  const loadModel = useCallback(async () => {
    if (!tinyLM) return;

    try {
      addLogEntry(`Loading TTS model: ${selectedModel}`);

      // UI updates
      setModelStatus("loading");

      // Load the model
      await tinyLM.init({
        ttsModels: [selectedModel],
        lazyLoad: false
      });

      // UI updates on success
      addLogEntry(`Model ${selectedModel} loaded successfully!`);
      setModelStatus("loaded");

      toast.success("Model Loaded", {
        description: `${selectedModel} loaded successfully!`,
      });

    } catch (error) {
      // UI updates on error
      addLogEntry(`Error loading model: ${error instanceof Error ? error.message : String(error)}`);
      setModelStatus("error");

      toast.error("Model Loading Error", {
        description: String(error),
      });
    }
  }, [tinyLM, selectedModel, toast]);

  // Unload the current model
  const unloadModel = useCallback(async () => {
    if (!tinyLM) return;

    try {
      addLogEntry(`Unloading TTS model: ${selectedModel}`);

      // UI updates
      setModelStatus("loading");

      // Unload the model
      await tinyLM.models.offloadTTS({ model: selectedModel });

      // UI updates on success
      addLogEntry(`Model ${selectedModel} unloaded successfully.`);
      setModelStatus("not_loaded");

      toast.success("Model Unloaded", {
        description: `${selectedModel} unloaded successfully!`,
      });

    } catch (error) {
      // UI updates on error
      addLogEntry(`Error unloading model: ${error instanceof Error ? error.message : String(error)}`);

      toast.error("Model Unloading Error", {
        description: String(error),
      });
    }
  }, [tinyLM, selectedModel, toast]);

  // Generate speech
  const generateSpeech = useCallback(async () => {
    if (!tinyLM || !playgroundText.trim()) {
      if (!playgroundText.trim()) {
        toast.error("Empty Text", {
          description: "Please enter text to speak",
        });
      }
      return;
    }

    // Get voice info
    const voiceInfo = VOICES[selectedVoice];
    if (!voiceInfo) {
      toast.error("Voice Error", {
        description: "Please select a valid voice",
      });
      return;
    }

    addLogEntry(`Generating speech with voice ${voiceInfo.name} for: "${playgroundText.substring(0, 30)}${playgroundText.length > 30 ? '...' : ''}"`);

    // Disable while generating
    setIsGenerating(true);

    try {
      // Time the operation
      const startTime = performance.now();

      // Clear previous stream chunks
      setStreamChunks([]);

      // Generate speech
      const result = await tinyLM.audio.speech.create({
        model: selectedModel,
        input: playgroundText,
        voice: selectedVoice,
        response_format: audioFormat,
        speed: playgroundSpeed,
        stream: streamingEnabled
      }) as SpeechResult | SpeechStreamResult;

      const timeTaken = performance.now() - startTime;

      // Re-enable the button
      setIsGenerating(false);

      // Handle streaming result
      if (streamingEnabled && result.object === 'audio.speech.stream' && 'chunks' in result && result.chunks.length > 0) {
        // Array to store all audio data
        const audioChunks: ArrayBuffer[] = [];
        const contentType = result.chunks[0].content_type;

        // Process all chunks
        const processedChunks = result.chunks.map((chunk: SpeechChunk, index: number) => {
          // Store the chunk's raw audio data
          audioChunks.push(chunk.audio);

          // Create blob for this chunk
          const chunkBlob = new Blob([chunk.audio], { type: contentType });
          const chunkUrl = URL.createObjectURL(chunkBlob);

          return {
            index,
            text: chunk.text,
            audioUrl: chunkUrl,
            size: chunk.audio.byteLength,
          };
        });

        // Update stream chunks display
        setStreamChunks(processedChunks);

        // Calculate total size
        const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
        addLogEntry(`Total combined size: ${formatBytes(totalLength)}`);

        // Create the final blob with all chunks
        const combinedBlob = new Blob(audioChunks, { type: contentType });
        const audioUrl = URL.createObjectURL(combinedBlob);

        // Create new result
        const newResult: AudioResult = {
          id: `audio-${Date.now()}`,
          text: playgroundText,
          voice: selectedVoice,
          speed: playgroundSpeed,
          audioUrl: audioUrl,
          audioBlob: combinedBlob,
          contentType: contentType,
          time: new Date(),
          timeTaken: timeTaken,
          chunks: result.chunks.length,
        };

        // Update audio result and history
        setAudioResult(newResult);
        setGenerationHistory(prev => [newResult, ...prev.slice(0, 49)]);

      } else if (!streamingEnabled) {
        // Handle non-streaming result
        if (!result || !('audio' in result)) {
          throw new Error('No audio data received from speech generation');
        }

        // Create blob from the audio data
        const audioBlob = new Blob([result.audio], { type: result.content_type || 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create new result
        const newResult: AudioResult = {
          id: `audio-${Date.now()}`,
          text: playgroundText,
          voice: selectedVoice,
          speed: playgroundSpeed,
          audioUrl: audioUrl,
          audioBlob: audioBlob,
          contentType: result.content_type || 'audio/wav',
          time: new Date(),
          timeTaken: timeTaken,
        };

        // Update audio result and history
        setAudioResult(newResult);
        setGenerationHistory(prev => [newResult, ...prev.slice(0, 49)]);
      } else {
        throw new Error('No valid audio data received from speech generation');
      }

      addLogEntry(`Speech generated successfully in ${Math.round(timeTaken)}ms`);

      toast.success("Speech Generated", {
        description: `Generated in ${Math.round(timeTaken)}ms`,
      });

    } catch (error) {
      // Re-enable the button
      setIsGenerating(false);

      addLogEntry(`Error generating speech: ${error instanceof Error ? error.message : String(error)}`);

      toast.error("Generation Error", {
        description: String(error),
      });
    }
  }, [tinyLM, playgroundText, selectedVoice, selectedModel, audioFormat, playgroundSpeed, streamingEnabled, toast]);

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Initialize on first load
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      initTinyLM();
    }
  }, [initTinyLM, isInitialized]);

  const value = {
    tinyLM,
    isInitialized,
    modelStatus,
    modelStatusMessage,
    capabilities,
    progressInfo,
    logEntries,
    selectedModel,
    audioFormat,
    isGenerating,
    streamingEnabled,
    selectedVoice,
    playgroundText,
    playgroundSpeed,
    audioResult,
    generationHistory,
    voicesList: VOICES,
    streamChunks,

    // Methods
    initTinyLM,
    loadModel,
    unloadModel,
    setSelectedModel,
    setAudioFormat,
    setStreamingEnabled,
    setSelectedVoice,
    setPlaygroundText,
    setPlaygroundSpeed,
    generateSpeech,
    addLogEntry,
    clearLogs,
  };

  return (
    <TinyLMContext.Provider value={value}>
      {children}
    </TinyLMContext.Provider>
  );
}

export function useTinyLM() {
  const context = useContext(TinyLMContext);
  if (context === undefined) {
    throw new Error("useTinyLM must be used within a TinyLMProvider");
  }
  return context;
}