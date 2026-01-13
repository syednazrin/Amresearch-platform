"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PublicNav from "@/app/components/PublicNav";
import Image from "next/image";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard or the page they tried to access
      const redirect = searchParams.get("redirect") || "/admin";
      router.push(redirect);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNav />
      
      <div className="flex-1 flex items-center justify-center p-6 pt-32">
        <div className="max-w-md w-full">
          <div className="mb-12 text-center">
            <Image
              src="/aminvestment-services-berhad-logo (1).png"
              alt="AMINVEST Logo"
              width={200}
              height={60}
              className="h-16 w-auto mx-auto mb-8"
            />
            <div className="w-32 h-px bg-black mx-auto mb-6"></div>
            <p className="text-sm text-gray-600 tracking-wider">Sign in to your account</p>
          </div>

          {searchParams.get("error") === "unauthorized" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">
                You need admin access to view this page.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-900 mb-2 tracking-wider uppercase"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                placeholder="admin@aminvest.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-900 mb-2 tracking-wider uppercase"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-[0.3em] uppercase"
              style={{ backgroundColor: '#FF0009' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#CC0007')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#FF0009')}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Default credentials: admin@aminvest.com / admin123
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-white transition-all duration-1000 ease-out">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Large Brand Logo */}
          <div className="mb-12">
            <Image
              src="/aminvestment-services-berhad-logo (1).png"
              alt="AMINVEST Logo"
              width={300}
              height={80}
              className="h-16 w-auto"
            />
          </div>

          {/* Organized Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-12 border-b border-gray-200">
            <div>
              <h3 className="text-xs font-semibold text-black mb-4 uppercase tracking-wider">
                Company
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Malaysia</p>
                <p>Investment Research</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-black mb-4 uppercase tracking-wider">
                Contact
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <a href="tel:+15551234567" className="block hover:text-black transition-colors duration-300">
                  +1 (555) 123-4567
                </a>
                <a href="mailto:info@aminvest.com" className="block hover:text-black transition-colors duration-300">
                  info@aminvest.com
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-black mb-4 uppercase tracking-wider">
                Navigate
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <Link href="/" className="block hover:text-black transition-colors duration-300">
                  Home
                </Link>
                <Link href="/documents" className="block hover:text-black transition-colors duration-300">
                  Reports
                </Link>
                <Link href="/trips" className="block hover:text-black transition-colors duration-300">
                  Trips
                </Link>
                <Link href="/book" className="block hover:text-black transition-colors duration-300">
                  Book Meeting
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-black mb-4 uppercase tracking-wider">
                Legal
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <Link href="/privacy-policy" className="block hover:text-black transition-colors duration-300">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="block hover:text-black transition-colors duration-300">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8">
            <p className="text-xs text-gray-400 tracking-wider">
              © {new Date().getFullYear()} AMINVEST. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
