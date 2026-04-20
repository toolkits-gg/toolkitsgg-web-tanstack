/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Client-side environment variables
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_CLOUDFRONT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Server-side environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DATABASE_URL: string
      readonly BETTER_AUTH_SECRET: string
      readonly BETTER_AUTH_URL: string
      readonly NODE_ENV: 'development' | 'production' | 'test'
      readonly DISCORD_CLIENT_ID: string
      readonly DISCORD_CLIENT_SECRET: string
      readonly IMAGEKIT_CLIENT_ID: string
      readonly IMAGEKIT_CLIENT_SECRET: string
      readonly IMAGEKIT_ENDPOINT_URL: string
      readonly RESEND_KEY: string
    }
  }
}

export {}