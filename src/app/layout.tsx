import type { Metadata } from "next";
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
