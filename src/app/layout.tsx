import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  title: "SayHi 🔥",
  description: "Swipe. Match. Connect.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#000', color: '#fff', margin: 0 }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
