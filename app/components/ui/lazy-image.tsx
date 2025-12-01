"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface LazyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  fill = false, 
  className = "", 
  width, 
  height, 
  priority = false,
  sizes
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Si priority est true, isInView est déjà initialisé à true, pas besoin de setState
    if (priority) {
      return;
    }

    // Fallback: afficher l'image après un court délai même si l'observer ne se déclenche pas
    const fallbackTimeout = setTimeout(() => {
      setIsInView(true);
    }, 200);

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              clearTimeout(fallbackTimeout);
              observer.disconnect();
            }
          });
        },
        { rootMargin: "100px", threshold: 0.01 }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => {
        clearTimeout(fallbackTimeout);
        observer.disconnect();
      };
    }

    return () => clearTimeout(fallbackTimeout);
  }, [priority]);

  if (fill) {
    return (
      <div ref={imgRef} className={`relative w-full h-full ${className}`}>
        {isInView ? (
          <>
            <Image
              src={src}
              alt={alt}
              fill
              className={`object-cover transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setIsLoaded(true)}
              onError={() => setIsLoaded(true)} // En cas d'erreur, afficher quand même
              loading={priority ? "eager" : "lazy"}
              unoptimized={src.startsWith('http://localhost:5000')}
              sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            />
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div ref={imgRef} className={className}>
      {isInView ? (
        <>
          <Image
            src={src}
            alt={alt}
            width={100}
            height={100}
            className={`transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsLoaded(true)} // En cas d'erreur, afficher quand même
            loading={priority ? "eager" : "lazy"}
            unoptimized={src.startsWith('http://localhost:5000')}
          />
          {!isLoaded && (
            <div className="bg-gray-200 animate-pulse" style={{ width, height }} />
          )}
        </>
      ) : (
        <div className="bg-gray-200 animate-pulse" style={{ width, height }} />
      )}
    </div>
  );
}

