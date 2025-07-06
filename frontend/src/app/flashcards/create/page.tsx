"use client";

import { Suspense } from "react";
import CreateFlashcardContent from "./CreateFlashcardContent";

export default function CreateFlashcardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateFlashcardContent />
    </Suspense>
  );
}
