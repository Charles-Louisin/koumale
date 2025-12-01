"use client";

import React from "react";
import { Star } from "lucide-react";

interface Review {
  _id: string;
  user: {
    firstName?: string;
    lastName?: string;
  };
  rating: number;
  comment: string;
}

interface ReviewListCarouselProps {
  reviews: Review[];
}

/**
 * Generates initials from user's first and last name.
 */
function getInitials(firstName?: string, lastName?: string): string {
  const firstInitial = firstName?.charAt(0).toUpperCase() ?? "";
  const lastInitial = lastName?.charAt(0).toUpperCase() ?? "";
  return firstInitial + lastInitial;
}

export function ReviewListCarousel({ reviews }: ReviewListCarouselProps) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-600 italic text-center">Aucun avis pour le moment.</p>;
  }

  return (
    <div
      className="overflow-x-auto scroll-snap-x mandatory snap-proximity flex py-8 px-6 gap-6"
      style={{
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {reviews.map((review) => (
        <div
          key={review._id}
          className="snap-center h-fit flex-shrink-0 bg-white rounded-3xl shadow-xl p-6 max-w-md mx-auto flex flex-col justify-between"
          style={{
            scrollSnapAlign: "center",
            width: "80vw",
            minWidth: "280px",
          }}
        >
          <div>
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-orange-600 text-white font-extrabold text-2xl shadow-lg select-none">
                {getInitials(review.user.firstName, review.user.lastName)}
              </div>
              <div className="ml-4 flex flex-col">
                <span className="text-lg font-semibold text-gray-900 leading-tight tracking-tight">
                  {review.user.firstName} {review.user.lastName}
                </span>
              </div>
            </div>
            <div className="flex items-center mb-4 space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-800 whitespace-pre-wrap text-base font-serif leading-relaxed">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
