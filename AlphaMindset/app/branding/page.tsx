"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X } from "lucide-react";

export default function BrandingPage() {
  const [activeSection, setActiveSection] = useState("colors");
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = [
    { id: "logos", label: "Logos" },
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "buttons", label: "Buttons" },
    { id: "borders", label: "Borders & Spacing" },
    { id: "backgrounds", label: "Backgrounds" },
    { id: "modals", label: "Modals" },
    { id: "cards", label: "Cards" },
    { id: "skeletons", label: "Skeleton Loading" },
    { id: "upload", label: "Upload Areas" },
    { id: "rules", label: "Design Rules" },
  ];

  // Track scroll position and update active section
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const handleScroll = () => {
      const scrollPosition = contentElement.scrollTop + 100; // Offset for better UX

      // Find which section is currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    contentElement.addEventListener("scroll", handleScroll);
    return () => contentElement.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    const contentElement = contentRef.current;
    if (element && contentElement) {
      const offsetTop = element.offsetTop - 20; // Small offset from top
      contentElement.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Fixed */}
      <div className="w-64 border-r border-gray-200 p-6 bg-gray-50 flex-shrink-0 overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Components</h3>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all ${
                activeSection === section.id
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content - Scrollable */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Logos Section */}
          <div id="logos">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Logos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Dark Logo */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Dark Logo</h3>
                <p className="text-sm text-gray-600 mb-4">Use on light backgrounds (gray-50, white)</p>
                <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center mb-4">
                  <div className="h-16 w-auto flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">AMINVEST</span>
                  </div>
                </div>
                <code className="text-sm font-mono text-gray-600">/aminvest_dark_logo.svg</code>
                <p className="text-xs text-gray-500 mt-2">Fill color: #010101 (black)</p>
              </div>

              {/* Light Logo */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Light Logo</h3>
                <p className="text-sm text-gray-600 mb-4">Use on dark backgrounds (primary, gray-900)</p>
                <div className="bg-primary rounded-xl p-6 flex items-center justify-center mb-4">
                  <div className="h-16 w-auto flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">AMINVEST</span>
                  </div>
                </div>
                <code className="text-sm font-mono text-gray-600">/aminvest_light_logo.svg</code>
                <p className="text-xs text-gray-500 mt-2">Fill color: white</p>
              </div>
            </div>

            {/* Logo Usage Guidelines */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Logo Usage Guidelines</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">Size</p>
                  <p className="text-sm text-gray-600">Recommended height: 48px-80px (h-12 to h-20). Maintain aspect ratio when scaling.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">Spacing</p>
                  <p className="text-sm text-gray-600">Maintain clear space around the logo equal to at least 20% of the logo height.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">Background</p>
                  <p className="text-sm text-gray-600">Use dark logo on light backgrounds (gray-50, white). Use light logo on dark backgrounds (primary blue, gray-900).</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-900 font-semibold mb-2">❌ Never modify the logo</p>
                  <p className="text-sm text-red-700">Do not change colors, distort, rotate, or add effects to the logo. Always use the provided SVG files.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Colors Section */}
          <div id="colors">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Colors</h2>
            
            {/* Primary Colors - JP Morgan Blue */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Primary Colors - JP Morgan Blue</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="w-full h-32 bg-primary rounded-xl mb-4"></div>
                  <h4 className="font-bold text-gray-900 mb-2">Primary</h4>
                  <p className="text-sm text-gray-600 mb-2">Main brand color for buttons and accents</p>
                  <code className="text-sm font-mono text-gray-600">#0070BA</code>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="w-full h-32 bg-primary-hover rounded-xl mb-4"></div>
                  <h4 className="font-bold text-gray-900 mb-2">Primary Hover</h4>
                  <p className="text-sm text-gray-600 mb-2">Hover state for primary elements</p>
                  <code className="text-sm font-mono text-gray-600">#005A94</code>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="w-full h-32 bg-primary-dark rounded-xl mb-4"></div>
                  <h4 className="font-bold text-gray-900 mb-2">Primary Dark</h4>
                  <p className="text-sm text-gray-600 mb-2">Darker variant for depth</p>
                  <code className="text-sm font-mono text-gray-600">#004670</code>
                </div>
              </div>
            </div>

            {/* Neutral Colors */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Neutral Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-full h-20 bg-white border border-gray-200 rounded-lg mb-3"></div>
                  <p className="text-sm font-bold text-gray-900 mb-1">White</p>
                  <code className="text-xs font-mono text-gray-600">#FFFFFF</code>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-full h-20 bg-gray-50 rounded-lg mb-3"></div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Gray 50</p>
                  <code className="text-xs font-mono text-gray-600">#F9FAFB</code>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-full h-20 bg-gray-100 rounded-lg mb-3"></div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Gray 100</p>
                  <code className="text-xs font-mono text-gray-600">#F3F4F6</code>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-full h-20 bg-gray-200 rounded-lg mb-3"></div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Gray 200</p>
                  <code className="text-xs font-mono text-gray-600">#E5E7EB</code>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-full h-20 bg-gray-600 rounded-lg mb-3"></div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Gray 600</p>
                  <code className="text-xs font-mono text-gray-600">#4B5563</code>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-full h-20 bg-gray-900 rounded-lg mb-3"></div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Gray 900</p>
                  <code className="text-xs font-mono text-gray-600">#111827</code>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div id="typography">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Typography</h2>
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Font Family</h3>
                <p className="text-lg text-gray-600 mb-2">Primary Font: <span className="font-bold text-gray-900">Geist Sans</span></p>
                <code className="text-sm font-mono bg-gray-50 px-3 py-1 rounded">font-family: &apos;Geist Sans&apos;, sans-serif;</code>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Font Sizes</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-5xl font-bold text-gray-900 mb-2">Heading 1</p>
                    <code className="text-sm font-mono text-gray-600">text-5xl (48px) • font-bold</code>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-gray-900 mb-2">Heading 2</p>
                    <code className="text-sm font-mono text-gray-600">text-4xl (36px) • font-bold</code>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">Heading 3</p>
                    <code className="text-sm font-mono text-gray-600">text-3xl (30px) • font-bold</code>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">Heading 4</p>
                    <code className="text-sm font-mono text-gray-600">text-2xl (24px) • font-bold</code>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900 mb-2">Heading 5</p>
                    <code className="text-sm font-mono text-gray-600">text-xl (20px) • font-semibold</code>
                  </div>
                  <div>
                    <p className="text-base text-gray-600 mb-2">Body Text</p>
                    <code className="text-sm font-mono text-gray-600">text-base (16px) • text-gray-600</code>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Small Text</p>
                    <code className="text-sm font-mono text-gray-600">text-sm (14px) • text-gray-600</code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Extra Small Text</p>
                    <code className="text-sm font-mono text-gray-600">text-xs (12px) • text-gray-600</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons Section */}
          <div id="buttons">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Buttons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Button */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Primary Button</h3>
                <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors">
                  Button Text
                </button>
              </div>

              {/* Secondary Button */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Secondary Button</h3>
                <button className="px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 rounded-xl font-semibold transition-colors">
                  Button Text
                </button>
              </div>

              {/* Ghost Button */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ghost Button</h3>
                <button className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                  Button Text
                </button>
              </div>

              {/* Danger Button */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Danger Button</h3>
                <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
                  Button Text
                </button>
              </div>
            </div>
          </div>

          {/* Borders & Spacing Section */}
          <div id="borders">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Borders & Spacing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Border Radius */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Border Radius</h3>
                <div className="space-y-4">
                  <div>
                    <div className="w-32 h-16 bg-primary rounded-lg mb-2"></div>
                    <code className="text-sm font-mono text-gray-600">rounded-lg (8px)</code>
                    <p className="text-xs text-gray-500 mt-1">Small elements, buttons</p>
                  </div>
                  <div>
                    <div className="w-32 h-16 bg-primary rounded-xl mb-2"></div>
                    <code className="text-sm font-mono text-gray-600">rounded-xl (12px)</code>
                    <p className="text-xs text-gray-500 mt-1">Medium cards, modals</p>
                  </div>
                  <div>
                    <div className="w-32 h-16 bg-primary rounded-2xl mb-2"></div>
                    <code className="text-sm font-mono text-gray-600">rounded-2xl (16px)</code>
                    <p className="text-xs text-gray-500 mt-1">Large cards, containers</p>
                  </div>
                </div>
              </div>

              {/* Border Styles */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Border Styles</h3>
                <div className="space-y-4">
                  <div>
                    <div className="w-full h-16 border border-gray-200 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-sm text-gray-600">Default Border</span>
                    </div>
                    <code className="text-sm font-mono text-gray-600">border border-gray-200</code>
                  </div>
                  <div>
                    <div className="w-full h-16 border-2 border-gray-900 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-sm text-gray-900 font-semibold">Emphasis Border</span>
                    </div>
                    <code className="text-sm font-mono text-gray-600">border-2 border-gray-900</code>
                  </div>
                  <div>
                    <div className="w-full h-16 border-2 border-primary rounded-lg flex items-center justify-center mb-2">
                      <span className="text-sm text-primary font-semibold">Active Border</span>
                    </div>
                    <code className="text-sm font-mono text-gray-600">border-2 border-primary</code>
                  </div>
                </div>
              </div>

              {/* Spacing Scale */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Spacing Scale</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-primary rounded"></div>
                    <code className="text-sm font-mono text-gray-600">2 (8px)</code>
                    <span className="text-xs text-gray-500">Tight spacing</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-primary rounded"></div>
                    <code className="text-sm font-mono text-gray-600">3 (12px)</code>
                    <span className="text-xs text-gray-500">Compact spacing</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    <code className="text-sm font-mono text-gray-600">4 (16px)</code>
                    <span className="text-xs text-gray-500">Default spacing</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-primary rounded"></div>
                    <code className="text-sm font-mono text-gray-600">6 (24px)</code>
                    <span className="text-xs text-gray-500">Comfortable spacing</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary rounded"></div>
                    <code className="text-sm font-mono text-gray-600">8 (32px)</code>
                    <span className="text-xs text-gray-500">Large spacing</span>
                  </div>
                </div>
              </div>

              {/* Shadows */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Shadows</h3>
                <div className="space-y-4">
                  <div>
                    <div className="w-full h-16 bg-white shadow-sm rounded-lg flex items-center justify-center mb-2">
                      <span className="text-sm text-gray-600">Small Shadow</span>
                    </div>
                    <code className="text-sm font-mono text-gray-600">shadow-sm</code>
                  </div>
                  <div>
                    <div className="w-full h-16 bg-white shadow rounded-lg flex items-center justify-center mb-2">
                      <span className="text-sm text-gray-600">Default Shadow</span>
                    </div>
                    <code className="text-sm font-mono text-gray-600">shadow</code>
                  </div>
                  <div>
                    <div className="w-full h-16 bg-white shadow-lg rounded-lg flex items-center justify-center mb-2">
                      <span className="text-sm text-gray-900 font-semibold">Large Shadow</span>
                    </div>
                    <code className="text-sm font-mono text-gray-600">shadow-lg</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Colors Section */}
          <div id="backgrounds">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Background Colors</h2>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="font-semibold text-gray-900">Page Background</span>
                  <code className="text-sm font-mono text-gray-600">bg-gray-50</code>
                </div>
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <span className="font-semibold text-gray-900">Card Background</span>
                  <code className="text-sm font-mono text-gray-600">bg-white</code>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="font-semibold text-gray-900">Subtle Background</span>
                  <code className="text-sm font-mono text-gray-600">bg-gray-50</code>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-100 border border-gray-200 rounded-lg">
                  <span className="font-semibold text-gray-900">Hover State</span>
                  <code className="text-sm font-mono text-gray-600">hover:bg-gray-100</code>
                </div>
              </div>
            </div>
          </div>

          {/* Modals Section */}
          <div id="modals">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Modals</h2>
            
            {/* Standard Modal */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Standard Modal</h3>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Modal Title</h2>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-4">Modal content goes here...</p>
                <div className="flex gap-3 justify-end">
                  <button className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors">
                    Confirm
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Confirmation Modal</h3>
              <div className="bg-gray-50 border-2 border-red-200 rounded-2xl p-6 relative max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div id="cards">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Cards</h2>
            
            {/* Simple Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Simple Card</h3>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 max-w-sm">
                <h4 className="font-bold text-gray-900 mb-2">Card Title</h4>
                <p className="text-sm text-gray-600">Card description goes here with relevant details about the content.</p>
              </div>
            </div>

            {/* Interactive Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Interactive Card (Hover Effect)</h3>
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-primary transition-all cursor-pointer max-w-sm">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900">Interactive Card</h4>
                  <span className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-xs font-semibold">Active</span>
                </div>
                <p className="text-sm text-gray-600">Hover over this card to see the effect.</p>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Status Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">Success</span>
                  </div>
                  <p className="text-sm text-gray-600">Operation completed successfully</p>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">Error</span>
                  </div>
                  <p className="text-sm text-gray-600">Something went wrong</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton Loading Section */}
          <div id="skeletons">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Skeleton Loading</h2>
            
            {/* Card Skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Card Skeleton</h3>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                <div className="mb-4 -mx-6 -mt-6">
                  <div className="w-full h-40 bg-gray-200 rounded-t-2xl"></div>
                </div>
                <div className="flex items-start justify-between mb-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <code className="text-sm font-mono text-gray-600 mt-4 block">
                className="animate-pulse" with bg-gray-200 placeholders
              </code>
            </div>

            {/* List Skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">List Skeleton</h3>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
              <code className="text-sm font-mono text-gray-600 mt-4 block">
                Use animate-pulse with gray-200 backgrounds
              </code>
            </div>

            {/* Guidelines */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Skeleton Guidelines</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">When to Use</p>
                  <p className="text-sm text-gray-600">Always show skeleton loading states while fetching data. Never show "Not Found" or empty states until loading is complete.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">Implementation</p>
                  <p className="text-sm text-gray-600">Use <code className="font-mono bg-white px-2 py-1 rounded">animate-pulse</code> Tailwind class with <code className="font-mono bg-white px-2 py-1 rounded">bg-gray-200</code> for skeleton elements. Match the skeleton structure to the actual content layout.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">Best Practices</p>
                  <p className="text-sm text-gray-600">• Show 3-6 skeleton items to indicate loading<br/>• Match skeleton dimensions to actual content<br/>• Use gray-200 for skeleton backgrounds<br/>• Only show empty states after loading completes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Areas Section */}
          <div id="upload">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Upload Areas</h2>
            
            {/* Standard Upload Area */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Standard Upload Area</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-gray-900">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF up to 5MB
                </p>
              </div>
            </div>

            {/* Compact Upload Button */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Compact Upload Button</h3>
              <label className="inline-block cursor-pointer">
                <input type="file" className="hidden" />
                <div className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
                  Choose File
                </div>
              </label>
            </div>
          </div>

          {/* Design Rules Section */}
          <div id="rules">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Design Rules</h2>
            
            {/* General Rules */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">General Guidelines</h3>
              <div className="space-y-3">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-900 font-semibold mb-2">❌ Never use gradients</p>
                  <p className="text-sm text-red-700">Gradients make the design inconsistent. Use solid colors only.</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-900 font-semibold mb-2">✓ Use solid colors</p>
                  <p className="text-sm text-green-700">Solid colors maintain visual consistency across the application.</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-900 font-semibold mb-2">❌ Never use emojis in UI</p>
                  <p className="text-sm text-red-700">Use icons, text, or symbols instead for a professional and consistent appearance.</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-900 font-semibold mb-2">✓ Use consistent spacing</p>
                  <p className="text-sm text-green-700">Follow the spacing scale (8px, 12px, 16px, 24px, 32px) for layout consistency.</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-900 font-semibold mb-2">✓ Always use skeleton loading</p>
                  <p className="text-sm text-green-700">Show skeleton animations while data is loading. Never show "Not Found" or empty states until loading is complete. Use <code className="font-mono bg-white px-2 py-1 rounded">animate-pulse</code> with gray-200 backgrounds to create skeleton placeholders.</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-900 font-semibold mb-2">❌ Never show "Not Found" during loading</p>
                  <p className="text-sm text-red-700">Always show skeleton loading states first. Only display "Not Found" or empty states after data has finished loading and confirmed to be empty.</p>
                </div>
              </div>
            </div>

            {/* Component Guidelines */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Component Guidelines</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">Buttons</p>
                  <p className="text-sm text-gray-600">Use primary button for main actions, secondary for alternatives, and danger for destructive actions.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">Cards</p>
                  <p className="text-sm text-gray-600">Cards should have white backgrounds with gray-200 borders. Add hover effects for interactive cards.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">Modals</p>
                  <p className="text-sm text-gray-600">Center modals with backdrop-blur overlay. Include clear close button and action buttons at bottom.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 font-semibold mb-2">Forms</p>
                  <p className="text-sm text-gray-600">Use consistent border-radius (rounded-xl) and focus states (border-primary) for all inputs.</p>
                </div>
              </div>
            </div>

            {/* Navigation Guidelines */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Navigation</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm">
                    Active Tab
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm">
                    Inactive Tab
                  </button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Active navigation items use <code className="font-mono bg-white px-2 py-1 rounded">bg-primary</code> with white text.
                    Inactive items use <code className="font-mono bg-white px-2 py-1 rounded">bg-gray-100</code> with gray-600 text.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
