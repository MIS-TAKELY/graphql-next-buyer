
const CANONICAL_URL = process.env.CANONICAL_URL || "http://localhost:3000";

async function verifyPhoneLogin() {
    console.log("Testing phone login endpoint...");
    const url = `${CANONICAL_URL}/api/auth/sign-in/phone`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone: "9800000000",
                password: "wrongpassword"
            })
        });

        const status = response.status;
        const data = await response.json();

        console.log("Status:", status);
        console.log("Response:", JSON.stringify(data, null, 2));

        if (status === 401 && data.message === "Invalid phone number or password") {
            console.log("✅ Verification successful: Endpoint exists and handles invalid credentials correctly.");
        } else if (status === 404) {
            console.log("❌ Verification failed: Endpoint not found (404). Check if the plugin is registered correctly.");
        } else {
            console.log("❓ Verification inconclusive: Received unexpected response.");
        }

    } catch (error: any) {
        console.error("❌ Error during verification:", error.message);
    }
}

verifyPhoneLogin();
