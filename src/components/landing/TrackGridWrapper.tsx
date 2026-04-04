"use client";

import { useEffect, useState } from "react";
import { tracks } from "@/lib/tracks";
import { loadProgress, ProgressData } from "@/lib/progress";
import { TrackGrid } from "./TrackGrid";

export function TrackGridWrapper() {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  return <TrackGrid tracks={tracks} progress={progress} />;
}
