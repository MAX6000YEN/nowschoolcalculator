import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "NowSchoolCalculator - NowBrains",
  description: "Calculateur de formation NowBrains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="container mx-auto px-4 py-6 flex justify-center">
            <Image
              src="/Logo NowSchool - Fond clair.png"
              alt="NowSchool Logo"
              width={200}
              height={60}
              className="h-auto"
              priority
            />
          </header>
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>

          <footer className="p-4 text-center text-gray-500">
            NowSchool - 2025
          </footer>
        </div>
      </body>
    </html>
  );
}
