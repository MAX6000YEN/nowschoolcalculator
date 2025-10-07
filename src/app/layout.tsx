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

          <footer className="glass-card m-4 p-4 text-center text-white/80">
            NowBrains – Calculateur de formation – v1.0
          </footer>
        </div>
      </body>
    </html>
  );
}
