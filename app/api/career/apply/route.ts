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
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = (formData.get("phone") as string) || "N/A";
        const salary = formData.get("salary") as string;
        const cvFile = formData.get("cv") as File;

        if (!name || !email || !salary || !cvFile) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Convert File to Buffer for Nodemailer
        const arrayBuffer = await cvFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await senMail(
            "vanijayenterprises@gmail.com",
            "JOB_APPLICATION",
            {
                name,
                email,
                phone,
                salary,
                cvUrl: "#", // Link is now secondary or removed from template if preferred
            },
            [
                {
                    filename: cvFile.name,
                    content: buffer,
                },
            ]
        );

        return NextResponse.json({ success: true, message: "Application submitted successfully with attachment" });
    } catch (error) {
        console.error("CAREER_APPLY_ERROR:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
