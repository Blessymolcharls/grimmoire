import type { Metadata } from "next";
import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grimmoire — The Hogwarts Library",
  description:
    "An atmospheric, interactive digital sanctuary chronicling books read, worlds visited, and memories preserved in the castle halls.",
  keywords: ["reading tracker", "grimmoire", "hogwarts library", "bookshelf", "reading journal", "magical archive"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:flex-row bg-[#100D18] text-[#E9DCC1] selection:bg-[#C5A56A]/30 selection:text-[#F3D9A0]">
        <Navigation />
        <main className="flex-1 min-w-0 pb-20 md:pb-8 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
