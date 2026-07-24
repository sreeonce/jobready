import { Calistoga } from "next/font/google";
import "./globals.css";

const calistoga = Calistoga({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-calistoga",
});

export const metadata = {
  title: "JobReady",
  description: "AI Resume Tailoring Tool — honest, not embellished.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={calistoga.variable}>
      <body>{children}</body>
    </html>
  );
}