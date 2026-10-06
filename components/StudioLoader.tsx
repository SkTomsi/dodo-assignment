"use client";

import dynamic from "next/dynamic";
import { SoundProvider } from "@/components/sound-provider";

const Studio = dynamic(() => import("@/components/Studio"), { ssr: false });

export default function StudioLoader() {
  return (
    <SoundProvider>
      <Studio />
    </SoundProvider>
  );
}