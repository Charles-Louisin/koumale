"use client";

import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import "@uploadthing/react/styles.css";

interface UploadthingWrapperProps {
  children: React.ReactNode;
}

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export function UploadthingWrapper({ children }: UploadthingWrapperProps) {
  return <>{children}</>;
}
