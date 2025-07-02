import { SignInForm } from "@/components/features/auth/SignInForm";
import type { Metadata } from "next";

// Optimize metadata for faster loading
export const metadata: Metadata = {
  title: "Sign In - ExamCraft",
  description: "Sign in to your ExamCraft account",
  robots: "noindex", // Don't index auth pages
};

export default function SignInPage() {
  return <SignInForm />;
}
