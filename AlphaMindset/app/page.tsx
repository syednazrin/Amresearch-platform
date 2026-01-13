"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TripCard from "@/app/components/TripCard";
import { CardSkeleton } from "@/app/components/ui/Skeleton";
import Button from "@/app/components/ui/Button";
import PublicNav from "@/app/components/PublicNav";
import { ArrowRight } from "lucide-react";
import Script from "next/script";
import UpcomingTripCarousel from "@/app/components/UpcomingTripCarousel";

interface Trip {
  _id: string;
  companyName: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
}

interface SocialMediaEmbed {
  _id: string;
  embedCode: string;
  order: number;
}

// Videos in Main Videos folder, sorted by number prefix
const videos = [
  "/Main Videos/1.15186706-hd_1920_1080_30fps.mp4",
  "/Main Videos/2.vecteezy_close-up-portrait-of-computer-engineer-s-hand-is-holding_42201986.mp4",
  "/Main Videos/3.vecteezy_product-shelves-displayed-in-a-supermarket_54824272.mp4",
  "/Main Videos/4.vecteezy_asian-senior-man-farmer-holding-digital-tablet-working-in_5020403.mov",
];

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroAnimated, setHeroAnimated] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [instagramEmbeds, setInstagramEmbeds] = useState<SocialMediaEmbed[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchTrips();
    fetchInstagramEmbeds();
    // Trigger hero animation after a short delay
    const timer = setTimeout(() => {
      setHeroAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const MAX_DURATION = 4; // 4 seconds maximum

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const handleTimeUpdate = () => {
      if (video.currentTime >= MAX_DURATION) {
        // Video has played 4 seconds, move to next (loop back to first when reaching the end)
        setCurrentVideoIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % videos.length;
          return nextIndex;
        });
      }
    };

    const handleVideoEnd = () => {
      // Video ended before 4 seconds, move to next (loop back to first when reaching the end)
      setCurrentVideoIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % videos.length;
        return nextIndex;
      });
    };

    // Set up timeout as backup (in case timeupdate doesn't fire frequently enough)
    timeoutRef.current = setTimeout(() => {
      if (video.currentTime < MAX_DURATION) {
        // Video hasn't reached 4 seconds yet, check periodically
        const checkInterval = setInterval(() => {
          if (video.currentTime >= MAX_DURATION) {
            clearInterval(checkInterval);
            setCurrentVideoIndex((prevIndex) => {
              const nextIndex = (prevIndex + 1) % videos.length;
              return nextIndex;
            });
          }
        }, 50);
        
        // Clean up interval after 5 seconds (safety)
        setTimeout(() => clearInterval(checkInterval), 5000);
      } else {
        setCurrentVideoIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % videos.length;
          return nextIndex;
        });
      }
    }, MAX_DURATION * 1000);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleVideoEnd);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [currentVideoIndex]);

  const fetchTrips = async () => {
    try {
      const response = await fetch("/api/trips?upcoming=true");
      const data = await response.json();
      setTrips(data.trips || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstagramEmbeds = async () => {
    try {
      const response = await fetch("/api/social-media");
      const data = await response.json();
      setInstagramEmbeds(data.embeds || []);
      
      // Re-initialize Instagram embed script after embeds are loaded
      if (data.embeds && data.embeds.length > 0 && typeof window !== 'undefined' && (window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    } catch (error) {
      console.error("Error fetching Instagram embeds:", error);
      setInstagramEmbeds([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Instagram Embed Script */}
      <Script 
        async 
        src="//www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          // Process embeds after script loads
          if (typeof window !== 'undefined' && (window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
          }
        }}
      />
      
      {/* Navbar - Fixed */}
      <PublicNav />

      {/* Hero Section - Video Background */}
      <div className={`p-1 sm:p-1 md:p-1 transition-all duration-1000 ease-out ${heroAnimated ? 'opacity-100' : 'opacity-0'}`}>
        <section className="relative h-[80vh] sm:h-[85vh] md:h-[90vh] lg:h-[95vh] flex items-center sm:items-end justify-center sm:justify-end overflow-hidden rounded-2xl">
          {/* Background Video */}
          <video
            key={currentVideoIndex}
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src={videos[currentVideoIndex]} type={videos[currentVideoIndex].endsWith('.mov') ? 'video/quicktime' : 'video/mp4'} />
          </video>
          
          {/* Black Gradient Overlay - from bottom to top */}
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.8), transparent)' }}></div>

          {/* Content */}
          <div className="relative z-20 text-white p-6 sm:p-8 md:p-10 lg:p-12 text-center sm:text-right max-w-2xl w-full sm:w-auto">
            <p className={`text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] uppercase text-white/70 mb-4 sm:mb-6 transition-all duration-700 delay-300 ${heroAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Institutional-Grade Research
            </p>
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight tracking-tighter mb-3 sm:mb-4 leading-tight sm:leading-none transition-all duration-700 delay-500 ${heroAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Research<br/>That Matters
            </h1>
            <p className={`text-xs sm:text-sm tracking-wider px-4 sm:px-0 mb-8 transition-all duration-700 delay-700 ${heroAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-block px-4 py-2 bg-white rounded-full text-xs font-bold" style={{ color: '#FF0009' }}>
                #AlphaMindset
              </span>
            </p>
            <Link href="/documents">
              <button className={`px-8 py-4 text-black text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 transition-all duration-700 delay-900 inline-flex items-center gap-3 ${heroAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ backgroundColor: '#FFF100' }}>
                View Today's Reports
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </section>
      </div>

      {/* Company Visits & Booking Section */}
      <div className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Company Visits Section - Consolidated */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left: Hero Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/company-visits/helipad.jpeg"
                  alt="Company Visits"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Right: Content */}
              <div className="space-y-8">
                {/* Section Header */}
                <div>
                  <h2 className="text-6xl sm:text-7xl md:text-8xl font-extralight text-black tracking-tighter mb-4">
                    Company Visits
                  </h2>
                  <div className="w-24 h-px bg-black mb-6"></div>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-lg">
                    We conduct in-depth corporate visits to leading companies across various sectors, 
                    providing institutional-grade research and strategic insights through direct engagement 
                    with management teams and operational facilities.
                  </p>
                </div>

                {/* Upcoming Trips Carousel */}
                <div>
                  <UpcomingTripCarousel trips={trips} />
                </div>

                {/* CTA */}
                <div>
                  <Link href="/trips/calendar">
                    <button className="px-8 py-4 text-white text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 transition-all duration-300 inline-flex items-center gap-3" style={{ backgroundColor: '#FF0009' }}>
                      View All Trips
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Book Analyst Meeting Section */}
          <div>
            {/* Section Header */}
            <div className="mb-8 text-left">
              <h2 className="text-6xl sm:text-7xl md:text-8xl font-extralight text-black tracking-tighter mb-4">
                Book a Meeting
              </h2>
              <div className="w-24 h-px bg-black"></div>
            </div>

            {/* Booking Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 tracking-[0.5em] uppercase">One-on-One Consultation</p>
                  <h3 className="text-5xl font-light text-black tracking-tight leading-tight">
                    Connect with Our Analysts
                  </h3>
                </div>
                <p className="text-base text-gray-600 leading-relaxed">
                  Schedule a personalized meeting with our investment analysts to discuss market opportunities, portfolio strategies, and gain insights tailored to your investment objectives.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-black rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">Expert analysis on market trends and opportunities</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-black rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">Personalized investment recommendations</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-1 bg-black rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">Portfolio review and strategy discussion</p>
                  </div>
                </div>
                <Link href="/book">
                  <button className="px-8 py-4 text-white text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 transition-all duration-300 inline-flex items-center gap-3" style={{ backgroundColor: '#FF0009' }}>
                    Schedule Meeting
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/Meetings/Meeting.jpeg"
                  alt="Analyst Meeting"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram Section */}
      <div className="relative py-48 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="mb-24 text-center">
            <h2 className="text-6xl sm:text-7xl md:text-8xl font-extralight text-black tracking-tighter mb-8">
              Follow Our Journey
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              Stay connected for exclusive insights, behind-the-scenes from our company visits, market updates, and expert commentary.
            </p>
            <a 
              href="https://www.instagram.com/aminvest" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-xs font-bold tracking-[0.3em] uppercase hover:opacity-50 transition-opacity duration-300" 
              style={{ color: '#FF0009' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Follow @aminvest</span>
              <span className="text-lg">→</span>
            </a>
          </div>

          {/* Instagram Reels Grid */}
          {instagramEmbeds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {instagramEmbeds.map((embed) => (
                <div 
                  key={embed._id} 
                  className="overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: embed.embedCode }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No Instagram embeds configured yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-white transition-all duration-1000 ease-out">
        <div className="max-w-7xl mx-auto px-6 py-24">
          {/* Large Brand Logo */}
          <div className="mb-16">
            <Image
              src="/aminvestment-services-berhad-logo (1).png"
              alt="AMINVEST Logo"
              width={300}
              height={80}
              className="h-20 w-auto"
            />
          </div>

          {/* Organized Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-16 border-b border-gray-200">
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
