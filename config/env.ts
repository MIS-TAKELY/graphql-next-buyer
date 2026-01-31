export const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://www.vanijay.com"
        : "http://localhost:3000");

// Ensure APP_URL always has www in production if not explicitly overridden by local dev needs
export const CANONICAL_URL = process.env.NODE_ENV === "production" ? "https://www.vanijay.com" : APP_URL;
