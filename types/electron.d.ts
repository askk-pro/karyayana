// Electron API type declarations
declare global {
  interface Window {
    electronAPI: {
      // Sound management
      uploadSound: (data: { name: string; buffer: Buffer; originalName: string }) => Promise<{
        id: string
        name: string
        filename: string
        filepath: string
        url: string
      }>
      getSounds: () => Promise<
        Array<{
          id: string
          name: string
          filename: string
          filepath: string
          url: string
          duration?: number
          created_at: string
        }>
      >
      deleteSound: (id: string) => Promise<boolean>
      updateSoundDuration: (data: { id: string; duration: number }) => Promise<boolean>

      // Task management
      saveTask: (task: any) => Promise<any>
      getTasks: () => Promise<any[]>
      updateTask: (task: any) => Promise<any>
      deleteTask: (id: string) => Promise<boolean>

      // Event listeners
      on: (channel: string, callback: (event: any, ...args: any[]) => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}

export {}
