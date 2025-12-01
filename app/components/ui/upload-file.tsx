"use client";

import React from "react";
import { generateUploadButton } from "@uploadthing/react";
import { UploadCloud, AlertCircle } from "lucide-react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
const TypedUploadButton = generateUploadButton<OurFileRouter>();
import { FilePreview } from "./file-preview";

// Composant UploadFile
// - gère la sélection et le dépôt de fichiers
// - affiche immédiatement des previews locales (object URLs)
// - déclenche l'upload via UploadThing
// - lorsque UploadThing renvoie les URLs distantes, on enregistre chaque URL
//   auprès du backend (/api/image/register) pour obtenir une URL locale
//   stable incluant une extension (ex: /api/image/:id.jpg). On utilise
//   ensuite ces URLs locales pour les previews finales et pour stocker
//   les références en base.
export function UploadFile({ 
  endpoint,
  value = [],
  onChange,
  onSuccess,
  maxFiles = 1,
  accept = {},
  className = "", 
  placeholder,
  onError,
}: {
  endpoint: keyof OurFileRouter;
  value?: { name: string; url: string; size?: number; type?: string; }[];
  onChange?: (files: { name: string; url: string; size?: number; type?: string; }[]) => void;
  onSuccess?: (message: string) => void;
  maxFiles?: number;
  accept?: { [key: string]: string[] } | string;
  className?: string;
  placeholder?: string;
  onError?: (error: Error) => void;
}) {
  type FileOrInfo = File | { name: string; url: string; size?: number; type?: string };
  const [files, setFiles] = React.useState<FileOrInfo[]>(
    // initialize from `value` (array of uploaded infos) and cast safely
    (value as unknown as { name: string; url: string; size?: number; type?: string }[])
  );
  const [uploading, setUploading] = React.useState(false);
  // map pour gérer les loaders par fichier (clé = nom de fichier)
  const [uploadingMap, setUploadingMap] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<string>("");
  
  type UploadResponse = {
    name: string;
    url: string;
    size?: number;
    type?: string;
  }[];

  const handleUploadComplete = (res?: UploadResponse) => {
    if (!res) return;
    const newFiles = res.map((f) => ({
      name: f.name,
      url: f.url,
      size: f.size,
      type: f.type,
    }));
    // Replace any placeholder File entries with their uploaded counterparts (match by name)
    const updated = [...files];
    newFiles.forEach((nf) => {
      const idx = updated.findIndex((item) => item instanceof File && item.name === nf.name);
      if (idx >= 0) {
        updated[idx] = nf;
      } else {
        updated.push(nf);
      }
    });

    // For each newly uploaded file, register it with our backend to get a proxied URL with extension
    const registerRemote = async (remoteUrl: string) => {
      try {
        const resp = await fetch("http://localhost:5000/api/image/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: remoteUrl }),
        });
        if (!resp.ok) return remoteUrl;
        const json = await resp.json();
        return json.localUrl || remoteUrl;
      } catch (e) {
        console.error("registerRemote error", e);
        return remoteUrl;
      }
    };

    const finalize = async () => {
      const finalizedFiles = await Promise.all(
        newFiles.map(async (nf) => {
          const proxied = await registerRemote(nf.url);
          return { ...nf, url: proxied };
        })
      );

      // replace placeholders and push finalized
      const merged = [...files];
      finalizedFiles.forEach((nf) => {
        const idx = merged.findIndex((item) => item instanceof File && item.name === nf.name);
        if (idx >= 0) merged[idx] = nf;
        else merged.push(nf);
      });

      setFiles(merged);
      const finalOnly = merged.filter((it): it is { name: string; url: string; size?: number; type?: string } =>
        typeof it !== 'object' ? false : 'url' in it && typeof (it as { url?: unknown }).url === 'string'
      );
      onChange?.(finalOnly);

      // Indiquer le succès via callback (ex: page parent peut afficher un toast)
      onSuccess?.("Fichier(s) uploadé(s) avec succès");

      // Retirer les flags d'upload pour les fichiers finalisés (chargement individuel)
      setUploadingMap((prev) => {
        const next = { ...prev };
        finalizedFiles.forEach((f) => delete next[f.name]);
        return next;
      });

      // Fin de l'upload global
      setUploading(false);
      setError("");

      uploadPromiseRef.current.resolve?.();
      uploadPromiseRef.current = {};
    };

    // Attendre la finalisation avant de continuer
    void finalize();
  };

  const handleUploadError = (err: Error) => {
    setError(err.message);
    // clear per-file flags
    setUploadingMap({});
    setUploading(false);
    onError?.(err);
    uploadPromiseRef.current.reject?.(err);
    uploadPromiseRef.current = {};
  };

const uploadBtnContainerRef = React.useRef<HTMLDivElement | null>(null);
const uploadPromiseRef = React.useRef<{ resolve?: () => void; reject?: (e?: unknown) => void }>({});

