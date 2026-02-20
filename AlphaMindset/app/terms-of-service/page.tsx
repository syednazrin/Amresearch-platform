"use client";

import PublicNav from "@/app/components/PublicNav";
import Link from "next/link";
import Image from "next/image";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Header Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-extralight text-black tracking-tighter mb-6">
              Terms of Service
            </h1>
            <div className="w-32 h-px bg-black mb-8"></div>
            <p className="text-sm text-gray-500 tracking-wider">
              Last updated: January 8, 2026
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Agreement to Terms
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              By accessing or using AMINVEST's website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
            </p>
          </section>

          {/* Use of Services */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Use of Services
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-light text-black mb-3 tracking-tight">
                  Permitted Use
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  You may use our services for lawful purposes only. You agree not to use our services:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 pl-6">
                  <li className="relative before:content-['•'] before:absolute before:-left-4">
                    In any way that violates any applicable laws or regulations
                  </li>
                  <li className="relative before:content-['•'] before:absolute before:-left-4">
                    To transmit any harmful or malicious code
                  </li>
                  <li className="relative before:content-['•'] before:absolute before:-left-4">
                    To engage in any unauthorized access to our systems
                  </li>
                  <li className="relative before:content-['•'] before:absolute before:-left-4">
                    To impersonate any person or entity
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-light text-black mb-3 tracking-tight">
                  User Accounts
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  When you create an account with us, you are responsible for maintaining the security of your account and all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                </p>
              </div>
            </div>
          </section>

          {/* Investment Services */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Investment Research Services
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Our research reports and analysis are provided for informational purposes only and should not be considered as financial advice. All investment decisions should be made based on your own research and in consultation with qualified financial advisors.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Past performance is not indicative of future results. Investments involve risk, including the possible loss of principal.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Intellectual Property Rights
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              All content on our website, including but not limited to text, graphics, logos, images, and software, is the property of AMINVEST and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              You may not reproduce, distribute, modify, or create derivative works from our content without our express written permission.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Disclaimer of Warranties
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that our services will be uninterrupted, secure, or error-free.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Limitation of Liability
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, AMINVEST shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Termination
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Changes to Terms
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We reserve the right to modify or replace these Terms of Service at any time. We will provide notice of any material changes by posting the new Terms of Service on this page with an updated "Last updated" date.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Governing Law
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of Malaysia, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Contact Us
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Email: info@aminvest.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-white transition-all duration-1000 ease-out">
        <div className="max-w-7xl mx-auto px-6 py-16">
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
