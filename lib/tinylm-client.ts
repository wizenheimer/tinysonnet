/**
 * TinyLM Client Utilities
 * 
 * This file provides utilities for working with the TinyLM library from npm.
 * Install with: npm install tinylm
 */

import { TinyLM } from 'tinylm';

type ProgressUpdate = {
  status?: string;
  progress?: number;
  percentComplete?: number;
  message?: string;
  type?: string;
  files?: {
    id: string;
    name: string;
    status: string;
    percentComplete: number;
    bytesLoaded: number;
    bytesTotal: number;
    speed: number;
    timeRemaining: number | null;
  }[];
  overall?: {
    formattedLoaded?: string;
    formattedTotal?: string;
    formattedSpeed?: string;
    formattedRemaining?: string;
  };
};

type Environment = {
  backend?: string;
  device?: string;
  platform?: string;
  features?: string[];
};

/**
 * Helper function to check if code is running in a browser environment
 * with WebGPU support.
 */
export function checkWebGPUSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(navigator && navigator.gpu);
}

/**
 * Helper to format bytes into human-readable form
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Helper to format time in seconds to human-readable form
 */
export function formatTime(seconds: number): string {
  if (!seconds || seconds === 0) return '';
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `${minutes}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

/**
 * Creates and initializes a TinyLM instance with the given options.
 * This is a wrapper around the TinyLM constructor with error handling.
 */
export async function createTinyLM(options: {
  progressCallback?: (progress: ProgressUpdate) => void;
  progressThrottleTime?: number;
  lazyLoad?: boolean;
}): Promise<TinyLM> {
  try {
    // Create new TinyLM instance
    const tinyLM = new TinyLM({
      progressCallback: options.progressCallback,
      progressThrottleTime: options.progressThrottleTime || 100
    });

    // Initialize the instance
    await tinyLM.init({
      lazyLoad: options.lazyLoad !== false
    });

    return tinyLM;
  } catch (error) {
    console.error('Failed to initialize TinyLM:', error);
    throw new Error(`TinyLM initialization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper function to check capabilities of the current environment.
 * Useful for determining if WebGPU is available and what features are supported.
 */
export async function checkCapabilities(): Promise<{
  isWebGPUSupported: boolean;
  fp16Supported: boolean;
  environment: Environment;
}> {
  try {
    // Create temporary instance for checking capabilities
    const tempInstance = new TinyLM();
    const capabilities = await tempInstance.models.check();
    return capabilities;
  } catch (error) {
    console.error('Failed to check capabilities:', error);
    return {
      isWebGPUSupported: false,
      fp16Supported: false,
      environment: { backend: 'unknown' }
    };
  }
}

/**
 * Voice metadata and definitions from TinyLM.
 * This is a copy of the VOICES constant from the library for reference.
 */
export const VOICE_DATA = {
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
  // ...other voices
};

/**
 * Types for TinyLM - can be expanded as needed
 */
export type SpeechCreateOptions = {
  model: string;
  input: string;
  voice?: string;
  response_format?: 'mp3' | 'wav';
  speed?: number;
  stream?: boolean;
};

export type SpeechResult = {
  id: string;
  object: string;
  created: number;
  model: string;
  audio: ArrayBuffer;
  content_type: string;
};

export type SpeechStreamResult = {
  id: string;
  object: string;
  created: number;
  model: string;
  chunks: Array<{
    text: string;
    audio: ArrayBuffer;
    content_type: string;
  }>;
};