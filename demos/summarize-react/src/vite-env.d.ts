/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZEROGPU_API_KEY: string
  readonly VITE_ZEROGPU_PROJECT_ID: string
  readonly VITE_ZEROGPU_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
