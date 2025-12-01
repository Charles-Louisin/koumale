import React from "react";

interface SkeletonLoadingProps {
  type: "products" | "vendors" | "promotions";
  count?: number;
}

export function SkeletonLoading({ type, count = 6 }: SkeletonLoadingProps) {
  const renderSkeleton = (index: number) => {
    if (type === "products") {
      return (
        <div key={index} className="group">
          <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl aspect-square">
            <div className="relative bg-gray-50 overflow-hidden w-full h-full">
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <div className="h-3 bg-white/20 rounded mb-1 animate-pulse" />
                <div className="h-4 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-white/20 rounded w-16 animate-pulse" />
                  <div className="bg-white/30 rounded-full w-6 h-6 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === "vendors") {
      return (
        <div key={index} className="group">
          <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
            <div className="aspect-[4/3] relative bg-gray-50">
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              <div className="absolute -bottom-6 left-3 w-12 h-12 bg-gray-300 rounded-xl animate-pulse" />
            </div>
            <div className="pt-8 px-3 pb-3">
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded mb-1 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>
      );
    }

    if (type === "promotions") {
      return (
        <div key={index} className="group">
          <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl aspect-square">
            <div className="relative bg-gray-50 overflow-hidden w-full h-full">
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              <div className="absolute top-2 right-2 bg-red-200 rounded-lg w-12 h-5 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <div className="h-3 bg-white/20 rounded mb-1 animate-pulse" />
                <div className="h-4 bg-white/20 rounded mb-1 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-white/20 rounded w-16 animate-pulse" />
                  <div className="bg-white/30 rounded-full w-6 h-6 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
}
