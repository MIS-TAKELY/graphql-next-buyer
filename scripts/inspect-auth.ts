import { phonePassword } from "../lib/auth-plugins/phone-password";

console.log("Checking plugin structure directly...");
try {
    const plugin = phonePassword();
    console.log("Plugin ID:", plugin.id);
    console.log("Plugin Endpoints keys:", Object.keys(plugin.endpoints || {}));

    const signInPhone = plugin.endpoints?.signInPhone as any;
    if (signInPhone) {
        console.log("signInPhone endpoint found:");
        console.log("- Path:", signInPhone.path);
        console.log("- Method:", signInPhone.options?.method);
    } else {
        console.log("❌ signInPhone endpoint NOT found in plugin.endpoints");
    }
} catch (error) {
    console.error("Error inspecting plugin:", error);
}
