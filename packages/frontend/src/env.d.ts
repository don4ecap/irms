/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IRMS_BACKEND_URL: string
  readonly VITE_ICMS_BACKEND_URL: string
  readonly VITE_IRMS_VERSION: string
  readonly VITE_IRMS_GIT_BRANCH_LINK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
