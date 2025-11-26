"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/Tabs";
import { UploadFile } from "@/app/components/ui/upload-file";
import { Modal } from "@/app/components/ui/modal";
import { Store, Mail, Lock, Building2, FileText, ArrowRight, Upload, CheckCircle2, ArrowLeft, Eye, EyeOff, MessageCircle, AlertTriangle, AlertCircleIcon } from "lucide-react";
import { authApi, authStorage } from "@/app/lib/api";
import { useToast } from "@/app/hooks/use-toast";
import { ToastContainer } from "@/app/components/ui/toast";
import Image from "next/image";

export default function RegisterVendorPage() {
  const router = useRouter();
  const { toasts, success, error, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Données du formulaire
  const [accountData, setAccountData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [businessData, setBusinessData] = useState({
    businessName: "",
    description: "",
    contactPhone: "+237 ",
    address: "",
    whatsappLink: "+237 ",
    telegramLink: "@",
  });

  const [documentData, setDocumentData] = useState({
    logo: "",
    coverImage: "",
    documents: [] as string[],
  });

  const updateDocument = (type: 'logo' | 'coverImage' | 'documents', value: string | string[]) => {
    setDocumentData(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountData({
      ...accountData,
      [e.target.id]: e.target.value,
    });
    setTouched((t) => ({ ...t, [e.target.id]: true }));
  };

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const id = e.target.id;

    if (id === 'contactPhone' || id === 'whatsappLink') {
      // Gestion du préfixe +237 pour les numéros de téléphone
      if (value.length < 5) {
        return;
      }
      const phoneNumber = value.slice(5);
      const numbersOnly = phoneNumber.replace(/\D/g, '');
      const truncated = numbersOnly.slice(0, 9);

      setBusinessData({
        ...businessData,
        [id]: `+237 ${truncated}`,
      });
    } else if (id === 'telegramLink') {
      // Gestion du préfixe @ pour Telegram
      if (value.length < 1) {
        return;
      }
      // On ne garde que les caractères après le @
      const username = value.slice(1);
      // On enlève les espaces et caractères spéciaux
      const cleanUsername = username.replace(/[^a-zA-Z0-9_]/g, '');
      // Limite à 32 caractères (limite Telegram)
      const truncated = cleanUsername.slice(0, 32);

      setBusinessData({
        ...businessData,
        [id]: `@${truncated}`,
      });
    } else {
      setBusinessData({
        ...businessData,
        [id]: value,
      });
    }
    setTouched((t) => ({ ...t, [id]: true }));
  };

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!accountData.email) return "Email requis";
    const valid = /^\S+@\S+\.\S+$/.test(accountData.email);
    return valid ? "" : "Format d'email invalide";
  }, [accountData.email, touched.email]);

  // Préremplissage si connecté
  React.useEffect(() => {
    authApi.getMe().then((res) => {
      if (res.success && res.user) {
        setAccountData((d) => ({
          ...d,
          email: res.user?.email || d.email,
          firstName: res.user?.firstName || d.firstName,
          lastName: res.user?.lastName || d.lastName,
        }));
        setIsLoggedIn(true);
      }
    }).catch(() => { });
  }, []);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    // If user is logged in, password is optional (leave empty to keep current password)
    if (!accountData.password) return isLoggedIn ? "" : "Mot de passe requis";
    return accountData.password.length < 8 ? "Au moins 8 caractères" : "";
  }, [accountData.password, touched.password, isLoggedIn]);

  const confirmPasswordError = useMemo(() => {
    if (!touched.confirmPassword) return "";
    // If logged in and password is empty, no need to match
    if (isLoggedIn && !accountData.password && !accountData.confirmPassword) return "";
    return accountData.password === accountData.confirmPassword ? "" : "Les mots de passe ne correspondent pas";
  }, [accountData.password, accountData.confirmPassword, touched.confirmPassword, isLoggedIn]);

  const businessNameError = useMemo(() => {
    if (!touched.businessName) return "";
    return businessData.businessName.trim() ? "" : "Nom d'entreprise requis";
  }, [businessData.businessName, touched.businessName]);

  const descriptionError = useMemo(() => {
    if (!touched.description) return "";
    return businessData.description.trim() ? "" : "Description requise";
  }, [businessData.description, touched.description]);

  const phoneError = useMemo(() => {
    if (!touched.contactPhone) return "";
    if (!businessData.contactPhone) return "Téléphone requis";

    // Format Cameroun: +237 6XXXXXXXX
    const phoneNumber = businessData.contactPhone.replace(/\s+/g, '');
    const valid = /^\+237[6][0-9]{8}$/.test(phoneNumber);
    return valid ? "" : "Le numéro doit commencer par 6 et contenir 9 chiffres";
  }, [businessData.contactPhone, touched.contactPhone]);

  const whatsappError = useMemo(() => {
    if (!touched.whatsappLink) return "";
    if (!businessData.whatsappLink) return "";

    // Format Cameroun: +237 6XXXXXXXX
    const phoneNumber = businessData.whatsappLink.replace(/\s+/g, '');
    const valid = /^\+237[6][0-9]{8}$/.test(phoneNumber);
    return valid ? "" : "Le numéro doit commencer par 6 et contenir 9 chiffres";
  }, [businessData.whatsappLink, touched.whatsappLink]);

  const handleNext = () => {
    if (activeTab === "account") {
      // Validation de l'onglet compte
      if (!accountData.email) {
        error("Veuillez renseigner votre email");
        return;
      }

      // If user is not logged in, password is required. If logged in, password is optional.
      if (!isLoggedIn) {
        if (!accountData.password || !accountData.confirmPassword) {
          error("Veuillez remplir tous les champs obligatoires");
          return;
        }
        if (accountData.password !== accountData.confirmPassword) {
          error("Les mots de passe ne correspondent pas");
          return;
        }
        if (accountData.password.length < 8) {
          error("Le mot de passe doit contenir au moins 8 caractères");
          return;
        }
      } else if (accountData.password || accountData.confirmPassword) {
        // If logged in but user provided a new password, validate it
        if (accountData.password !== accountData.confirmPassword) {
          error("Les mots de passe ne correspondent pas");
          return;
        }
        if (accountData.password.length < 8) {
          error("Le mot de passe doit contenir au moins 8 caractères");
          return;
        }
      }
      setActiveTab("business");
    } else if (activeTab === "business") {
      // Validation de l'onglet entreprise
      if (!businessData.businessName || !businessData.description || !businessData.contactPhone) {
        error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      setActiveTab("documents");
    }
  };

  const handleBack = () => {
    if (activeTab === "business") {
      setActiveTab("account");
    } else if (activeTab === "documents") {
      setActiveTab("business");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate justificative documents presence
    if (documentData.documents.length === 0) {
      error("Vous devez fournir vos documents justificatifs.");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.registerVendor({
        email: accountData.email,
        password: accountData.password,
        firstName: accountData.firstName || undefined,
        lastName: accountData.lastName || undefined,
        businessName: businessData.businessName,
        description: businessData.description,
        contactPhone: businessData.contactPhone,
        address: businessData.address || undefined,
        whatsappLink: businessData.whatsappLink || undefined,
        telegramLink: businessData.telegramLink || undefined,
        logo: documentData.logo || undefined,
        coverImage: documentData.coverImage || undefined,
        documents: documentData.documents.length > 0 ? documentData.documents : undefined,
      });

      if (response.success && response.token) {
        authStorage.setToken(response.token);
        setShowSuccessModal(true);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setShowSuccessModal(false);
    router.push("/");
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Modal
        isOpen={showSuccessModal}
        onClose={() => { }}
        title="🎉 Inscription réussie !"
      >
        <div className="space-y-4">
          <div className="bg-orange-100-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">Votre candidature a été envoyée avec succès !</h3>
                <p className="text-sm text-green-800">
                  Votre demande de création de boutique a été transmise à notre équipe d&apos;administration pour validation.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-100 -50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Notification WhatsApp</h3>
                <p className="text-sm text-blue-800 mb-2">
                  Vous recevrez une notification via WhatsApp à l&apos;adresse <strong>{businessData.whatsappLink || businessData.contactPhone}</strong> pour vous informer :
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside ml-2">
                  <li>Si votre candidature est approuvée</li>
                  <li>Si votre candidature nécessite des informations supplémentaires</li>
                  <li>Si votre candidature est refusée (avec les raisons)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleBackToHome} className="group">
              Retour à l&apos;accueil
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-0 md:px-4 py-8">
        <div className="w-full md:max-w-3xl">
          <div className="bg-white p-8 rounded-lg">
           

            {/* Titre */}
            <div className="text-center mb-8">
              <Link href="/" className="flex items-center justify-center gap-3 mb-4 group">
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
                Créez votre boutique en ligne et commencez à vendre dès aujourd&apos;hui
              </p>
            </div>

            {/* Formulaire avec tabs */}
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="account" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Compte</span>
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Entreprise</span>
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Documents</span>
                  </TabsTrigger>
                </TabsList>

                {/* Onglet Compte */}
                <TabsContent value="account" className="space-y-4">
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          placeholder="Jean"
                          value={accountData.firstName}
                          onChange={handleAccountChange}
                          disabled={loading}
                          className="transition-all focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          placeholder="Dupont"
                          value={accountData.lastName}
                          onChange={handleAccountChange}
                          disabled={loading}
                          className="transition-all focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemple@email.com"
                        value={accountData.email}
                        onChange={handleAccountChange}
                        required
                        disabled={loading}
                        className={`transition-all focus:ring-2 ${emailError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                      />
                      {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                        Mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={accountData.password}
                          onChange={handleAccountChange}
                          required={!isLoggedIn}
                          disabled={loading}
                          className={`transition-all focus:ring-2 pr-10 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                        />
                        {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
                        {isLoggedIn && (
                          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-3 text-yellow-900 text-sm flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-700" />
                            <div>
                              <strong>Attention :</strong> Vous êtes actuellement connecté. Si vous renseignez un nouveau mot de passe ici, l&apos;ancien mot de passe sera remplacé pour votre compte. Laissez ce champ vide pour conserver votre mot de passe actuel.
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={accountData.confirmPassword}
                          onChange={handleAccountChange}
                          required={!isLoggedIn}
                          disabled={loading}
                          className={`transition-all focus:ring-2 pr-10 ${confirmPasswordError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                        />
                        {confirmPasswordError && <p className="text-xs text-red-600 mt-1">{confirmPasswordError}</p>}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="button" onClick={handleNext} className="group" disabled={loading}>
                        Continuer
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Entreprise */}
                <TabsContent value="business" className="space-y-4">
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        Nom de l&apos;entreprise
                      </Label>
                      <Input
                        id="businessName"
                        placeholder="Ma Boutique"
                        value={businessData.businessName}
                        onChange={handleBusinessChange}
                        required
                        disabled={loading}
                        className={`transition-all focus:ring-2 ${businessNameError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                      />
                      {businessNameError && <p className="text-xs text-red-600 mt-1">{businessNameError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Décrivez votre entreprise et vos produits..."
                        value={businessData.description}
                        onChange={handleBusinessChange}
                        className="min-h-32 transition-all focus:ring-2 focus:ring-primary"
                        required
                        disabled={loading}
                      />
                      {descriptionError && <p className="text-xs text-red-600 mt-1">{descriptionError}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Téléphone</Label>
                        <Input
                          id="contactPhone"
                          placeholder="+237 691234567"
                          value={businessData.contactPhone}
                          onChange={handleBusinessChange}
                          required
                          disabled={loading}
                          className={`transition-all focus:ring-2 ${phoneError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                        />
                        {phoneError && <p className="text-xs text-red-600 mt-1">{phoneError}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input
                          id="address"
                          placeholder="Bonamoussadi, Douala Cameroun"
                          value={businessData.address}
                          onChange={handleBusinessChange}
                          disabled={loading}
                          className="transition-all focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="whatsappLink">WhatsApp (obligatoire)</Label>
                        <Input
                          id="whatsappLink"
                          placeholder="+237 691234567"
                          value={businessData.whatsappLink}
                          onChange={handleBusinessChange}
                          disabled={loading}
                          className={`transition-all focus:ring-2 ${whatsappError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
                        />
                        {whatsappError && <p className="text-xs text-red-600 mt-1">{whatsappError}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telegramLink">Telegram (optionnel)</Label>
                        <Input
                          id="telegramLink"
                          placeholder="@username"
                          value={businessData.telegramLink}
                          onChange={handleBusinessChange}
                          disabled={loading}
                          className="transition-all focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between pt-2">
                      <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                        Retour
                      </Button>
                      <Button type="button" onClick={handleNext} className="group" disabled={loading}>
                        Continuer
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Documents */}
                <TabsContent value="documents" className="space-y-4">
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="logo" className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-gray-500" />
                        Logo de l&apos;entreprise
                      </Label>
                      <UploadFile
                        endpoint="vendorLogo"
                        value={documentData.logo ? [{ name: "Logo", url: documentData.logo }] : []}
                        onChange={(files) => {
                          updateDocument('logo', files[0]?.url || '');
                        }}
                        onSuccess={success}
                        maxFiles={1}
                        accept={{ image: ["jpeg", "jpg", "png", "webp"] }}
                        placeholder="Cliquez ou glissez-déposez votre logo ici"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coverImage" className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        Image de couverture (optionnelle)
                      </Label>
                      <UploadFile
                        endpoint="vendorCover"
                        value={documentData.coverImage ? [{ name: "Couverture", url: documentData.coverImage }] : []}
                        onChange={(files) => {
                          updateDocument('coverImage', files[0]?.url || '');
                        }}
                        onSuccess={success}
                        maxFiles={1}
                        accept={{ image: ["jpeg", "jpg", "png", "webp"] }}
                        placeholder="Cliquez ou glissez-déposez votre image de couverture ici"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documents" className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        Documents justificatifs (obligatoire)
                      </Label>
                      <UploadFile
                        endpoint="vendorDocument"
                        value={documentData.documents.map(url => ({ name: "Document", url }))}
                        onChange={(files) => {
                          updateDocument('documents', files.map(f => f.url));
                        }}
                        onSuccess={success}
                        maxFiles={5}
                        accept={{
                          image: ["jpeg", "jpg", "png"],
                          application: ["pdf"]
                        }}
                        placeholder="Cliquez ou glissez-déposez vos documents ici (5 maximum)"
                      />
                      <p className="text-xs text-yellow-500 flex items-center gap-2">
                        <AlertCircleIcon/>
                        Veillez fournir de vrais et valables documents.
                      </p>
                      <p className="text-sm text-gray-600">
                        Documents requis : pièce d&apos;identité (recto-verso), justificatif d&apos;activité commerciale, etc.
                      </p>
                    </div>
                    <div className="flex items-start space-x-2 pt-4">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 rounded border-gray-300 focus:ring-primary"
                        required
                        disabled={loading}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                        J&apos;accepte les{" "}
                        <Link href="/terms" className="text-primary hover:underline font-medium">
                          conditions d&apos;utilisation
                        </Link>
                        {" "}et la{" "}
                        <Link href="/privacy" className="text-primary hover:underline font-medium">
                          politique de confidentialité
                        </Link>
                      </label>
                    </div>
                    <div className="flex justify-between pt-2">
                      <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                        Retour
                      </Button>
                      <Button type="submit" className="group" disabled={loading || documentData.documents.length === 0}>
                        {loading ? "Création..." : "Créer ma boutique"}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>

            {/* Liens footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  Déjà un compte?{" "}
                  <Link href="/auth/login" className="text-primary font-semibold hover:underline transition-colors">
                    Se connecter
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
