import { SignUpForm } from "@/components/features/auth/SignUpForm";
import type { Metadata } from "next";

// Optimize metadata for faster loading
export const metadata: Metadata = {
  title: "Sign Up - ExamCraft",
  description: "Create your ExamCraft account",
  robots: "noindex", // Don't index auth pages
};

export default function SignUpPage() {
  return <SignUpForm />;
}
