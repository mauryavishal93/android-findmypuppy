/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
