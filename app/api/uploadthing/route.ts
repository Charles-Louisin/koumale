import { createRouteHandler } from "uploadthing/next";
 
import { ourFileRouter } from "./core";
 
// Exporter les gestionnaires de requêtes HTTP nécessaires pour l'API
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
