export const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://www.vanijay.com"
        : "http://localhost:3000");
