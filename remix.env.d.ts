/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SESSION_SECRET: string;
            DATABASE_URL: string;
            SPOTIFY_REDIRECT_URL: string;
            SPOTIFY_CLIENT_ID: string;
            SPOTIFY_CLIENT_SECRET: string;
        }
    }
}

export {};
