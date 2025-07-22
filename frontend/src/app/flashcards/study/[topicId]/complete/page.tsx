"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Trophy,
  Target,
  RotateCcw,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { SuccessScreen } from "@/components/ui/SuccessScreen";

interface StudyCompletePageProps {
  params: Promise<{ topicId: string }>;
}

export default function StudyCompletePage({ params }: StudyCompletePageProps) {
  const router = useRouter();
  const [topicId, setTopicId] = useState<string>("");
  
  // Scroll to top when navigating
  useScrollToTop();

  // Get topic ID from params
  useEffect(() => {
    params.then((p) => setTopicId(p.topicId));
  }, [params]);

  const handleBackToTopics = () => {
    router.push("/flashcards");
  };

  const handleStudyAgain = () => {
    router.push(`/flashcards/study/${topicId}`);
  };

  return (
    <DashboardLayout>
      <SuccessScreen
        title="Study Session Complete!"
        subtitle="Great job! You've completed your flashcard study session."
        icon={<CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-lg" />}
        iconColor="green"
        details={{
          title: "Session Completed",
          stats: [
            {
              icon: <Trophy className="h-4 w-4" />,
              label: "Session",
              value: "Completed",
              color: "text-yellow-400"
            },
            {
              icon: <TrendingUp className="h-4 w-4" />,
              label: "Progress",
              value: "Updated",
              color: "text-green-400"
            }
          ]
        }}
        primaryAction={{
          label: "Study Again",
          onClick: handleStudyAgain,
          icon: <RotateCcw className="h-5 w-5" />
        }}
        secondaryActions={[
          {
            label: "Back to Topics",
            onClick: handleBackToTopics,
            icon: <ArrowLeft className="h-4 w-4" />
          }
        ]}
      />
    </DashboardLayout>
  );
}
