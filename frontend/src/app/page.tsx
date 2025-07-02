"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  BookOpen,
  Clock,
  Trophy,
  Shield,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

// MOVED OUTSIDE COMPONENT: Simple Counter Component for better performance
const StaticCounter = ({ value }: { value: number }) => {
  return <span>{value}</span>;
};

// MOVED OUTSIDE COMPONENT: Animated Counter Component with smooth counting animation
const AnimatedCounter = ({ value }: { value: number }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (shouldReduceMotion) {
      setCurrentValue(value);
      return;
    }

    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(
        startValue + (value - startValue) * easeOut
      );

      setCurrentValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(animate, 500); // Start after 500ms delay
    return () => clearTimeout(timeout);
  }, [value, shouldReduceMotion]);

  return <span>{currentValue.toLocaleString()}</span>;
};

// Floating Animation Component with reduced motion support
const FloatingElement = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        shouldReduceMotion
          ? {}
          : {
              y: [-10, 10, -10],
              rotate: [-1, 1, -1],
            }
      }
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

// Gradient Orb Background with reduced motion and better performance
const GradientOrb = ({ className }: { className?: string }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl will-change-transform ${className}`}
      animate={
        shouldReduceMotion
          ? { opacity: 0.2 }
          : {
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }
      }
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        willChange: "transform, opacity",
      }}
    />
  );
};

// Feature Card Component with mobile-optimized animations
const FeatureCard = ({
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
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.6,
        delay: shouldReduceMotion ? 0 : delay,
        ease: "easeOut",
      }}
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale: 1.02,
              transition: { duration: 0.2 },
            }
      }
      className="group h-full"
      style={{ willChange: "transform" }}
    >
      <Card className="p-6 md:p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 h-full">
        <motion.div
          className="mb-4 md:mb-6 p-3 md:p-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
          whileHover={
            shouldReduceMotion
              ? {}
              : {
                  rotate: 180,
                  transition: { duration: 0.8 },
                }
          }
        >
          <Icon className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
        </motion.div>
        <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white group-hover:text-purple-300 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
          {description}
        </p>
        <motion.div
          className="mt-4 md:mt-6 flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -10 }}
          whileHover={shouldReduceMotion ? {} : { x: 0 }}
        >
          <span className="text-sm font-medium">Learn more</span>
          <ChevronRight className="w-4 h-4 ml-2" />
        </motion.div>
      </Card>
    </motion.div>
  );
};

// Testimonial Card Component with mobile optimization
const TestimonialCard = ({
  name,
  role,
  content,
  rating,
  delay = 0,
}: {
  name: string;
  role: string;
  content: string;
  rating: number;
  delay?: number;
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.6,
        delay: shouldReduceMotion ? 0 : delay,
        ease: "easeOut",
      }}
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              y: -5,
              transition: { duration: 0.2 },
            }
      }
      className="group h-full"
      style={{ willChange: "transform" }}
    >
      <Card className="p-4 md:p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 h-full">
        <div className="flex mb-3 md:mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 md:w-5 md:h-5 ${
                i < rating ? "text-yellow-400 fill-current" : "text-gray-400"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-300 mb-4 md:mb-6 italic leading-relaxed text-sm md:text-base">
          &ldquo;{content}&rdquo;
        </p>
        <div className="flex items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg">
            {name.charAt(0)}
          </div>
          <div className="ml-3 md:ml-4">
            <div className="font-bold text-white text-sm md:text-base">
              {name}
            </div>
            <div className="text-xs md:text-sm text-gray-400">{role}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Mobile Navigation Component
const MobileNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300"
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.1 : 0.3 }}
          className="fixed inset-0 bg-black/90 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isMobileMenuOpen ? 0 : "100%" }}
        transition={{
          duration: shouldReduceMotion ? 0.1 : 0.3,
          ease: "easeInOut",
        }}
        className="fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 md:hidden"
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-lg border border-purple-400/50">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ExamCraft
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="p-6 bg-gray-900 h-full">
          <nav className="space-y-1">
            {/* Navigation Links */}
            <Link
              href="#features"
              className="flex items-center px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Brain className="w-5 h-5 mr-3 text-purple-400" />
              Features
            </Link>
            <Link
              href="#testimonials"
              className="flex items-center px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Star className="w-5 h-5 mr-3 text-yellow-400" />
              Reviews
            </Link>

            {/* Divider */}
            <div className="my-6 border-t border-gray-700"></div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 !border-2 !border-gray-600 !text-gray-200 !bg-gray-800 hover:!bg-gray-700 hover:!text-white hover:!border-gray-500 !transition-all !duration-300 !rounded-xl !font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link
                  href="/auth/signin"
                  prefetch={true}
                  className="flex items-center justify-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </Button>

              <Button
                className="w-full h-12 !bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white !transition-all !duration-300 !rounded-xl !font-medium !shadow-lg hover:!shadow-purple-500/25"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center space-x-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Start Free Trial</span>
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-400/30 bg-gray-800">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">
                  Free Trial Available
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </nav>
        </div>
      </motion.div>
    </>
  );
};

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-hidden">
      {/* Animated Background - Reduced on mobile for performance */}
      <div className="fixed inset-0 z-0">
        <GradientOrb className="w-64 h-64 md:w-96 md:h-96 bg-purple-500 -top-32 -left-32 md:-top-48 md:-left-48" />
        <GradientOrb className="w-64 h-64 md:w-96 md:h-96 bg-blue-500 top-1/2 -right-32 md:-right-48" />
        <GradientOrb className="w-64 h-64 md:w-96 md:h-96 bg-emerald-500 -bottom-32 left-1/4 md:-bottom-48 md:left-1/3" />

        {/* Floating Particles - Reduced number on mobile */}
        {shouldReduceMotion
          ? null
          : [
              { left: 22.5, top: 99.5, duration: 4.2, delay: 0.5 },
              { left: 65.6, top: 12.7, duration: 3.8, delay: 1.2 },
              { left: 78.9, top: 83.6, duration: 4.5, delay: 0.3 },
              { left: 56.8, top: 66.9, duration: 3.6, delay: 1.8 },
              { left: 39.5, top: 74.4, duration: 4.1, delay: 0.7 },
              { left: 50.8, top: 28.8, duration: 3.9, delay: 1.5 },
              { left: 22.2, top: 65.8, duration: 4.3, delay: 0.2 },
              { left: 74.3, top: 90.7, duration: 3.7, delay: 1.1 },
              { left: 63.3, top: 64.1, duration: 4.0, delay: 0.9 },
              { left: 56.6, top: 10.6, duration: 3.5, delay: 1.7 },
            ]
              .slice(0, 6)
              .map((particle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-30 hidden md:block"
                  style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    willChange: "transform, opacity",
                  }}
                  animate={{
                    y: [-20, -100],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: particle.duration,
                    repeat: Infinity,
                    delay: particle.delay,
                  }}
                />
              ))}
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav
          className="fixed top-0 w-full z-50 bg-gray-900 border-b border-gray-700 shadow-lg"
          initial={{ y: shouldReduceMotion ? 0 : -100 }}
          animate={{ y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: 1.02,
                      transition: { duration: 0.3 },
                    }
              }
            >
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-400/30">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ExamCraft
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="#features"
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300 font-medium"
              >
                Features
              </Link>
              <Link
                href="#testimonials"
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300 font-medium"
              >
                Reviews
              </Link>

              {/* Desktop Action Buttons */}
              <div className="flex items-center space-x-3 ml-4">
                <Button
                  variant="outline"
                  className="!border-2 !border-gray-600 !text-gray-200 !bg-gray-800 hover:!bg-gray-700 hover:!text-white hover:!border-gray-500 !transition-all !duration-300 !rounded-lg !font-medium"
                >
                  <Link
                    href="/auth/signin"
                    className="flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </Button>
                <Button className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white !transition-all !duration-300 !rounded-lg !font-medium !shadow-lg hover:!shadow-purple-500/25">
                  <Link
                    href="/auth/signup"
                    className="flex items-center space-x-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Start Free Trial</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNavigation />
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="pt-20 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.3 : 0.8 }}
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 md:mb-6 leading-tight px-2"
                initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: shouldReduceMotion ? 0.3 : 1,
                  delay: shouldReduceMotion ? 0 : 0.2,
                }}
              >
                Master Any Exam with{" "}
                <motion.span
                  className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  AI-Powered
                </motion.span>{" "}
                Preparation
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed px-4"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0.3 : 0.8,
                  delay: shouldReduceMotion ? 0 : 0.4,
                }}
              >
                Transform your study materials into personalized quizzes,
                flashcards, and mock exams. Our AI analyzes your performance and
                creates adaptive learning paths for guaranteed success.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12 px-4"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0.3 : 0.8,
                  delay: shouldReduceMotion ? 0 : 0.6,
                }}
              >
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto !bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-full relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={shouldReduceMotion ? {} : { x: "100%" }}
                      transition={{ duration: 1.2 }}
                    />
                    <Link
                      href="/auth/signup"
                      className="flex items-center justify-center space-x-2 relative z-10"
                    >
                      <span>Start Your Journey</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto !border-2 !border-gray-600 !text-gray-300 !bg-transparent hover:!bg-gray-700 hover:!text-white text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-full backdrop-blur-sm !transition-all !duration-300"
                  >
                    <Link
                      href="#demo"
                      className="flex items-center justify-center space-x-2"
                    >
                      <span>Watch Demo</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats Counter */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-2xl mx-auto px-4"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0.3 : 0.8,
                  delay: shouldReduceMotion ? 0 : 0.8,
                }}
              >
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-purple-400 mb-1 md:mb-2">
                    <AnimatedCounter value={50000} />+
                  </div>
                  <div className="text-gray-300 text-sm md:text-base">
                    Students Helped
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-pink-400 mb-1 md:mb-2">
                    <AnimatedCounter value={94} />%
                  </div>
                  <div className="text-gray-300 text-sm md:text-base">
                    Success Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-blue-400 mb-1 md:mb-2">
                    <AnimatedCounter value={1000} />+
                  </div>
                  <div className="text-gray-300 text-sm md:text-base">
                    Exams Covered
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* 3D Floating Elements - Hidden on mobile for performance */}
            <div className="absolute top-20 left-10 hidden xl:block">
              <FloatingElement delay={0}>
                <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-2xl border border-purple-400/30">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
              </FloatingElement>
            </div>
            <div className="absolute top-32 right-10 hidden xl:block">
              <FloatingElement delay={1}>
                <div className="p-4 bg-pink-500/20 backdrop-blur-sm rounded-2xl border border-pink-400/30">
                  <Trophy className="w-8 h-8 text-pink-400" />
                </div>
              </FloatingElement>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="pt-12 md:pt-20 pb-12 md:pb-20 px-4 md:px-6 scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.3 : 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 px-2">
                Powerful Features to{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Boost Your Learning
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
                Our platform combines cutting-edge AI technology with proven
                learning methods
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <FeatureCard
                icon={Brain}
                title="AI-Generated Practice"
                description="Upload your notes and our AI creates personalized questions that adapt to your learning style and knowledge gaps."
                delay={0}
              />
              <FeatureCard
                icon={Clock}
                title="Timed Mock Exams"
                description="Simulate real exam conditions with countdown timers, auto-submit functionality, and detailed performance analytics."
                delay={0.1}
              />
              <FeatureCard
                icon={Target}
                title="Smart Flashcards"
                description="Convert incorrect answers into spaced repetition flashcards with our intelligent review algorithm."
                delay={0.2}
              />
              <FeatureCard
                icon={TrendingUp}
                title="Performance Analytics"
                description="Track your progress with detailed insights, identify weak areas, and optimize your study plan."
                delay={0.3}
              />
              <FeatureCard
                icon={Shield}
                title="Adaptive Learning"
                description="Our AI adjusts difficulty and focus areas based on your performance to maximize learning efficiency."
                delay={0.4}
              />
              <FeatureCard
                icon={Users}
                title="Collaborative Study"
                description="Join study groups, share resources, and compete with peers in leaderboards and challenges."
                delay={0.5}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-20 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.3 : 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 px-2">
                How ExamCraft{" "}
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Works
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
                Get started in minutes and see results in days
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
              {[
                {
                  step: "01",
                  title: "Upload Your Materials",
                  description:
                    "Simply upload your textbooks, notes, or study materials. Our AI processes them instantly.",
                  icon: BookOpen,
                },
                {
                  step: "02",
                  title: "AI Creates Your Plan",
                  description:
                    "Our intelligent system analyzes your content and creates personalized quizzes and study schedules.",
                  icon: Brain,
                },
                {
                  step: "03",
                  title: "Practice & Improve",
                  description:
                    "Take adaptive quizzes, track your progress, and watch your scores improve with each session.",
                  icon: Trophy,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.3 : 0.6,
                    delay: shouldReduceMotion ? 0 : index * 0.2,
                  }}
                  className="text-center group"
                >
                  <div className="relative mb-6 md:mb-8">
                    <motion.div
                      className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                      whileHover={
                        shouldReduceMotion
                          ? {}
                          : {
                              rotate: 360,
                              transition: { duration: 0.6 },
                            }
                      }
                    >
                      <item.icon className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
                    </motion.div>
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base px-2">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="pt-12 md:pt-20 pb-12 md:pb-20 px-4 md:px-6 scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.3 : 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 px-2">
                What Students{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Are Saying
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
                Join thousands of students who improved their grades with
                ExamCraft
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <TestimonialCard
                name="Sarah Chen"
                role="Medical Student"
                content="ExamCraft helped me increase my MCAT score by 15 points. The adaptive learning is incredible!"
                rating={5}
                delay={0}
              />
              <TestimonialCard
                name="Marcus Rodriguez"
                role="Engineering Student"
                content="The AI-generated practice questions were spot-on. I felt completely prepared for my finals."
                rating={5}
                delay={0.1}
              />
              <TestimonialCard
                name="Emily Johnson"
                role="Law Student"
                content="The flashcard system saved me hours of study time. I passed the bar exam on my first try!"
                rating={5}
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.3 : 0.8 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-400/30 rounded-2xl md:rounded-3xl p-8 md:p-12"
            >
              <motion.div
                animate={shouldReduceMotion ? {} : { rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </motion.div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 px-2">
                Ready to{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Transform
                </span>{" "}
                Your Study Experience?
              </h2>

              <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed px-2">
                Join over 50,000 students who are using ExamCraft to achieve
                better results with less stress. Start your free trial today and
                experience the future of exam preparation.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <Button
                    size="lg"
                    className="w-full !bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-full relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={shouldReduceMotion ? {} : { x: "100%" }}
                      transition={{ duration: 1.2 }}
                    />
                    <Link
                      href="/auth/signup"
                      className="flex items-center justify-center space-x-2 relative z-10"
                    >
                      <span>Start Free Trial</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full !border-2 !border-gray-600 !text-gray-300 !bg-transparent hover:!bg-gray-700 hover:!text-white text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-full backdrop-blur-sm !transition-all !duration-300"
                  >
                    <Link
                      href="/contact"
                      className="flex items-center justify-center space-x-2"
                    >
                      <span>Talk to Sales</span>
                      <Users className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>

              <div className="mt-6 md:mt-8 text-xs md:text-sm text-gray-400">
                No credit card required • Free 14-day trial • Cancel anytime
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 md:py-12 px-4 md:px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ExamCraft
              </span>
            </div>
            <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">
              The AI-powered exam preparation platform that guarantees success.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm text-gray-400">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
              <Link href="/help" className="hover:text-white transition-colors">
                Help
              </Link>
            </div>
            <div className="mt-4 md:mt-6 text-xs text-gray-500">
              © 2025 ExamCraft. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
