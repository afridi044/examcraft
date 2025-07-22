"use client";

import React, { useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Brain,
  Target,
  Star,
  ArrowRight,
  Trophy,
  Shield,
  ChevronRight,
  Crown,
  Zap,
  Heart,
  Award,
  Flame,
  LogIn,
  UserPlus,
  Play,
  Menu,
  Sparkles,
} from "lucide-react";
import { SimpleSidebar } from "@/components/layouts/DashboardSidebar";

// Premium animated counter with luxury styling
const PremiumCounter = ({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (shouldReduceMotion) {
      setCurrentValue(value);
      return;
    }

    const duration = 3000;
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.round(startValue + (value - startValue) * easeOut);

      setCurrentValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(animate, 800);
    return () => clearTimeout(timeout);
  }, [value, shouldReduceMotion]);

  return (
    <span className="font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600 bg-clip-text text-transparent">
      {prefix}{currentValue.toLocaleString()}{suffix}
    </span>
  );
};

// Luxury floating animation
// const LuxuryFloat = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
//   const shouldReduceMotion = useReducedMotion();
//
//   return (
//     <motion.div
//       animate={shouldReduceMotion ? {} : {
//         y: [-8, 8, -8],
//         rotate: [-0.5, 0.5, -0.5],
//         scale: [1, 1.02, 1],
//       }}
//       transition={{
//         duration: 6,
//         repeat: Infinity,
//         delay,
//         ease: "easeInOut",
//       }}
//     >
//       {children}
//     </motion.div>
//   );
// };

