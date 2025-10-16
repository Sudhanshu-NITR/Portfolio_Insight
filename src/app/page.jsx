"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AboutSection from "@/components/landing/AboutSection";
import ContactSection from "@/components/landing/ContactSection";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  const { status } = useSession();
  const ctaHref = status === "authenticated" ? "/dashboard" : "/sign-in";

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('dark-mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('dark-mode', 'true'); } catch { }
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('dark-mode', 'false'); } catch { }
    }
  }, [darkMode]);

  return (
    <main className="min-h-screen">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <HeroSection ctaHref={ctaHref} />
      <FeaturesSection />
      <AboutSection />
      <ContactSection />
      <CTASection ctaHref={ctaHref} />
      <Footer />
    </main>
  );
}
