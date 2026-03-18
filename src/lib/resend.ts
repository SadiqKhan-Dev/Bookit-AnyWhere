import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Return a mock client during build/when no API key is available
      // This prevents build failures while allowing the app to compile
      console.warn("RESEND_API_KEY not configured. Email sending will be disabled.");
      return {
        emails: {
          send: async () => {
            console.warn("Email sending skipped: RESEND_API_KEY not configured");
            return { data: null, error: null };
          },
        },
      } as unknown as Resend;
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export const FROM_EMAIL = "onboarding@resend.dev";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
