"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Castle,
  BookOpen,
  Compass,
  Scroll,
  Telescope,
  Sparkles,
  Settings,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "The Entrance", icon: Castle },
  { href: "/library", label: "My Shelves", icon: BookOpen },
  { href: "/discover", label: "Discover Tomes", icon: Compass },
  { href: "/departments", label: "Departments", icon: Sparkles },
  { href: "/journal", label: "Reading Journal", icon: Scroll },
  { href: "/observatory", label: "The Observatory", icon: Telescope },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-[#140E1D]/90 border-r border-[#C5A56A]/20 backdrop-blur-md sticky top-0 h-screen z-40 select-none shadow-2xl">
        {/* Crest & Header */}
        <div className="p-6 border-b border-[#C5A56A]/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C5A56A] to-[#39251F] p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-[#100D18] rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#C5A56A] animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-serif-magical text-lg font-bold tracking-wide text-[#E9DCC1] leading-tight">
              Grimmoire
            </h1>
            <p className="text-[10px] tracking-wider uppercase text-[#C5A56A]/80 font-medium">
              The Hogwarts Library
            </p>
          </div>
        </div>

        {/* Quick Add Tome Action */}
        <div className="px-4 pt-5 pb-2">
          <Link
            href="/discover"
            className="group flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C5A56A]/90 to-[#A08048] text-[#100D18] font-semibold text-sm shadow-md hover:from-[#DFCA9B] hover:to-[#C5A56A] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Add a Tome</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "text-[#F3D9A0] bg-[#21162E] shadow-sm border border-[#C5A56A]/30"
                    : "text-[#B7ADBD] hover:text-[#E9DCC1] hover:bg-[#21162E]/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#C5A56A] shadow-[0_0_8px_#C5A56A]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-[#C5A56A]"
                      : "text-[#B7ADBD] group-hover:text-[#C5A56A]/80"
                  }`}
                />
                <span className="font-serif-magical tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Scholar Status */}
        <div className="p-4 border-t border-[#C5A56A]/15 bg-[#100D18]/60 text-xs mt-auto flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#39251F] border border-[#C5A56A]/40 flex items-center justify-center text-[#E9DCC1] font-serif-magical font-bold text-xs">
              ✦
            </div>
            <div className="overflow-hidden">
              <p className="text-[#E9DCC1] font-medium truncate">Head Archivist</p>
              <p className="text-[#8E8495] text-[10px] tracking-wider uppercase">
                Sanctum Privatum
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#140E1D]/95 backdrop-blur-lg border-t border-[#C5A56A]/20 z-40 py-1.5 px-3 flex justify-around items-center"
        aria-label="Mobile Navigation"
      >
        {navItems.slice(0, 5).map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-md transition-colors ${
                isActive ? "text-[#C5A56A]" : "text-[#B7ADBD] hover:text-[#E9DCC1]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-1 font-serif-magical tracking-tight truncate max-w-[54px]">
                {item.label}
              </span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={`flex flex-col items-center py-1 px-2 rounded-md transition-colors ${
            pathname.startsWith("/settings") ? "text-[#C5A56A]" : "text-[#B7ADBD]"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[10px] mt-1 font-serif-magical tracking-tight">More</span>
        </Link>
      </nav>
    </>
  );
}
