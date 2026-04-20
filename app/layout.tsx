import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreelanceSolo — โปรแกรมช่วยคำนวณราคาและทำใบเสนอราคาออนไลน์",
  description: "เครื่องมือฟรีสำหรับฟรีแลนซ์ คำนวณราคางานและสร้างใบเสนอราคาแบบมืออาชีพ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
