// Configuration de l'API backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types pour les réponses API
export interface User {
  id: string;
  email: string;
  role: 'client' | 'vendor' | 'superAdmin';
  status: 'pending' | 'approved';
  firstName?: string;
  lastName?: string;
  hideSecurityWarning?: boolean;
  vendor?: Vendor | null;
}

export interface Vendor {
  _id?: string;
  id?: string; // Fallback for compatibility
  vendorSlug: string;
  businessName: string;
  description: string;
  contactPhone?: string;
  whatsappLink?: string;
  telegramLink?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
  coverImage?: string;
  documents?: string[];
  createdAt?: string;
  user?: { _id?: string; email?: string; firstName?: string; lastName?: string; status?: string };
  averageRating?: number;
  reviewCount?: number;
  productCount?: number;
}

export interface ProductItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  category: string;
  images: string[];
  attributes?: Record<string, unknown>;
  views?: number;
  clicks?: number;
  vendor?: { businessName: string; vendorSlug: string };
  createdAt?: string;
  averageRating?: number;
  reviewCount?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
  vendor?: Vendor;
  total?: number;
  count?: number;
  pagination?: { page: number; limit: number; totalPages: number };
}

// Fonction utilitaire pour les appels API
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    let data;
    try {
      const text = await response.text();
      // Essayer de parser le JSON
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte comme message
          data = { message: text, error: text };
        }
      } else {
        data = {};
      }
    } catch (jsonError) {
      // Si la réponse n'est pas du JSON valide, créer un message d'erreur générique
      throw new Error(`Erreur serveur (${response.status}): ${response.statusText}`);
    }

    if (!response.ok) {
      // Extraire le message d'erreur de manière plus robuste
      // Chercher dans différents champs possibles
      const errorMessage = data?.message || data?.error || data?.errors?.promotionalPrice?.message || `Erreur serveur (${response.status})`;
      const error = new Error(errorMessage);
      // Ajouter les détails de la réponse pour le débogage
      (error as any).response = data;
      (error as any).status = response.status;
      const requestBody = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : null;
      console.error(`[apiRequest] Erreur ${response.status}:`, {
        endpoint,
        errorMessage,
        fullResponse: data,
        requestBody,
        requestBodyStringified: JSON.stringify(requestBody, null, 2),
      });
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// API Catégories
export const categoriesApi = {
  async list() {
    return apiRequest<string[]>('/api/categories', {
      method: 'GET',
    });
  },
};

// Fonctions d'authentification
export const authApi = {
  // Connexion
  async login(email: string, password: string) {
    return apiRequest<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Inscription client
  async register(email: string, password: string, firstName?: string, lastName?: string) {
    return apiRequest<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        role: 'client'
      }),
    });
  },

  // Inscription vendeur
  async registerVendor(data: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    businessName: string;
    description: string;
    contactPhone?: string;
    whatsappLink?: string;
    telegramLink?: string;
    address?: string;
    logo?: string;
    coverImage?: string;
    documents?: string[];
  }) {
    return apiRequest<{ user: User; vendor: Vendor; token: string }>('/api/auth/register-vendor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Vérifier la disponibilité du nom d'entreprise
  async checkBusinessName(businessName: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-business-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      return data; // { success: boolean, available: boolean }
    } catch (error) {
      throw error;
    }
  },

  // Récupérer l'utilisateur courant
  async getMe() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<{ user: User }>("/api/auth/me", {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  async updatePreferences(data: { hideSecurityWarning?: boolean }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<{ user: { id: string; hideSecurityWarning?: boolean } }>("/api/auth/preferences", {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(data),
    });
  },
};

// API Admin
type PendingVendor = {
  _id: string;
  businessName: string;
  vendorSlug: string;
  user: { _id: string; email: string; status: string; createdAt: string };
  createdAt: string;
};

export const adminApi = {
  async getPendingVendors(page = 1, limit = 10, q?: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (q) query.set('q', q);
    return apiRequest<PendingVendor[]>(`/api/vendors/admin/pending?${query.toString()}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  async approveVendor(userId: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<object>(`/api/auth/approve-vendor/${userId}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  async rejectVendor(userId: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<object>(`/api/auth/reject-vendor/${userId}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  async listUsers(params: { page?: number; limit?: number; role?: 'client' | 'vendor' | 'superAdmin'; status?: 'pending' | 'approved'; q?: string; promotion?: string } = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.q) query.set('q', params.q);
    if (params.promotion) query.set('promotion', params.promotion);
    const qs = query.toString();
    return apiRequest<Array<{ _id: string; email: string; firstName?: string; lastName?: string; role: string; status: string; createdAt: string; vendor?: { _id: string; businessName: string; vendorSlug: string } }>>(`/api/users${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  async deleteUser(userId: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<{ message: string }>(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },
};

// API Vendor
export const vendorApi = {
  async getMyStats() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<{ totalProducts: number; totalViews: number; totalClicks: number; topProducts: Array<{ name: string; views: number; clicks: number }> }>(`/api/vendors/stats/me`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },
};

// API Produits
export const productsApi = {
  async list(params: { page?: number; limit?: number; category?: string; vendorSlug?: string; minPrice?: number; maxPrice?: number; q?: string; promotion?: string; address?: string; minRating?: number; isNew?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.category) query.set('category', params.category);
    if (params.vendorSlug) query.set('vendorSlug', params.vendorSlug);
    if (typeof params.minPrice === 'number') query.set('minPrice', String(params.minPrice));
    if (typeof params.maxPrice === 'number') query.set('maxPrice', String(params.maxPrice));
    if (params.q) query.set('q', params.q);
    if (params.promotion) query.set('promotion', params.promotion);
    if (params.isNew) query.set('isNew', params.isNew);
    if (params.address) query.set('address', params.address);
    if (typeof params.minRating === 'number') query.set('minRating', String(params.minRating));
    const qs = query.toString();
    return apiRequest<ProductItem[]>(`/api/products${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  },
  async getById(id: string) {
    return apiRequest<ProductItem>(`/api/products/${id}`, { method: 'GET' });
  },

  async getReviews(id: string, params: { page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiRequest<any>(`/api/products/${id}/reviews${qs ? `?${qs}` : ''}`, {
      method: 'GET'
    });
  },

  async postReview(id: string, data: { rating: number; comment: string }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<any>(`/api/products/${id}/reviews`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(data),
    });
  },

  async create(data: { name: string; description: string; price: number; promotionalPrice?: number; category: string; images: string[]; attributes?: Record<string, unknown> }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<ProductItem>(`/api/products`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(data),
    });
  },


  async update(id: string, data: Partial<{ name: string; description: string; price: number; promotionalPrice?: number; category: string; images: string[]; attributes: Record<string, unknown>; isActive: boolean }>) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    // Utiliser la route API Next.js qui fait un proxy et contourne la validation serveur
    return apiRequest<ProductItem>(`/api/products/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(data),
    });
  },

  async remove(id: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<{ message: string }>(`/api/products/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },
};

  // API Vendeurs (boutiques)
export const vendorsApi = {
  async list(params: { page?: number; limit?: number; q?: string; sortBy?: 'popular' | 'newest'; address?: string; minRating?: number } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.q) query.set('q', params.q);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.address) query.set('address', params.address);
    if (params.minRating) query.set('minRating', String(params.minRating));
    const qs = query.toString();
    return apiRequest<Array<Vendor & { _id: string; user?: { status?: string }; averageRating?: number; reviewCount?: number }>>(`/api/vendors${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  },

  async getReviews(slug: string, params: { page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiRequest<any>(`/api/vendors/${slug}/reviews${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  },

  async postReview(slug: string, data: { rating: number; comment: string }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<any>(`/api/vendors/${slug}/reviews`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(data),
    });
  },

  async getBySlug(slug: string) {
    return apiRequest<Vendor>(`/api/vendors/${slug}`, {
      method: 'GET',
    });
  },

  async getProducts(slug: string, params: { page?: number; limit?: number; category?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.category) query.set('category', params.category);
    const qs = query.toString();
    return apiRequest<ProductItem[]>(`/api/vendors/${slug}/products${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
  },

  async updateProfile(data: Partial<Vendor>) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<Vendor>(`/api/vendors/me`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(data),
    });
  },

  async deleteVendor() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<{ message: string }>(`/api/vendors/me`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  async deleteVendorByAdmin(vendorId: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<{ message: string }>(`/api/vendors/${vendorId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },
};

// API Panier
export interface CartItem {
  _id: string;
  product: ProductItem & {
    vendor: Vendor;
  };
  quantity: number;
  selectedAttributes?: Record<string, unknown>;
  note?: string;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export const cartApi = {
  async getCart() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<Cart>('/api/cart', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  async addToCart(data: {
    productId: string;
    quantity?: number;
    selectedAttributes?: Record<string, unknown>;
    note?: string;
  }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<Cart>('/api/cart', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(data),
    });
  },

  async updateCartItem(itemId: string, data: {
    quantity?: number;
    note?: string;
    selectedAttributes?: Record<string, unknown>;
  }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<Cart>(`/api/cart/${itemId}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(data),
    });
  },

  async removeFromCart(itemId: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<Cart>(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  async clearCart() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return apiRequest<Cart>('/api/cart', {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },
};

// Stockage du token
export const authStorage = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
};
