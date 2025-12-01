"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { LogIn, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { authApi, authStorage } from "@/app/lib/api";
import { useToast } from "@/app/hooks/use-toast";
import { ToastContainer } from "@/app/components/ui/toast";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { toasts, success, error, removeToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!email) return "Email requis";
    const valid = /^\S+@\S+\.\S+$/.test(email);
    return valid ? "" : "Format d'email invalide";
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    if (!password) return "Mot de passe requis";
    return password.length < 8 ? "Au moins 8 caractères" : "";
  }, [password, touched.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login(email, password);

      if (response.success && response.token) {
        authStorage.setToken(response.token);
        const fullName = `${response.user?.firstName ?? ''} ${response.user?.lastName ?? ''}`.trim();
        success(fullName ? `Bienvenu(e) ${fullName}` : "Connexion réussie !");

        // Rediriger selon le rôle
        setTimeout(() => {
          if (response.user?.role === "vendor") {
            router.push("/dashboard/vendor");
          } else if (response.user?.role === "superAdmin") {
            router.push("/dashboard/admin");
          } else {
            router.push("/");
          }
        }, 500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de la connexion";

      // Vérifier si l'erreur indique une vérification email requise
      if (errorMessage.includes("vérifier votre email")) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Rediriger vers l'authentification Google
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-0 md:px-4">
        <div className="w-full md:max-w-md">
          <div className="bg-white p-8 rounded-lg">
            {/* Header avec logo et bouton retour */}


            {/* Titre */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
                <div className="relative w-8 h-8">
                  <Image
                    src="/images/logo.png"
                    alt="KOUMALE Logo"
                    fill
                    className="object-contain rounded-md"
                    priority
                  />
                </div>
                <span className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                  KOUMALE
                </span>
              </Link>
              <p className="text-gray-600">
                Accédez à votre compte
              </p>
            </div>

            {/* Bouton Google */}
            {/* <div className="mb-6">
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div> */}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  required
                  disabled={loading}
                  className={`transition-all focus:ring-2 ${emailError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                />
                {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Mot de passe
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary hover:underline transition-colors"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    required
                    disabled={loading}
                    className={`transition-all focus:ring-2 pr-10 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
              </div>
              <Button type="submit" className="w-full" size="md" disabled={loading || !!emailError || !!passwordError}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            {/* Liens footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-600">
                  Pas encore de compte?{" "}
                  <Link href="/auth/register" className="text-primary font-semibold hover:underline transition-colors">
                    S&apos;inscrire
                  </Link>
                </div>
                <div className="text-sm text-gray-600">
                  Vous êtes un vendeur?{" "}
                  <Link href="/auth/register-vendor" className="text-primary font-semibold hover:underline transition-colors">
                    Créer une boutique
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
