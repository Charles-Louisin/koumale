"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, MapPin, Star, Sparkles } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface VendorFiltersProps {
  onFiltersChange: (filters: {
    q?: string;
    address?: string;
    minRating?: number;
    sortBy?: 'popular' | 'newest';
  }) => void;
  initialFilters?: {
    q?: string;
    address?: string;
    minRating?: number;
    sortBy?: 'popular' | 'newest';
  };
}

export default function VendorFilters({ onFiltersChange, initialFilters = {} }: VendorFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.q || "");
  const [address, setAddress] = useState(initialFilters.address || "");
  const [minRating, setMinRating] = useState(initialFilters.minRating?.toString() || "");
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>(initialFilters.sortBy || 'newest');
  const [isExpanded, setIsExpanded] = useState(false);

  const applyFilters = () => {
    const filters: {
      q?: string;
      address?: string;
      minRating?: number;
      sortBy?: 'popular' | 'newest';
    } = {};

    if (searchQuery.trim()) filters.q = searchQuery.trim();
    if (address.trim()) filters.address = address.trim();
    if (minRating && !isNaN(Number(minRating))) filters.minRating = Number(minRating);
    filters.sortBy = sortBy;

    onFiltersChange(filters);
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Apply filters immediately for other fields
  useEffect(() => {
    applyFilters();
  }, [address, minRating, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setAddress("");
    setMinRating("");
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || address || minRating || sortBy !== 'newest';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Rechercher des boutiques..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 rounded-xl hover:bg-primary hover:text-white transition-all"
        >
          <Filter className="w-4 h-4" />
          Filtres avancés
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 bg-primary text-white">
              {Object.values({ searchQuery, address, minRating, sortBy }).filter(Boolean).length}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          {/* Address Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              Adresse
            </label>
            <Input
              type="text"
              placeholder="Ville, quartier..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Star className="w-4 h-4" />
              Note minimum
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Toutes les notes</option>
              <option value="1">1+ étoile</option>
              <option value="2">2+ étoiles</option>
              <option value="3">3+ étoiles</option>
              <option value="4">4+ étoiles</option>
              <option value="5">5 étoiles</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Sparkles className="w-4 h-4" />
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'newest')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="newest">Plus récent</option>
              <option value="popular">Plus populaire</option>
            </select>
          </div>

          {/* Active Filters Display */}
          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-medium text-gray-700">Filtres actifs</label>
            <div className="flex flex-wrap gap-1">
              {searchQuery && (
                <Badge variant="secondary" className="text-xs relative pr-6 cursor-pointer hover:bg-gray-300 transition-colors">
                  Recherche: {searchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {address && (
                <Badge variant="secondary" className="text-xs relative pr-6 cursor-pointer hover:bg-gray-300 transition-colors">
                  Adresse: {address}
                  <button
                    onClick={() => setAddress("")}
                    className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {minRating && (
                <Badge variant="secondary" className="text-xs relative pr-6 cursor-pointer hover:bg-gray-300 transition-colors">
                  Note: {minRating}+ étoiles
                  <button
                    onClick={() => setMinRating("")}
                    className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {sortBy !== 'newest' && (
                <Badge variant="secondary" className="text-xs relative pr-6 cursor-pointer hover:bg-gray-300 transition-colors">
                  Tri: {sortBy === 'popular' ? 'Populaire' : 'Récent'}
                  <button
                    onClick={() => setSortBy('newest')}
                    className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
