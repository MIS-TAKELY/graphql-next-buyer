import { auth } from "../lib/auth";

async function testEndpoint() {
    console.log("Simulating request to /api/auth/phone-password/sign-in-phone...");

    // We can simulate a Request object
    const req = new Request("https://localhost:3000/api/auth/phone-password/sign-in-phone", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            phone: "1234567890",
            password: "test"
        })
    });

    try {
        const res = await auth.handler(req);
        console.log("Status Code:", res.status);
        if (res.status === 404) {
            console.log("❌ Received 404. Route NOT registered or prefix mismatch.");
        } else {
            console.log("✅ Received status:", res.status);
        }

        // Let's also try WITHOUT the prefix
        console.log("\nSimulating request to /api/auth/sign-in-phone (no prefix)...");
        const req2 = new Request("https://localhost:3000/api/auth/sign-in-phone", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone: "1234567890",
                password: "test"
            })
        });
        const res2 = await auth.handler(req2);
        console.log("Status Code (no prefix):", res2.status);

    } catch (error) {
        console.error("Error during simulation:", error);
    }
}

testEndpoint();
