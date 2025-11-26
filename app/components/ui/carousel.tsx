"use client";

import React, { useState, useEffect } from "react";

interface CarouselProps {
  children: React.ReactNode;
  itemsToShow?: number;
  autoSlide?: boolean;
  interval?: number;
  className?: string;
}

export function Carousel({ 
  children, 
  itemsToShow = 1, 
  autoSlide = false, 
  interval = 5000,
  className = "" 
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responsiveItems, setResponsiveItems] = useState(itemsToShow);
  const childrenArray = React.Children.toArray(children);

  useEffect(() => {
    const updateItems = () => {
      if (window.innerWidth >= 1024) {
        setResponsiveItems(itemsToShow);
      } else if (window.innerWidth >= 640) {
        setResponsiveItems(Math.max(2, Math.floor(itemsToShow * 0.75)));
      } else {
        setResponsiveItems(1);
      }
    };

    updateItems();
    window.addEventListener('resize', updateItems);
    return () => window.removeEventListener('resize', updateItems);
  }, [itemsToShow]);

  const totalSlides = Math.ceil(childrenArray.length / responsiveItems);

  useEffect(() => {
    if (autoSlide && totalSlides > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [autoSlide, interval, totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const getVisibleItems = () => {
    const start = currentIndex * itemsToShow;
    return childrenArray.slice(start, start + itemsToShow);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / responsiveItems)}%)`,
          }}
        >
          {childrenArray.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ width: `${100 / responsiveItems}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 z-10 transition-all hover:scale-110"
            aria-label="Previous slide"
          >
            <svg
              className="w-5 h-5 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 z-10 transition-all hover:scale-110"
            aria-label="Next slide"
          >
            <svg
              className="w-5 h-5 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

