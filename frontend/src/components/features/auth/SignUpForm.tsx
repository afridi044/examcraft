"use client";

import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Memoize the form component for better performance
export const SignUpForm = memo(function SignUpForm() {
  const router = useRouter();
  // Use the new backend-powered auth hook
  const { signUp, loading } = useBackendAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Use lazy initial state for better performance
  const [formData, setFormData] = useState(() => ({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    institution: "",
    field_of_study: "",
  }));

  // Memoize event handlers to prevent unnecessary re-renders
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  }, [error]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!formData.email || !formData.first_name || !formData.last_name) {
      setError("Please fill in all required fields");
      return;
    }

    const result = await signUp(formData.email, formData.password, {
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      institution: formData.institution.trim() || undefined,
      field_of_study: formData.field_of_study.trim() || undefined,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(
        "Account created successfully! Please check your email to verify your account, then you can sign in."
      );
      // Clear the form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        institution: "",
        field_of_study: "",
      });
      // Redirect after a delay
      setTimeout(() => {
        router.push("/auth/signin");
      }, 4000);
    }
  }, [formData, signUp, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Optimized Floating Elements - Delayed start for faster initial load */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          opacity: { delay: 1, duration: 0.5 },
          x: { delay: 1.5, duration: 8, repeat: Infinity, ease: "easeInOut" },
          y: { delay: 1.5, duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: [0, -30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          opacity: { delay: 1.2, duration: 0.5 },
          x: { delay: 2, duration: 10, repeat: Infinity, ease: "easeInOut" },
          y: { delay: 2, duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/3 w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: [0, 20, 0],
          y: [0, -30, 0],
        }}
        transition={{
          opacity: { delay: 1.4, duration: 0.5 },
          x: { delay: 2.2, duration: 9, repeat: Infinity, ease: "easeInOut" },
          y: { delay: 2.2, duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ExamCraft
            </span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Create your account
          </h1>
          <p className="text-gray-400">Start your journey to exam success</p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl shadow-black/20 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-gray-300">
                  First Name *
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  className="bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-gray-300">
                  Last Name *
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  className="bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                required
                className="bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50"
              />
            </div>

            {/* Institution */}
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-gray-300">
                Institution
              </Label>
              <Input
                id="institution"
                name="institution"
                type="text"
                value={formData.institution}
                onChange={handleChange}
                placeholder="University of Example"
                className="bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50"
              />
            </div>

            {/* Field of Study */}
            <div className="space-y-2">
              <Label htmlFor="field_of_study" className="text-gray-300">
                Field of Study
              </Label>
              <Input
                id="field_of_study"
                name="field_of_study"
                type="text"
                value={formData.field_of_study}
                onChange={handleChange}
                placeholder="Computer Science"
                className="bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50"
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {success}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
});
