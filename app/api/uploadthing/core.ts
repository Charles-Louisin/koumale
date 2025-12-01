import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
// FileRouter pour différents types de fichiers
export const ourFileRouter = {
  // Définir les routes pour les images de produits
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      // Vous pouvez vérifier l'authentification ici
      // const user = await auth(req);
      
      // Simuler un utilisateur authentifié pour le moment
      const user = { id: "user_id", role: "vendor" };
      
      // Si vous n'avez pas d'utilisateur, vous pouvez rejeter la requête
      if (!user) throw new Error("Unauthorized");
      
      // Retourner des métadonnées qui seront accessibles dans onUploadComplete
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Ceci est appelé une fois que l'upload est terminé
      console.log("Upload complet pour l'utilisateur:", metadata.userId);

      // Vous pouvez retourner une réponse qui sera envoyée au client
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
    
  // Définir la route pour le logo vendeur (une seule image, max 8MB)
  vendorLogo: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = { id: "vendor_id", role: "vendor" };
      if (!user || user.role !== "vendor") throw new Error("Unauthorized");
      return { vendorId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload logo vendeur complet:", metadata.vendorId);
      return { uploadedBy: metadata.vendorId, url: file.ufsUrl };
    }),

  // Définir la route pour l'image de couverture (une seule image, max 8MB)
  vendorCover: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = { id: "vendor_id", role: "vendor" };
      if (!user || user.role !== "vendor") throw new Error("Unauthorized");
      return { vendorId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload cover vendeur complet:", metadata.vendorId);
      return { uploadedBy: metadata.vendorId, url: file.ufsUrl };
    }),
    
  // Définir la route pour les documents justificatifs (max 3 fichiers de 8MB chacun)
  vendorDocument: f({ 
    image: { maxFileSize: "8MB", maxFileCount: 3 },
    pdf: { maxFileSize: "8MB", maxFileCount: 3 }
  })
    .middleware(async ({ req }) => {
      const user = { id: "vendor_id", role: "vendor" };
      
      if (!user || user.role !== "vendor") throw new Error("Unauthorized");
      
      return { vendorId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document vendeur uploadé:", metadata.vendorId);

      return { uploadedBy: metadata.vendorId, url: file.ufsUrl };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
