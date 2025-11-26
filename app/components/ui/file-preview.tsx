"use client";

import React from "react";
import Image from "next/image";
import { X, FileText, Loader2, CheckCircle2 } from "lucide-react";


interface FilePreviewProps {
  file: File | {
    name: string;
    url?: string;
    size?: number;
    type?: string;
  };
  onRemove?: () => void;
  isUploading?: boolean;
  className?: string;
}

export function FilePreview({ file, onRemove, isUploading, className = "" }: FilePreviewProps) {
  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(() =>
    'url' in file ? file.url : undefined
  );

  React.useEffect(() => {
    let objUrl: string | undefined;
    if ('url' in file && file.url) {
      setPreviewUrl(file.url);
    } else if (file instanceof File) {
      objUrl = URL.createObjectURL(file);
      setPreviewUrl(objUrl);
    }

    return () => {
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [file]);

  const isImage = ('type' in file && file.type?.startsWith("image/")) || previewUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    // Conteneur simplifié : plus de bordure épaisse, juste un padding léger et une ombre subtile
    <div className={`relative group rounded-lg bg-white p-2 shadow ${className}`}>
      <div className="flex items-start gap-3">
        {isImage ? (
          // Preview plus compacte
          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
            {previewUrl ? (
                previewUrl.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={'name' in file ? file.name : ''} className="object-cover w-full h-full" />
              ) : (
                <Image
                  src={previewUrl}
                  alt={'name' in file ? file.name : ''}
                  fill
                  className="object-cover"
                />
              )
            ) : null}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-md bg-gray-50 flex items-center justify-center border border-gray-200">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatFileSize(file.size)}
          </p>
          {isUploading && (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-primary">Envoi en cours...</span>
            </div>
          )}

          {/* Si le fichier a une URL distante (upload terminé), afficher une coche verte */}
          {!isUploading && 'url' in file && file.url && (
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600">Upload terminé</span>
            </div>
          )}
        </div>

        {onRemove && !isUploading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Supprimer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Supprimé: overlay de progression global pour éviter le double spinner */}
    </div>
  );
}