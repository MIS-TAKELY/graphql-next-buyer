/**
 * Purchase Verification Guard
 * 
 * Checks if a user has the required verifications to make purchases.
 * - Email verification: Required for account creation and browsing
 * - Phone verification: Required for making purchases
 */

export interface PurchaseGuardResult {
    allowed: boolean;
    reason?: string;
    missingVerification?: "email" | "phone" | "both";
}

/**
 * Check if user can make purchases
 * @param user - The user object from session
 * @returns Object indicating if purchase is allowed and reason if not
 */
export function canPurchase(user: any): PurchaseGuardResult {
    if (!user) {
        return {
            allowed: false,
            reason: "Please sign in to make purchases",
            missingVerification: "both"
        };
    }

    if (!user.emailVerified) {
        return {
            allowed: false,
            reason: "Please verify your email first",
            missingVerification: "email"
        };
    }

    if (!user.phoneNumberVerified) {
        return {
            allowed: false,
            reason: "Please verify your phone number to make purchases",
            missingVerification: "phone"
        };
    }

    return { allowed: true };
}

/**
 * Check if user can browse (only email verification required)
 * @param user - The user object from session
 * @returns Object indicating if browsing is allowed
 */
export function canBrowse(user: any): { allowed: boolean; reason?: string } {
    if (!user) {
        return {
            allowed: true, // Allow guest browsing
        };
    }

    if (!user.emailVerified) {
        return {
            allowed: false,
            reason: "Please verify your email to access your account"
        };
    }

    return { allowed: true };
}

/**
 * Get verification status for UI display
 * @param user - The user object from session
 */
export function getVerificationStatus(user: any): {
    emailVerified: boolean;
    phoneVerified: boolean;
    canBrowse: boolean;
    canPurchase: boolean;
} {
    return {
        emailVerified: user?.emailVerified || false,
        phoneVerified: user?.phoneNumberVerified || false,
        canBrowse: user?.emailVerified || false,
        canPurchase: (user?.emailVerified && user?.phoneNumberVerified) || false,
    };
}
