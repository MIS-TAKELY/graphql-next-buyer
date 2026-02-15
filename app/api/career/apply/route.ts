import { NextRequest, NextResponse } from "next/server";
import { senMail } from "@/services/nodeMailer.services";
import { z } from "zod";

const applicationSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    salary: z.string().min(1, "Expected salary is required"),
    cvUrl: z.string().url("Valid CV URL is required"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = applicationSchema.parse(body);

        await senMail("vanijayenterprises@gmail.com", "JOB_APPLICATION", {
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            salary: validatedData.salary,
            cvUrl: validatedData.cvUrl,
        });

        return NextResponse.json({ success: true, message: "Application submitted successfully" });
    } catch (error) {
        console.error("CAREER_APPLY_ERROR:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, errors: error.issues }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
