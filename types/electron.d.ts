// Electron API type declarations
declare global {
  interface Window {
    electronAPI?: {
      on: (channel: string, callback: (event: any, ...args: any[]) => void) => void
      removeAllListeners: (channel: string) => void
      send: (channel: string, ...args: any[]) => void
    }
  }
}

export { }

