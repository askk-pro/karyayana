// Enhanced Electron API type declarations
declare global {
  interface Window {
    electronAPI: {
      // System timestamp for accurate calculations
      getCurrentTimestamp: () => Promise<number>

      // Notification management
      cancelTimerNotification: (timerId: string) => Promise<boolean>

      // Enhanced Sound management
      uploadSound: (data: {
        name: string
        buffer: Buffer
        originalName: string
        startTime?: number
        endTime?: number
        volume?: number
        primaryColor?: string
        secondaryColor?: string
      }) => Promise<{
        id: string
        name: string
        filename: string
        filepath: string
        url: string
        volume?: number
        start_time?: number
        end_time?: number
        primary_color?: string
        secondary_color?: string
        display_order?: number
      }>
      getSounds: () => Promise<
        Array<{
          id: string
          name: string
          filename: string
          filepath: string
          url: string
          duration?: number
          volume?: number
          start_time?: number
          end_time?: number
          primary_color?: string
          secondary_color?: string
          display_order?: number
          created_at: string
        }>
      >
      updateSound: (data: {
        id: string
        name?: string
        volume?: number
        start_time?: number
        end_time?: number
        primary_color?: string
        secondary_color?: string
      }) => Promise<boolean>
      updateSoundOrder: (soundOrders: Array<{ id: string; order: number }>) => Promise<boolean>
      deleteSound: (id: string) => Promise<boolean>
      updateSoundDuration: (data: { id: string; duration: number }) => Promise<boolean>

      // Enhanced Timer management
      saveTimer: (timer: any) => Promise<any>
      getTimers: () => Promise<any[]>
      updateTimer: (timer: any) => Promise<any>
      updateTimerOrder: (timerOrders: Array<{ id: string; order: number }>) => Promise<boolean>
      deleteTimer: (id: string) => Promise<boolean>

      // App settings
      getAppSetting: (key: string) => Promise<string | null>
      setAppSetting: (data: { key: string; value: string }) => Promise<boolean>

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