// Premium gradient orb with enhanced visuals
const PremiumOrb = ({ className, color }: { className?: string; color: string }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl will-change-transform ${className}`}
      animate={shouldReduceMotion ? { opacity: 0.15 } : {
        scale: [1, 1.4, 1],
        opacity: [0.15, 0.35, 0.15],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        willChange: "transform, opacity",
      }}
    />
  );
};

// Premium feature card with luxury styling
const PremiumFeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.8,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={shouldReduceMotion ? {} : {
        scale: 1.03,
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="group h-full cursor-pointer"
    >
      <Card className="relative p-4 bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 hover:border-blue-400/40 transition-all duration-500 h-full overflow-hidden">
        {/* Premium shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 group-hover:animate-pulse transition-opacity duration-700" />

        <motion.div
          className="w-12 h-12 bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-violet-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative overflow-hidden mb-0 p-0"
          whileHover={shouldReduceMotion ? {} : {
            rotate: [0, -10, 10, 0],
            transition: { duration: 0.6 },
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Icon className="w-6 h-6 text-blue-400 relative z-10" />
        </motion.div>

        <h3 className="text-base font-bold mb-2 text-white group-hover:text-blue-300 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-300 leading-relaxed mb-2 text-sm">
          {description}
        </p>

        <motion.div
          className="flex items-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -10 }}
          whileHover={shouldReduceMotion ? {} : { x: 0 }}
        >
          <span className="text-sm font-semibold">Discover More</span>
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </motion.div>
      </Card>
    </motion.div>
  );
};

// Premium testimonial with enhanced social proof
const PremiumTestimonial = ({
  name,
  role,
  university,
  content,
  rating,
  avatar,
  delay = 0,
}: {
  name: string;
  role: string;
  university?: string;
  content: string;
  rating: number;
  avatar: string;
  delay?: number;
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.7,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={shouldReduceMotion ? {} : {
        y: -5,
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      className="group h-full"
    >
      <Card className="relative p-4 bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 hover:border-blue-400/40 transition-all duration-500 h-full overflow-hidden">
        {/* Rating stars */}
        <div className="flex mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < rating ? "text-blue-400 fill-current" : "text-gray-400"
                }`}
            />
          ))}
        </div>

        <blockquote className="text-gray-300 mb-4 italic leading-relaxed text-base">
          &ldquo;{content}&rdquo;
        </blockquote>

        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-violet-600 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg">
            {avatar}
          </div>
          <div className="ml-3">
            <div className="font-bold text-white text-base">{name}</div>
            <div className="text-blue-400 text-sm font-medium">{role}</div>
            {university && (
              <div className="text-gray-400 text-xs">{university}</div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const successStoriesRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const featuresSection = featuresRef.current;
    const successStoriesSection = successStoriesRef.current;
    if (!featuresSection && !successStoriesSection) return;

    const handleHash = (entries: IntersectionObserverEntry[]) => {
      const featuresEntry = entries.find(e => e.target === featuresSection);
      const successStoriesEntry = entries.find(e => e.target === successStoriesSection);
      if (successStoriesEntry && successStoriesEntry.isIntersecting) {
        history.replaceState(null, "", "#success-stories");
      } else if (featuresEntry && featuresEntry.isIntersecting) {
        history.replaceState(null, "", "#features");
      } else if (["#features", "#success-stories"].includes(window.location.hash)) {
        history.replaceState(null, "", window.location.pathname);
      }
    };

    const observer = new window.IntersectionObserver(handleHash, { threshold: 0.5 });
    if (featuresSection) observer.observe(featuresSection);
    if (successStoriesSection) observer.observe(successStoriesSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-hidden relative">
      {/* Mobile Sidebar Trigger Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 right-4 z-50 p-2 rounded-xl bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300 md:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>
      {/* Mobile Sidebar */}
      <SimpleSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={true}
        navigationItems={[
          { name: "Premium Features", href: "#features", icon: Sparkles },
          { name: "Success Stories", href: "#success-stories", icon: Trophy },
        ]}
        pathname={""}
        sidebarRef={sidebarRef}
        side="right"
      />

      {/* Premium animated background */}
      <div className="fixed inset-0 z-0">
        <PremiumOrb className="w-96 h-96 -top-48 -left-48" color="rgba(59, 130, 246, 0.3)" />
        <PremiumOrb className="w-[600px] h-[600px] top-1/3 -right-64" color="rgba(147, 51, 234, 0.2)" />
        <PremiumOrb className="w-80 h-80 bottom-0 left-1/4" color="rgba(124, 58, 237, 0.25)" />

        {/* Premium particles */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0">
            {[
              { left: "10%", top: "20%", delay: 0, duration: 3 },
              { left: "25%", top: "40%", delay: 0.5, duration: 4 },
              { left: "40%", top: "10%", delay: 1, duration: 3.5 },
              { left: "55%", top: "60%", delay: 1.5, duration: 4.5 },
              { left: "70%", top: "30%", delay: 2, duration: 3.2 },
              { left: "85%", top: "50%", delay: 0.8, duration: 3.8 },
              { left: "15%", top: "70%", delay: 1.2, duration: 4.2 },
              { left: "30%", top: "80%", delay: 0.3, duration: 3.7 },
              { left: "45%", top: "90%", delay: 1.8, duration: 4.1 },
              { left: "60%", top: "15%", delay: 0.7, duration: 3.3 },
              { left: "75%", top: "85%", delay: 1.4, duration: 3.9 },
              { left: "90%", top: "25%", delay: 0.9, duration: 4.3 },
            ].map((particle, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                style={{
                  left: particle.left,
                  top: particle.top,
                }}
                animate={{
                  y: [-20, -120],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10">
        {/* Premium Navigation */}
        <motion.nav
          className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-xl border-b border-blue-400/20 shadow-2xl"
          initial={{ y: shouldReduceMotion ? 0 : -100 }}
          animate={{ y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            >
              <div className="p-2 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl border border-blue-400/50">
                <Crown className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  ExamCraft
                </span>
              </div>
            </motion.div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 font-medium">
                Premium Features
              </a>
              <a href="#success-stories" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 font-medium">
                Success Stories
              </a>

              <div className="flex items-center space-x-3 ml-6">
                <Link href="/auth/signin">
                  <Button
                    className="bg-gradient-to-r from-gray-700 to-slate-800 hover:from-gray-800 hover:to-slate-900 text-gray-200 font-semibold shadow-md hover:shadow-gray-600/20 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-gray-200 font-semibold shadow-md hover:shadow-blue-600/20 transition-all duration-300 transform hover:-translate-y-0.5">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section - Premium */}
        <section className="pt-16 pb-10 px-3 md:pt-24 md:pb-16 md:px-6 relative">
          <div className="max-w-7xl mx-auto text-center py-6">
            <div className="relative z-10 bg-black/30 rounded-2xl shadow-xl border border-blue-400/10 px-2 md:px-12 py-12 md:py-12 mx-auto max-w-4xl lg:max-w-5xl w-full">
              <motion.h1
                className="text-4xl md:text-4xl lg:text-5xl font-black mb-3"
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: shouldReduceMotion ? 0.3 : 1.4, delay: shouldReduceMotion ? 0 : 0.3 }}
              >
                <span className="block text-white">Transform Your</span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600 bg-clip-text text-transparent mt-1">Academic Destiny</span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.3 : 1, delay: shouldReduceMotion ? 0 : 0.6 }}
              >
                Join the premium circle of top-performing students who&apos;ve revolutionized their exam preparation. Our <span className="text-blue-400 font-semibold">AI-powered platform</span> doesn&apos;t just help you study—<span className="text-blue-400 font-semibold"> it guarantees your success</span>.
              </motion.p>

              <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full max-w-xl mx-auto mt-8 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0.3 : 0.7, delay: shouldReduceMotion ? 0 : 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full md:w-[240px]"
                >
                  <Button
                    size="lg"
                    className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-gray-200 text-base md:text-lg px-6 py-4 rounded-xl font-semibold shadow-md hover:shadow-blue-600/20 transition-all duration-300 transform hover:-translate-y-0.5 gap-2"
                  >
                    <Crown className="w-5 h-5 mr-2 !text-gray-200" style={{ stroke: 'rgb(229 231 235)' }} />
                    <span className="relative z-10">Start Free Trial</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0.3 : 0.7, delay: shouldReduceMotion ? 0 : 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full md:w-[240px]"
                >
                  <Button
                    size="lg"
                    className="w-full flex items-center justify-center bg-gradient-to-r from-gray-700 to-slate-800 hover:from-gray-800 hover:to-slate-900 text-gray-200 text-base md:text-lg px-6 py-4 rounded-xl font-semibold shadow-md hover:shadow-gray-600/20 transition-all duration-300 transform hover:-translate-y-0.5 gap-2"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    <span>Watch Demo</span>
                  </Button>
                </motion.div>
              </div>
            </div>
            <motion.div
              className="grid grid-cols-4 gap-4 px-6 md:max-w-4xl mx-auto mt-8 border-t border-blue-400/10 pt-6"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.3 : 1, delay: shouldReduceMotion ? 0 : 1 }}
            >
              <div className="text-center">
                <div className="text-xl md:text-3xl font-black mb-1">
                  <PremiumCounter value={100} suffix="K+" />
                </div>
                <div className="text-gray-400 font-medium text-xs md:text-base">Premium Students</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-3xl font-black mb-1">
                  <PremiumCounter value={97} suffix="%" />
                </div>
                <div className="text-gray-400 font-medium text-xs md:text-base">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-3xl font-black mb-1">
                  <PremiumCounter value={156} suffix="%" />
                </div>
                <div className="text-gray-400 font-medium text-xs md:text-base">Avg. Score Boost</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-3xl font-black mb-1">
                  <PremiumCounter prefix="$" value={2} suffix="M+" />
                </div>
                <div className="text-gray-400 font-medium text-xs md:text-base">Scholarships Won</div>
              </div>
            </motion.div>
            {/* Floating premium elements (only on xl+) */}
            <div className="absolute top-24 left-20 hidden xl:block">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="p-5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl border border-blue-400/30 shadow-xl"
              >
                <Trophy className="w-8 h-8 text-blue-400" />
              </motion.div>
            </div>
            <div className="absolute top-40 right-20 hidden xl:block">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="p-5 bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-sm rounded-3xl border border-purple-400/30 shadow-xl"
              >
                <Target className="w-8 h-8 text-purple-400" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Emotional Connection Section */}
        <section className="mb-10">
          <div className="max-w-6xl mx-auto text-center md:py-6 px-6">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.3 : 1 }}
              className="mb-6 md:px-6 md:py-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="text-white">Your Dreams </span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Deserve </span>
                <span className="text-white">Premium Preparation</span>
              </h2>
              <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed ">
                Stop settling for average results. Your future self is counting on the decisions you make today. Every premium student knows that <span className="text-blue-400 font-semibold">exceptional outcomes require exceptional tools</span>.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 mt-10">
              {[
                {
                  icon: Heart,
                  title: "The Stress is Real",
                  description: "Late night panic sessions. The fear of disappointing everyone. We understand because we've been there.",
                  color: "from-red-400 to-pink-400"
                },
                {
                  icon: Zap,
                  title: "You're Meant for More",
                  description: "That fire inside you? That drive to succeed? It's not an accident. You have the potential for greatness.",
                  color: "from-blue-400 to-purple-500"
                },
                {
                  icon: Crown,
                  title: "Premium Results Guaranteed",
                  description: "Join the ranks of students who don't just pass—they dominate. Your success story starts here.",
                  color: "from-emerald-400 to-cyan-400"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0.3 : 0.8, delay: shouldReduceMotion ? 0 : index * 0.2 }}
                  className="mx-auto max-w-xs text-center"
                >
                  <div className={`w-16 h-16 mx-auto mb-2 mt-4 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Features */}
        <section id="features" ref={featuresRef} className="py-8 px-6 scroll-mt-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-2 md:px-6 md:py-8 mt-12"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.3 : 1 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Premium-Grade </span>
                <span className="text-white">Features</span>
              </h2>
              <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto mb-4">
                Premium technology meets proven pedagogy. These aren&apos;t just features—they&apos;re your unfair advantage.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 mt-8">
              <PremiumFeatureCard
                icon={Brain}
                title="Quantum AI Adaptation"
                description="Our proprietary AI doesn't just learn from your mistakes—it predicts them. Using advanced neural networks, we create a personalized learning journey that evolves in real-time, ensuring optimal retention and understanding."
                delay={0}
              />
              <PremiumFeatureCard
                icon={Zap}
                title="Premium Mock Simulations"
                description="Experience hyper-realistic exam conditions with our precision-timed simulations. Our algorithm matches the exact difficulty curve and question patterns of your target exam, down to the millisecond."
                delay={0.2}
              />
              <PremiumFeatureCard
                icon={Target}
                title="Weakness Elimination System"
                description="Our AI identifies micro-patterns in your performance that even you don't notice. We target and eliminate weaknesses with surgical precision, transforming your vulnerable areas into strengths."
                delay={0.4}
              />
              <PremiumFeatureCard
                icon={Shield}
                title="Success Guarantee Protocol"
                description="We're so confident in our system that we guarantee results. If you don't see significant improvement within 30 days, we'll refund every penny and provide additional coaching at no cost."
                delay={0.6}
              />
              <PremiumFeatureCard
                icon={Flame}
                title="Premium Community Access"
                description="Join an exclusive network of high-achievers. Access private study groups, one-on-one mentoring with top scorers, and insider strategies that aren't available anywhere else."
                delay={0.8}
              />
              <PremiumFeatureCard
                icon={Award}
                title="White-Glove Support"
                description="Dedicated success coaches, 24/7 priority support, and personalized study plans created by educational experts. This isn't just software—it's a premium educational experience."
                delay={1}
              />
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section id="success-stories" ref={successStoriesRef} className="py-16 px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 md:px-6 md:py-8"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.3 : 1 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold mb-4">
                <span className="text-white">Premium </span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Success Stories</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                These aren&apos;t just testimonials—they&apos;re transformation stories from students who refused to settle for ordinary.
              </p>
            </motion.div>

            {/* Additional testimonials grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <PremiumTestimonial
                name="Michael Zhang"
                role="MIT Computer Science"
                university="Massachusetts Institute of Technology"
                content="From a 1420 SAT to a perfect 1600. The personalized practice was exactly what I needed to push through to premium scores."
                rating={5}
                avatar="MZ"
                delay={0.2}
              />
              <PremiumTestimonial
                name="Emma Thompson"
                role="Oxford Rhodes Scholar"
                university="University of Oxford"
                content="ExamCraft didn't just help me ace my exams—it taught me how to think like a top performer. Now I'm studying at Oxford on a full scholarship."
                rating={5}
                avatar="ET"
                delay={0.4}
              />
              <PremiumTestimonial
                name="Carlos Martinez"
                role="Stanford MBA Candidate"
                university="Stanford Graduate School of Business"
                content="770 GMAT score that got me into Stanford. The ROI on ExamCraft was incredible—my starting salary alone paid for it 100x over."
                rating={5}
                avatar="CM"
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* Premium CTA Section */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.3 : 1 }}
              className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/90 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-8 overflow-hidden"
            >
              {/* Premium background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-violet-500/10 opacity-50" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600" />

              <motion.div
                animate={shouldReduceMotion ? {} : { rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center relative z-10"
              >
                <Crown className="w-7 h-7 text-black" />
              </motion.div>

              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black mb-3 relative z-10">
                <span className="text-white">Your Premium Future </span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Starts Now</span>
              </h2>

              <p className="text-base md:text-lg text-gray-300 mb-5 leading-relaxed relative z-10 max-w-2xl mx-auto">
                Join the circle of students who don&apos;t just pass—they <span className="text-blue-400 font-bold">dominate</span>.
              </p>

              <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center relative z-10 mb-4 w-full max-w-2xl mx-auto">
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto"
                >
                  <Link href="/auth/signup" className="w-full md:w-auto">
                    <Button
                      size="lg"
                      className="w-full md:w-auto flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-gray-200 text-base md:text-lg px-6 md:px-8 py-4 rounded-xl font-semibold shadow-md hover:shadow-blue-600/20 transition-all duration-300 transform hover:-translate-y-0.5 gap-2"
                    >
                      <UserPlus className="w-5 h-5 mr-2 !text-gray-200" style={{ stroke: 'rgb(229 231 235)' }} />
                      <span className="relative z-10">Sign Up</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto"
                >
                  <Link href="/auth/signin" className="w-full md:w-auto">
                    <Button
                      size="lg"
                      className="w-full md:w-auto flex items-center justify-center bg-gradient-to-r from-gray-700 to-slate-800 hover:from-gray-800 hover:to-slate-900 text-gray-200 text-base md:text-lg px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold shadow-md hover:shadow-gray-600/20 transition-all duration-300 transform hover:-translate-y-0.5 gap-2"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      <span className="relative z-10">Sign In</span>
                    </Button>
                  </Link>
                </motion.div>
              </div>

              <div className="text-xs md:text-sm text-gray-400 relative z-10 mt-2">
                30-Day Money-Back Guarantee • Premium Support
              </div>
            </motion.div>
          </div>
        </section>

        {/* Premium Footer */}
        <footer className="py-8 px-6 border-t border-blue-400/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="p-2 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl border border-blue-400/50">
                  <Crown className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    ExamCraft
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-blue-400 transition-colors">Terms</a>
                <a href="/premium-support" className="hover:text-blue-400 transition-colors">Premium Support</a>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700/50 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 ExamCraft. Empowering the next generation of leaders.
              </p>
              <p className="text-blue-400 text-xs mt-2 font-medium">
                Your success is our obsession. Premium results, guaranteed.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}