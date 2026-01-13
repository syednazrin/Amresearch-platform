"use client";

import PublicNav from "@/app/components/PublicNav";
import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Header Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-extralight text-black tracking-tighter mb-6">
              Privacy Policy
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
              Introduction
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              AMINVEST ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Information We Collect
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-light text-black mb-3 tracking-tight">
                  Personal Information
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 pl-6">
                  <li className="relative before:content-['•'] before:absolute before:-left-4">
                    Register for an account or book a meeting
                  </li>
                  <li className="relative before:content-['•'] before:absolute before:-left-4">
                    Subscribe to our newsletter or request information
                  </li>
                  <li className="relative before:content-['•'] before:absolute before:-left-4">
                    Contact us through our website
                  </li>
                  <li className="relative before:content-['•'] before:absolute before:-left-4">
                    Participate in our services
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-light text-black mb-3 tracking-tight">
                  Automatically Collected Information
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  When you visit our website, we may automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies installed on your device.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              How We Use Your Information
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              We use the information we collect or receive to:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 pl-6">
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                Provide, operate, and maintain our services
              </li>
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                Improve, personalize, and expand our services
              </li>
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                Communicate with you about services, updates, and promotional content
              </li>
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                Process your transactions and manage your requests
              </li>
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                Send you newsletters and marketing communications
              </li>
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                Detect and prevent fraud and ensure security
              </li>
            </ul>
          </section>

          {/* Sharing Your Information */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Sharing Your Information
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted third parties who assist us in operating our website, conducting our business, or servicing you, as long as those parties agree to keep this information confidential.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Data Security
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Your Rights
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 pl-6">
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                The right to access and receive a copy of your personal information
              </li>
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                The right to rectify or update your personal information
              </li>
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                The right to erase your personal information
              </li>
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                The right to restrict or object to our processing of your information
              </li>
              <li className="relative before:content-['•'] before:absolute before:-left-4">
                The right to data portability
              </li>
            </ul>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-3xl font-light text-black mb-6 tracking-tight">
              Contact Us
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              If you have questions or concerns about this Privacy Policy, please contact us at:
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
          <div className="mb-12">
            <Image
              src="/aminvestment-services-berhad-logo (1).png"
              alt="AMINVEST Logo"
              width={300}
              height={80}
              className="h-16 w-auto"
            />
          </div>

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
