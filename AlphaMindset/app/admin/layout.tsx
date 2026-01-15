"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Plane, Calendar, Settings, LogOut, Menu, X, Sparkles, Users, Instagram, BarChart3 } from "lucide-react";

interface Session {
  isSuperAdmin?: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/documents", label: "Documents", icon: FileText },
    { href: "/admin/trips", label: "Trips", icon: Plane },
    { href: "/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/admin/analysts", label: "Analysts", icon: Sparkles },
    { href: "/admin/social-media", label: "Social Media", icon: Instagram },
    ...(session?.isSuperAdmin ? [{ href: "/admin/users", label: "Users", icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white border border-gray-300 hover:border-black transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="mb-2">
              <Image
                src="/aminvestment-services-berhad-logo (1).png"
                alt="AMINVEST Logo"
                width={150}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
            <p className="text-xs text-gray-500 tracking-wider uppercase">
              {session?.isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-6 md:p-8 lg:p-12">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
