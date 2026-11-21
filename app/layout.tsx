import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow | Make room for what matters",
  description: "A simple, friendly space to plan your work and finish what matters.",
};

const clerkIsConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {clerkIsConfigured ? <ClerkProvider>{children}</ClerkProvider> : children}
      </body>
    </html>
  );
}
