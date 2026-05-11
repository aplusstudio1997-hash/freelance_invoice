import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { DocumentProvider } from "@/lib/documents";

export const metadata: Metadata = {
  title: "So1o Freelancer — หลังบ้านฟรีแลนซ์ของคุณ",
  description:
    "ระบบจัดการเอกสาร รายได้ ภาษี ลูกค้า และ Subscription สำหรับฟรีแลนซ์ — ครบในที่เดียว ใช้ฟรีตลอดช่วง Beta",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fffaf3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans">
        <AuthProvider>
          <DocumentProvider>{children}</DocumentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
