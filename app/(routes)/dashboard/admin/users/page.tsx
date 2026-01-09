"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { adminApi } from "@/app/lib/api";
import { Search, Filter, Users, UserCheck, UserX, Crown, Mail, Calendar, ChevronLeft, ChevronRight, Eye, Shield, Trash2, Store } from "lucide-react";
import { Modal } from "@/app/components/ui/modal";
import { useToast } from "@/app/hooks/use-toast";

type UserRow = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  createdAt: string;
  vendor?: {
    _id: string;
    businessName: string;
    vendorSlug: string;
  };
};

type ApiUser = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'client' | 'vendor' | 'superAdmin';
  status: 'pending' | 'approved';
  createdAt: string;
  vendor?: {
    _id: string;
    businessName: string;
    vendorSlug: string;
  };
};

export default function AdminUsersPage() {
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(12);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [role, setRole] = React.useState<'' | 'client' | 'vendor' | 'superAdmin'>('');
  const [status, setStatus] = React.useState<'' | 'pending' | 'approved'>('');
  const [q, setQ] = React.useState('');
  const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const { success, error: toastError } = useToast();
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    approvedUsers: 0,
    pendingUsers: 0,
    adminUsers: 0
  });

  const allowedRoles = ['client','vendor','superAdmin'] as const;
  type Role = typeof allowedRoles[number];
  const isRole = (v: string): v is Role => (allowedRoles as readonly string[]).includes(v);

  const allowedStatus = ['pending','approved'] as const;
  type Status = typeof allowedStatus[number];
  const isStatus = (v: string): v is Status => (allowedStatus as readonly string[]).includes(v);

  const load = React.useCallback((p: number) => {
    setLoading(true);
    adminApi
      .listUsers({ page: p, limit, role: role || undefined, status: status || undefined, q: q || undefined })
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const users = res.data as ApiUser[];
          setRows(users.map(u => ({
            _id: u._id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            status: u.status,
            createdAt: u.createdAt,
            vendor: u.vendor,
          })));
          setTotal(typeof res.total === "number" ? res.total : 0);
        }
      })
      .finally(() => setLoading(false));
  }, [limit, role, status, q]);

  // Load stats separately
  React.useEffect(() => {
    const loadStats = async () => {
      const [allRes, approvedRes, pendingRes, adminRes] = await Promise.all([
        adminApi.listUsers({ page: 1, limit: 1 }),
        adminApi.listUsers({ page: 1, limit: 1, status: 'approved' }),
        adminApi.listUsers({ page: 1, limit: 1, status: 'pending' }),
        adminApi.listUsers({ page: 1, limit: 1, role: 'superAdmin' })
      ]);

      setStats({
        totalUsers: allRes.success ? (allRes.total || 0) : 0,
        approvedUsers: approvedRes.success ? (approvedRes.total || 0) : 0,
        pendingUsers: pendingRes.success ? (pendingRes.total || 0) : 0,
        adminUsers: adminRes.success ? (adminRes.total || 0) : 0
      });
    };
    loadStats();
  }, []);

  React.useEffect(() => { load(page); }, [load, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const clearFilters = () => {
    setQ('');
    setRole('');
    setStatus('');
    setPage(1);
    load(1);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setDeleting(true);
    try {
      const res = await adminApi.deleteUser(deleteUserId);
      if (res.success) {
        success("Utilisateur supprimé avec succès");
        setRows((prev) => prev.filter((u) => u._id !== deleteUserId));
        setTotal((prev) => Math.max(0, prev - 1));
        setDeleteUserId(null);
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superAdmin': return <Crown className="w-4 h-4" />;
      case 'vendor': return <Shield className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superAdmin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'vendor': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'approved'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">Gestion des Utilisateurs</h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Surveillez et gérez tous les comptes utilisateurs de votre plateforme avec des outils avancés.
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Utilisateurs</p>
                  <p className="text-4xl font-bold text-blue-900">{stats.totalUsers}</p>
                </div>
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Utilisateurs Approuvés</p>
                  <p className="text-4xl font-bold text-green-900">{stats.approvedUsers}</p>
                </div>
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">En Attente</p>
                  <p className="text-4xl font-bold text-amber-900">{stats.pendingUsers}</p>
                </div>
                <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserX className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Admin</p>
                  <p className="text-4xl font-bold text-purple-900">{stats.adminUsers}</p>
                </div>
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-t-lg border-b border-indigo-100">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Filter className="w-6 h-6 text-indigo-600" />
              Filtres et Recherche Avancés
            </CardTitle>
            <CardDescription className="text-gray-600">
              Affinez votre recherche pour trouver rapidement les utilisateurs souhaités
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nom, prénom ou email..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-11 h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Rôle</Label>
                <select
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as Role);
                    setStatus('');
                    setPage(1);
                  }}
                >
                  <option value="">Tous les rôles</option>
                  <option value="client">👤 Client</option>
                  <option value="vendor">🏪 Vendeur</option>
                  <option value="superAdmin">👑 Super Admin</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Statut</Label>
                <select
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as Status);
                    setRole('');
                    setPage(1);
                  }}
                >
                  <option value="">Tous les statuts</option>
                  <option value="approved">✅ Approuvé</option>
                  <option value="pending">⏳ En attente</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-12 border-2 border-gray-200 hover:bg-gray-50"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-t-lg border-b border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-indigo-600" />
                  Utilisateurs ({total})
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Gestion complète des comptes utilisateurs de la plateforme
                </CardDescription>
              </div>
              <div className="text-sm w-[30%] md:w-fit flex items-center justify-center text-gray-600 bg-white px-2 py-2 rounded-lg border">
                Page {page} / {totalPages}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="ml-4 text-gray-600">Chargement des utilisateurs...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche.</p>
                <Button onClick={clearFilters} variant="outline" className="border-2">
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4">
                {rows.map((user) => (
                  <Card key={user._id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-indigo-300 bg-white overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        {/* Avatar and Basic Info */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {user.firstName && user.lastName
                                ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                                : user.email.charAt(0).toUpperCase()
                              }
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              {user.role === 'superAdmin' ? 'Admin' : user.role === 'vendor' ? 'Vendeur' : 'Client'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(user.status)}`}>
                              {user.status === 'approved' ? '✓ Approuvé' : '⏳ En attente'}
                            </span>
                          </div>
                        </div>

                        {/* User Details */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                              {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Utilisateur'}
                            </h3>
                            <p className="text-sm text-gray-600 break-all mt-1">{user.email}</p>
                            {user.role === 'vendor' && user.vendor && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Store className="w-3 h-3" />
                                {user.vendor.businessName}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            title="Envoyer un email"
                          >
                            <a href={`mailto:${user.email}`} className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteUserId(user._id)}
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, total)} sur {total} utilisateurs
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="border-2 border-gray-200 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 p-0 ${
                            pageNum === page
                              ? "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0"
                              : "border-2 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="border-2 border-gray-200 hover:bg-gray-50"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de suppression */}
        <Modal isOpen={!!deleteUserId} onClose={() => setDeleteUserId(null)} title="Supprimer l'utilisateur">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-red-900">Attention</h4>
                <p className="text-sm text-red-700">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action supprimera :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
              <li>Le compte utilisateur</li>
              {rows.find(u => u._id === deleteUserId)?.role === 'vendor' && (
                <>
                  <li>La boutique associée et tous ses produits</li>
                </>
              )}
            </ul>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setDeleteUserId(null)} disabled={deleting}>
              Annuler
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteUser}
              disabled={deleting}
            >
              {deleting ? 'Suppression...' : 'Supprimer définitivement'}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}


