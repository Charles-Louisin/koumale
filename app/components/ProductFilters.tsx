"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, MapPin, Star, DollarSign } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface ProductFiltersProps {
    onFiltersChange: (filters: {
        q?: string;
        minPrice?: number;
        maxPrice?: number;
        address?: string;
        minRating?: number;
        isNew?: string;
        isOnPromotion?: boolean;
    }) => void;
    initialFilters?: {
        q?: string;
        minPrice?: number;
        maxPrice?: number;
        address?: string;
        minRating?: number;
        isNew?: string;
        isOnPromotion?: boolean;
    };
}

export default function ProductFilters({ onFiltersChange, initialFilters = {} }: ProductFiltersProps) {
    const [searchQuery, setSearchQuery] = useState(initialFilters.q || "");
    const [minPrice, setMinPrice] = useState(initialFilters.minPrice?.toString() || "");
    const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice?.toString() || "");
    const [address, setAddress] = useState(initialFilters.address || "");
    const [minRating, setMinRating] = useState(initialFilters.minRating?.toString() || "");
    const [isNew, setIsNew] = useState(initialFilters.isNew || "");
    const [isOnPromotion, setIsOnPromotion] = useState(initialFilters.isOnPromotion || false);
    const [isExpanded, setIsExpanded] = useState(false);

    const applyFilters = () => {
        const filters: {
            q?: string;
            minPrice?: number;
            maxPrice?: number;
            address?: string;
            minRating?: number;
            isNew?: string;
            isOnPromotion?: boolean;
        } = {};

        if (searchQuery.trim()) filters.q = searchQuery.trim();
        if (minPrice && !isNaN(Number(minPrice))) filters.minPrice = Number(minPrice);
        if (maxPrice && !isNaN(Number(maxPrice))) filters.maxPrice = Number(maxPrice);
        if (address.trim()) filters.address = address.trim();
        if (minRating && !isNaN(Number(minRating))) filters.minRating = Number(minRating);
        if (isNew) filters.isNew = isNew;
        if (isOnPromotion) filters.isOnPromotion = isOnPromotion;

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
    }, [minPrice, maxPrice, address, minRating, isNew, isOnPromotion]);

    const clearFilters = () => {
        setSearchQuery("");
        setMinPrice("");
        setMaxPrice("");
        setAddress("");
        setMinRating("");
        setIsNew("");
        setIsOnPromotion(false);
    };

    const hasActiveFilters = searchQuery || minPrice || maxPrice || address || minRating || isNew || isOnPromotion;

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                    type="text"
                    placeholder="Rechercher des produits..."
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
                            {Object.values({ searchQuery, minPrice, maxPrice, address, minRating, isNew, isOnPromotion }).filter(Boolean).length}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    {/* Price Range */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <DollarSign className="w-4 h-4" />
                            Prix (FCFA)
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="text-sm"
                                min="0"
                            />
                            <Input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="text-sm"
                                min="0"
                            />
                        </div>
                    </div>

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

                    {/* New and On Promotion Filters */}
                    {/* <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Statut</label>
                        <div className="space-y-2 ">
                            <div className="space-y-1">
                                <select
                                    value={isNew}
                                    onChange={(e) => setIsNew(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Tous les produits</option>
                                    <option value="6months">Il y a 6 mois</option>
                                    <option value="3months">Il y a 3 mois</option>
                                    <option value="1month">Il y a 1 mois</option>
                                    <option value="1week">Il y a 1 semaine</option>
                                </select>
                            </div>
                        </div>
                    </div> */}

                    {/* Active Filters Display */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm mb-4">
                            <input
                                type="checkbox"
                                checked={isOnPromotion}
                                onChange={(e) => setIsOnPromotion(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            En promotion
                        </label>
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
                            {minPrice && (
                                <Badge variant="secondary" className="text-xs relative pr-6 cursor-pointer hover:bg-gray-300 transition-colors">
                                    Prix min: {minPrice} FCFA
                                    <button
                                        onClick={() => setMinPrice("")}
                                        className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            )}
                            {maxPrice && (
                                <Badge variant="secondary" className="text-xs relative pr-6 cursor-pointer hover:bg-gray-300 transition-colors">
                                    Prix max: {maxPrice} FCFA
                                    <button
                                        onClick={() => setMaxPrice("")}
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
                            {isNew && (
                                <Badge variant="secondary" className="text-xs relative pr-6 cursor-pointer hover:bg-gray-300 transition-colors">
                                    Nouveaux: {isNew === "6months" ? "6 mois" : isNew === "3months" ? "3 mois" : isNew === "1month" ? "1 mois" : "1 semaine"}
                                    <button
                                        onClick={() => setIsNew("")}
                                        className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            )}
                            {isOnPromotion && (
                                <Badge variant="secondary" className="text-xs relative pr-6 cursor-pointer hover:bg-gray-300 transition-colors">
                                    En promotion
                                    <button
                                        onClick={() => setIsOnPromotion(false)}
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
