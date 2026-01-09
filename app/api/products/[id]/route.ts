import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Récupérer le token depuis les headers
    const authHeader = request.headers.get('authorization');
    
    // Si on a un prix promotionnel, utiliser la stratégie en deux étapes pour contourner le bug serveur
    if (body.promotionalPrice !== undefined && body.promotionalPrice !== null && body.price !== undefined) {
      // Vérifier que les données sont valides
      if (body.promotionalPrice >= body.price) {
        return NextResponse.json(
          { success: false, message: 'Le prix promotionnel doit être inférieur au prix normal' },
          { status: 400 }
        );
      }
      
      console.log('[API Proxy] Contournement de la validation serveur - stratégie en deux étapes');
      
      // Étape 1: Mettre à jour tout sauf le prix promotionnel
      const updateWithoutPromo = { ...body };
      delete updateWithoutPromo.promotionalPrice;
      
      const response1 = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(updateWithoutPromo),
      });
      
      if (!response1.ok) {
        const errorData = await response1.json();
        return NextResponse.json(errorData, { status: response1.status });
      }
      
      // Attendre un peu pour s'assurer que la première mise à jour est bien enregistrée
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Étape 2: Mettre à jour le prix promotionnel avec le prix actuel
      const response2 = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          price: body.price,
          promotionalPrice: body.promotionalPrice,
        }),
      });
      
      const data2 = await response2.json();
      return NextResponse.json(data2, { status: response2.status });
    }
    
    // Si pas de prix promotionnel, mise à jour normale
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Proxy] Erreur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    );
  }
}
