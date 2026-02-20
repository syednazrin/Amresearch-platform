"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function PublicNav() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/alpha-mindset", label: "Alpha Mindset" },
    { href: "/documents", label: "Reports" },
    { href: "/trips", label: "Trips" },
    { href: "/book", label: "Book Meeting" },
    { href: "/login", label: "Login" },
  ];

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className={`${isHomePage ? 'absolute top-0 left-0 right-0 z-50 bg-transparent p-1' : 'bg-white'}`}>
        {/* Same layout on all pages: logo left, menu right – matches landing page */}
        <div className="flex items-center justify-between h-20 px-4 md:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/aminvestment-services-berhad-logo (1).png"
              alt="AMINVEST Logo"
              width={200}
              height={60}
              className="h-16 w-auto"
              priority
            />
          </Link>

          <button
            onClick={() => setIsMenuOpen(true)}
            className={`p-2 transition-colors cursor-pointer ${isHomePage ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}
            aria-label="Open menu"
          >
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </nav>

      {/* Full Page Menu Modal */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[100] bg-black/50 animate-fadeIn"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Slide-in Menu */}
          <div className="fixed inset-y-0 right-0 z-[101] w-full md:w-[600px] bg-white animate-slideInRight">
            {/* Header with Logo and Close Button */}
            <div className="flex items-center justify-between px-8 md:px-12 py-6">
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                <Image
                  src="/aminvestment-services-berhad-logo (1).png"
                  alt="AMINVEST Logo"
                  width={150}
                  height={40}
                  className="h-12 w-auto"
                />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-900 hover:text-gray-600 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="px-8 md:px-12 pt-12">
              <nav className="space-y-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-3xl md:text-4xl font-bold transition-colors ${
                      pathname === item.href
                        ? "text-primary"
                        : "text-gray-900 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
