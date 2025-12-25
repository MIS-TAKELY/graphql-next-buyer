import { NextResponse } from "next/server";

export async function GET() {
    // Simple lightweight response to keep the lambda warm
    return NextResponse.json({
        status: "alive",
        timestamp: new Date().toISOString()
    });
}
