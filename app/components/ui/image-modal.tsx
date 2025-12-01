"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}

export function ImageModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNext,
  onPrevious
}: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrevious();
          break;
        case "ArrowRight":
          onNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <div
      className="fixed overflow-hidden inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/20 rounded-full p-2"
        aria-label="Fermer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation buttons */}
      {hasMultipleImages && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/20 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/20 rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === images.length - 1}
            aria-label="Image suivante"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image counter */}
      {hasMultipleImages && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Main image */}
      <div
        className="max-w-full max-h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage}
          alt={`Image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
          style={{ maxWidth: '90vw', maxHeight: '90vh' }}
        />
      </div>
    </div>
  );
}
