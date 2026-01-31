import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(null);
        }

        return NextResponse.json(session);
    } catch (error) {
        console.error("Error in get-session route:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export const OPTIONS = async () => {
    return NextResponse.json({}, {
        headers: {
            "Access-Control-Allow-Origin": "https://www.vanijay.com",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
        }
    });
};
