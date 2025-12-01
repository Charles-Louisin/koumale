"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { authApi, authStorage } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { Settings, Shield, Mail, Globe, Lock, User, Bell, Database, Save, LogOut, AlertTriangle } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";

export default function AdminSettingsPage() {
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState({
    siteName: 'KOUMALE',
    supportEmail: 'clynlouisin@gmail.com',
    requireVendorApproval: true,
    allowUserRegistration: true,
    maintenanceMode: false,
    emailNotifications: true
  });
  const router = useRouter();
  const { success, error: showError } = useToast();

  const onSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      success("Paramètres sauvegardés avec succès");
    } catch (err) {
      showError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear local storage
      authStorage.removeToken();

      // Redirect to login
      router.push('/');
      success("Déconnexion réussie");
    } catch (err) {
      console.error('Logout error:', err);
      // Even if API call fails, clear local storage and redirect
      authStorage.removeToken();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">Paramètres Système</h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Configuration avancée et gestion de la plateforme. Modifiez les paramètres globaux avec précaution.
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Configuration</p>
                    <p className="text-lg font-bold text-gray-900">Avancée</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-t-lg border-b border-orange-100">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Globe className="w-6 h-6 text-orange-600" />
              Configuration Générale
            </CardTitle>
            <CardDescription className="text-gray-600">
              Informations publiques et paramètres de base de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="site-name" className="text-sm font-medium text-gray-700">Nom du site</Label>
                <Input
                  id="site-name"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="support-email" className="text-sm font-medium text-gray-700">Email support</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100/50 rounded-t-lg border-b border-red-100">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Shield className="w-6 h-6 text-red-600" />
              Sécurité et Modération
            </CardTitle>
            <CardDescription className="text-gray-600">
              Contrôles d&apos;accès et paramètres de sécurité de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Approbation obligatoire des vendeurs</Label>
                  <p className="text-sm text-gray-600">Exige une validation admin avant la mise en ligne des boutiques</p>
                </div>
                <Switch
                  checked={settings.requireVendorApproval}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireVendorApproval: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Inscription utilisateurs</Label>
                  <p className="text-sm text-gray-600">Permettre aux nouveaux utilisateurs de s&apos;inscrire</p>
                </div>
                <Switch
                  checked={settings.allowUserRegistration}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowUserRegistration: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Mode maintenance
                  </Label>
                  <p className="text-sm text-red-600">Désactive temporairement l&apos;accès à la plateforme</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-t-lg border-b border-green-100">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Bell className="w-6 h-6 text-green-600" />
              Notifications
            </CardTitle>
            <CardDescription className="text-gray-600">
              Paramètres de notifications et communications
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Notifications par email</Label>
                  <p className="text-sm text-gray-600">Recevoir les notifications importantes par email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onSave}
            disabled={saving}
            className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex-1 h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="border-2 border-red-200 bg-red-50/50 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              Zone de danger
            </CardTitle>
            <CardDescription className="text-red-600">
              Actions irréversibles qui peuvent affecter l&apos;ensemble de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div>
                  <Label className="text-sm font-medium text-red-700">Réinitialiser la base de données</Label>
                  <p className="text-sm text-red-600 mt-1">Supprime toutes les données (utilisateurs, produits, boutiques)</p>
                </div>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" disabled>
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