const startUpload = async (inputFiles: File[]) => {
  setUploading(true);
  // marquer chaque fichier comme en cours d'upload
  setUploadingMap((prev) => {
    const next = { ...prev };
    inputFiles.forEach((f) => (next[f.name] = true));
    return next;
  });
  return new Promise<void>((resolve, reject) => {
    uploadPromiseRef.current = { resolve, reject };

    // Find the internal input inside the UploadButton
    const container = uploadBtnContainerRef.current;
    if (!container) {
      reject(new Error("Upload button not mounted"));
      setUploading(false);
      return;
    }

    const inputEl = container.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (!inputEl) {
      reject(new Error("Upload input not found"));
      setUploading(false);
      return;
    }

    // Build a DataTransfer to set files programmatically
    const dt = new DataTransfer();
    inputFiles.forEach((f) => dt.items.add(f));
    inputEl.files = dt.files;

    // Dispatch change to trigger UploadButton behavior
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return;

    const fileArray = Array.from(selectedFiles);

    // For single file uploads (maxFiles = 1), replace existing file instead of adding
    if (maxFiles === 1 && files.length > 0) {
      // Replace existing file
      setFiles(fileArray);
    } else {
      // Vérifier le nombre maximal de fichiers
      if (files.length + selectedFiles.length > maxFiles) {
        setError(`Vous ne pouvez uploader que ${maxFiles} fichier${maxFiles > 1 ? 's' : ''} maximum`);
        return;
      }

      // Add immediate previews for selected files (File objects). FilePreview supports File instances.
      setFiles((prev) => [...prev, ...fileArray]);
    }
    const invalidFiles = fileArray.filter(file => {
      if (typeof accept === 'string') {
        // Le navigateur filtrera déjà via l'attribut accept, on accepte tout ici
        return false;
      }
      const fileType = (file.type || '').split('/')[0];
      return !Object.keys(accept || {}).includes(fileType);
    });

    if (invalidFiles.length) {
      setError("Type de fichier non supporté");
      return;
    }

    // Vérifier la taille des fichiers (8MB max)
    const maxSize = 8 * 1024 * 1024; // 8MB en octets
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);

    if (oversizedFiles.length) {
      setError("La taille maximum par fichier est de 8MB");
      return;
    }

    setUploading(true);
    await startUpload(fileArray);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    const finalized = newFiles.filter((it): it is { name: string; url: string; size?: number; type?: string } =>
      typeof it !== 'object' ? false : 'url' in it && typeof (it as { url?: unknown }).url === 'string'
    );
    onChange?.(finalized);
  };

  const dropzoneClasses = `
    cursor-pointer rounded-lg p-4 shadow-sm
    transition-colors relative
    ${uploading ? 'opacity-50 pointer-events-none' : ''}
    ${error ? 'bg-red-50' : 'hover:shadow-md'}
    ${className}
  `;

  return (
    <div className="space-y-4">
      {/* Hidden UploadButton used to programmatically trigger uploads */}
      <div ref={uploadBtnContainerRef} style={{ display: "none" }}>
        {/* Use a typed UploadButton wrapper produced by generateUploadButton to satisfy generics */}
        <TypedUploadButton
          endpoint={endpoint}
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>
      {/* Zone de dépôt */}
      <div
        onClick={() => document.getElementById(`file-input-${endpoint}`)?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileSelect(e.dataTransfer.files);
        }}
        className={dropzoneClasses}
      >
        <input
          id={`file-input-${endpoint}`}
          type="file"
          className="hidden"
          multiple={maxFiles > 1}
          accept={
            typeof accept === "string"
              ? accept
              : Object.entries(accept || {})
                  .map(([type, exts]) => exts.map(ext => `${type}/${ext}`))
                  .flat()
                  .join(",")
          }
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        <div className="flex flex-col items-center text-gray-500">
          <UploadCloud className="w-10 h-10 mb-2 text-gray-400" />
          <p className="text-sm font-medium mb-1">
            {placeholder || `Glissez ou cliquez pour uploader ${maxFiles > 1 ? 'des fichiers' : 'un fichier'}`}
          </p>
          <p className="text-xs">
            {typeof accept === 'string'
              ? accept
              : Object.entries(accept || {})
                  .map(([type, exts]) => {
                    const list = Array.isArray(exts) ? exts.join(', ') : String(exts);
                    return `${type === 'application' ? 'PDF' : type.toUpperCase()} ${list}`;
                  })
                  .join(', ')}
          </p>
          <p className="text-xs mt-1">8 Mo max. par fichier</p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="w-4 h-4" />
          <p>Erreur réseau. Veuillez réessayer plutard</p>
          {/* <p>{error}</p> */}
        </div>
      )}

      {/* Prévisualisations */}
      <div className="space-y-2">
        {files.map((file, index) => {
          const key = typeof file === 'string' ? file : 'url' in file ? file.url : `${file.name}-${index}`;
          const perFileUploading = file instanceof File ? !!uploadingMap[file.name] : false;
          return (
            <FilePreview
              key={key}
              file={file}
              onRemove={() => removeFile(index)}
              onCancel={() => {
                // Annuler l'upload pour ce fichier spécifique
                if (file instanceof File && uploadingMap[file.name]) {
                  // Supprimer le fichier de la liste
                  removeFile(index);

                  // Retirer le flag d'upload pour ce fichier
                  setUploadingMap((prev) => {
                    const next = { ...prev };
                    delete next[file.name];
                    return next;
                  });

                  // Vérifier si c'était le dernier fichier en cours d'upload
                  const remainingUploads = Object.keys(uploadingMap).filter(name => name !== file.name);
                  if (remainingUploads.length === 0) {
                    setUploading(false);
                    uploadPromiseRef.current = {};
                  }
                }
              }}
              isUploading={perFileUploading}
            />
          );
        })}
      </div>
    </div>
  );
}

