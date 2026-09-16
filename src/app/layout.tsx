import type { Metadata, Viewport } from "next";
import "./globals.css";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "Get Started | BizzOne Digital",
  description:
    "Fill in your details and our team will reach out within 24–48 hours.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export const viewport: Viewport = {
  themeColor: "#05060A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-white">
        <div className="bg-space" />
        <div className="bg-grid" />
        {children}
        <ChatBot />
      </body>
    </html>
  );
}