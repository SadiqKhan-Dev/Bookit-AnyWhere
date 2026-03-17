import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/shared/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "BookIt — Book Salons, Hotels & Doctors",
    template: "%s | BookIt",
  },
  description:
    "The all-in-one platform for booking beauty salons, hotels, and doctor appointments. Instant confirmation, secure payments.",
  keywords: ["booking", "salon", "hotel", "doctor", "appointment", "reservation"],
  authors: [{ name: "BookIt" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "BookIt",
    title: "BookIt — Book Salons, Hotels & Doctors",
    description: "The all-in-one booking platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookIt",
    description: "The all-in-one booking platform",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
