/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI?: {
      getAudio: (text: string, voice?: string) => Promise<string | null>;
    };
  }
}

export {};
