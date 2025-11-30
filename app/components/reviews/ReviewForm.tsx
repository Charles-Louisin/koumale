"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { productsApi, vendorsApi, authStorage } from "@/app/lib/api";

interface ReviewFormProps {
  productId?: string;
  vendorSlug?: string;
  onReviewSubmitted: (newReview: unknown) => void;
}

export function ReviewForm({ productId, vendorSlug, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  // Check if user is logged in
  const isLoggedIn = !!authStorage.getToken();

  // Determine which API to use
  const api = productId ? productsApi : vendorSlug ? vendorsApi : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn) {
      toastError("Vous devez être connecté pour laisser un avis.");
      return;
    }

    if (!api) {
      toastError("Endpoint de revue non défini.");
      return;
    }
    if (rating < 1 || rating > 5) {
      toastError("La note doit être entre 1 et 5 étoiles.");
      return;
    }
    if (!comment.trim()) {
      toastError("Veuillez entrer un commentaire.");
      return;
    }

    setSubmitting(true);
    try {
      let data;
      if (productId) {
        data = await productsApi.postReview(productId, { rating, comment });
      } else if (vendorSlug) {
        data = await vendorsApi.postReview(vendorSlug, { rating, comment });
      }
      if (!data || !data.success) {
        throw new Error(data?.message || "Erreur lors de l'envoi de la revue.");
      }
      success("Votre avis a été soumis.");
      setRating(0);
      setComment("");
      onReviewSubmitted(data.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError("Une erreur est survenue.");
      }
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white w-full rounded-xl shadow-sm max-w-md">
      <h3 className="font-semibold text-lg mb-3">Laissez votre avis</h3>
      <div className="flex items-center mb-3 space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hoverRating || rating);
          return (
            <Star
              key={star}
              className={`w-8 h-8 transition-colors ${
                isLoggedIn
                  ? filled
                    ? "text-yellow-400 fill-yellow-400 cursor-pointer"
                    : "text-gray-300 cursor-pointer"
                  : "text-gray-200 cursor-not-allowed"
              }`}
              onMouseEnter={isLoggedIn ? () => setHoverRating(star) : undefined}
              onMouseLeave={isLoggedIn ? () => setHoverRating(0) : undefined}
              onClick={isLoggedIn ? () => setRating(star) : undefined}
              aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
            />
          );
        })}
      </div>
      <textarea
        className="w-full rounded-md border border-gray-300 p-2 mb-4 resize-y"
        rows={4}
        placeholder="Votre commentaire..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={submitting || !isLoggedIn}
      />
      <button
        type="submit"
        disabled={submitting || !isLoggedIn}
        className="w-full bg-primary text-white font-semibold py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {submitting ? "Envoi..." : "Envoyer"}
      </button>
      {!isLoggedIn && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Vous devez être connecté pour laisser un avis.
        </p>
      )}
    </form>
  );
}
