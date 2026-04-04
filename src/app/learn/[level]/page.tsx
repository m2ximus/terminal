"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { getLevelBySlug } from "@/lib/lessons";
import { LessonShell } from "@/components/lesson/LessonShell";

export default function LevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: slug } = use(params);
  const level = getLevelBySlug(slug);

  if (!level) {
    notFound();
  }

  return <LessonShell level={level} />;
}
