"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Hero } from "@/components/Hero";
import { heroContent } from "@/lib/hero-content";
import { useNotebookUpload } from "@/features/upload/use-notebook-upload";

export default function HomePage() {
  const router = useRouter();

  const upload = useNotebookUpload({
    onCompleted: (result) => {
      setTimeout(() => {
        router.push(`/notebooks/${result.source_notebook_id}/summary`);
      }, 2000);
    },
  });

  useEffect(() => {
    if (upload.status !== "failed") {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      upload.resetUpload();
    }, 5000);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [upload.resetUpload, upload.status]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Hero
        content={heroContent}
        onUploadNotebook={upload.uploadNotebook}
        uploadState={{
          status: upload.status,
          progress: upload.progress,
          selectedFile: upload.selectedFile,
          error: upload.error,
          isBusy: upload.isBusy,
        }}
      />
    </main>
  );
}
