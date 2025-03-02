import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TinyLMProvider } from "@/providers/tinylm-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TinyLM Voice Playground",
  description: "Try different voices and generate natural speech in your browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TinyLMProvider>
          {children}
          <Toaster />
        </TinyLMProvider>
      </body>
    </html>
  );
}