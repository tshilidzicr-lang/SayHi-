import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SayHi 🔥 — Find Your Spark",
  description: "Swipe, match, and connect with people near you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-coal-900 text-white antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-center" toastOptions={{ style: { background: "#18181c", color: "#fff", border: "1px solid #3a3a46", borderRadius: "12px" } }} />
        </AuthProvider>
      </body>
    </html>
  );
}
