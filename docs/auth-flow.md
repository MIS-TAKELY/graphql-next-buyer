# Buyer Application Authentication Flow

This document details the authentication mechanism for the Buyer application. The system uses `better-auth` for core authentication (sessions, social login, email auth) combined with a custom implementation for WhatsApp/Phone verification.

## Architecture Overview

* **Auth Provider**: `better-auth` (with Prisma adapter).
* **Database**: PostgreSQL (managed via Prisma).
* **Phone Verification**: Custom implementation using WhatsApp (WPPConnect).
  * **Note**: Phone verification is a *pre-requisite* step for signup but does **not** create a user account by itself.
* **User Creation**: Occurs only after providing email/password or using a social provider.

## 1. Sign Up Flow

The sign-up process is a multi-step wizard designed to verify a phone number first, then collect user details, and finally verify the email.

### Step 1: Phone Verification (WhatsApp)

**UI Component**: `UnifiedAuth` (Steps: `SIGN_UP_WHATSAPP_INPUT` -> `SIGN_UP_WHATSAPP_OTP`)

1. **Input**: User enters their phone number.
2. **Check Existence**:
    * Endpoint: `POST /api/check-phone`
    * Checks if the phone number is already linked to an existing user.
    * If linked, user is prompted to sign in.
3. **Send OTP**:
    * Endpoint: `POST /api/auth/custom-phone/send`
    * Action: Generates a 6-digit OTP and stores it in the `Verification` table with identifier `custom_phone:{phone}`.
    * **Crucial**: This is isolated from the main `User` table. No user is created yet.
    * Delivery: Sends OTP via WhatsApp.
4. **Verify OTP**:
    * Endpoint: `POST /api/auth/custom-phone/verify`
    * Action: Validates the OTP against the `Verification` table.
    * Result: If valid, the UI marks `isWhatsAppVerified = true` in the local React state and proceeds to the next step.

### Step 2: Profile Creation

**UI Component**: `UnifiedAuth` (Step: `SIGN_UP_DETAILS`)

1. **Input**: User enters Name, Email, Password.
2. **Action**: Calls `signUp.email` (from `better-auth`).
3. **Payload**:
    * Standard fields: `name`, `email`, `password`.
    * Custom fields: `phoneNumber`, `phoneNumberVerified: true` (included *only* if Step 1 was successful).
4. **Backend Processing** (`lib/auth.ts`):
    * `user.create.before` hook:
        * Generates a `username` if missing (e.g., from email prefix + random ID).
        * Ensures `name` is populated.
    * `user.create.after` hook:
        * Assigns the `BUYER` role to the new user in `UserRole` table.
    * **Email Verification**: `better-auth` automatically triggers an email verification email (`sendOnSignUp: true`).

### Step 3: Email Verification

**UI Component**: `UnifiedAuth` (Step: `SIGN_UP_EMAIL_OTP`)

1. **State**: User is created but defined as "unverified" (no `emailVerified` timestamp).
2. **Input**: User enters the OTP sent to their email.
3. **Action**: Calls `authClient.emailOtp.verifyEmail`.
4. **Completion**:
    * Upon success, the user's `emailVerified` field is updated in the database.
    * The `UnifiedAuth` component detects the session update and redirects the user to the homepage (or closes the modal).

## 2. Sign In Flow

The login system supports multiple methods via a unified interface.

* **Phone/Password**:
  * Action: `authClient.phonePassword.signInPhone`
  * Input: Phone number and password.
* **Email/Password**:
  * Action: `signIn.email`
  * Input: Email and password.
* **Social Login**:
  * Providers: Google, Facebook, TikTok.
  * Action: `signIn.social({ provider: ... })`.
  * **TikTok Specific**: Uses a custom map (`mapProfileToUser`) to generate a unique username and handle missing emails (using placeholder `@vanijay.temp` emails).

## 3. Forgot Password Flow

**UI Component**: `UnifiedAuth` (Steps: `FORGOT_PASSWORD_INPUT` -> `OTP` -> `RESET`)

1. **Send OTP**:
    * Action: `authClient.phonePassword.sendForgotPasswordOtp`
    * Input: Email or Phone.
2. **Verify & Reset**:
    * Action: `authClient.phonePassword.resetPasswordWithOtp`
    * Input: Identifier, OTP, and New Password.

## 4. Key Files

* **Frontend Logic**: `buyer/components/auth/UnifiedAuth.tsx`
* **Auth Configuration**: `buyer/lib/auth.ts` (Server), `buyer/lib/auth-client.ts` (Client)
* **Custom Phone API**:
  * `buyer/app/api/auth/custom-phone/send/route.ts`
  * `buyer/app/api/auth/custom-phone/verify/route.ts`
* **Middleware**: `buyer/middleware.ts` (Protects routes based on session)
