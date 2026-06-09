import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get Started | BizzOne Digital",
  description: "Fill in your details and our team will reach out within 24–48 hours.",
};
export const viewport: Viewport = { themeColor: "#05060A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-white">
        <div className="bg-space" />
        <div className="bg-grid" />
        {children}
      </body>
    </html>
  );
}
