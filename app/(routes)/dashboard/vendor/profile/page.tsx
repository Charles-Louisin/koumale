"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { UploadFile } from "@/app/components/ui/upload-file";
import { authApi, vendorsApi, Vendor } from "@/app/lib/api";
import { useToast } from "@/app/hooks/use-toast";

import { Loader2, MapPin, Phone, MessageCircle, Send, Mail, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function VendorProfilePage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    contactPhone: "",
    whatsappLink: "",
    telegramLink: "",
    address: "",
    latitude: 0,
    longitude: 0,
    logo: "",
    coverImage: "",
  });
  const [originalFormData, setOriginalFormData] = useState(formData);
  const [hasOldImage, setHasOldImage] = useState({ logo: false, coverImage: false });
  const [showOldImageWarning, setShowOldImageWarning] = useState({ logo: false, coverImage: false });

  const { success, error } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const userRes = await authApi.getMe();
        if (userRes.success && userRes.user?.vendor) {
          const vendorRes = await vendorsApi.getBySlug(userRes.user.vendor.vendorSlug);
          if (vendorRes.success && vendorRes.data) {
            setVendor(vendorRes.data);
            const newFormData = {
              description: vendorRes.data.description || "",
              contactPhone: vendorRes.data.contactPhone || "",
              whatsappLink: vendorRes.data.whatsappLink || "",
              telegramLink: vendorRes.data.telegramLink || "",
              address: vendorRes.data.address || "",
              latitude: vendorRes.data.latitude || 0,
              longitude: vendorRes.data.longitude || 0,
              logo: vendorRes.data.logo || "",
              coverImage: vendorRes.data.coverImage || "",
            };
            setFormData(newFormData);
            setOriginalFormData(newFormData);
            setHasOldImage({
              logo: !!vendorRes.data.logo,
              coverImage: !!vendorRes.data.coverImage,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching vendor:", err);
        error("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !map) {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places'],
      });

      (loader as any).load().then(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newMap = new google.maps.Map(mapRef.current!, {
          center: { lat: formData.latitude || 3.8667, lng: formData.longitude || 11.5167 }, // Yaoundé, Cameroon
          zoom: 12,
        });

        const newMarker = new google.maps.Marker({
          position: { lat: formData.latitude || 3.8667, lng: formData.longitude || 11.5167 },
          map: newMap,
          draggable: true,
        });

        const newGeocoder = new google.maps.Geocoder();

        setMap(newMap);
        setMarker(newMarker);
        setGeocoder(newGeocoder);

        // Handle marker drag
        newMarker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

            // Reverse geocode to get address
            newGeocoder.geocode({ location: event.latLng }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                setFormData(prev => ({ ...prev, address: results[0].formatted_address }));
              }
            });
          }
        });

        // Handle map click
        newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
            newMarker.setPosition(event.latLng);

            // Reverse geocode to get address
            newGeocoder.geocode({ location: event.latLng }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                setFormData(prev => ({ ...prev, address: results[0].formatted_address }));
              }
            });
          }
        });
      });
    }
  }, [map, formData.latitude, formData.longitude]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // If address field changed, geocode it
    if (field === "address" && value && geocoder) {
      geocoder.geocode({ address: value }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

          if (marker) {
            marker.setPosition(location);
          }
          if (map) {
            map.setCenter(location);
            map.setZoom(15);
          }
        }
      });
    }
  };

  const handleFileUpload = (field: string, url: string) => {
    setFormData(prev => ({ ...prev, [field]: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    setSaving(true);
    try {
      const updateData = {
        description: formData.description,
        contactPhone: formData.contactPhone,
        whatsappLink: formData.whatsappLink,
        telegramLink: formData.telegramLink,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        logo: formData.logo,
        coverImage: formData.coverImage,
      };

      const res = await vendorsApi.updateProfile(updateData);
      if (res.success) {
        setVendor(res.data || null);
        success("Profil mis à jour avec succès");
      } else {
        throw new Error("Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      error("Impossible de mettre à jour le profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Profil non trouvé</h2>
        <p className="text-gray-600">Impossible de charger votre profil vendeur.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mon Profil</h1>
        <p className="text-gray-600">Gérez les informations de votre boutique</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images du profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="logo">Logo de la boutique</Label>
              <UploadFile
                endpoint="vendorLogo"
                value={formData.logo ? [{ name: "logo", url: formData.logo }] : []}
                onChange={(files) => {
                  if (files.length > 0) {
                    handleFileUpload("logo", files[0].url);
                  } else {
                    handleFileUpload("logo", "");
                  }
                }}
                onSuccess={(message) => success(message)}
                accept={{ image: ["png", "jpg", "jpeg", "gif", "webp"] }}
                placeholder="Télécharger un logo"
              />
            </div>
            <p className="flex items-center text-red-400 gap-1"><AlertCircle className="text-red-500" /> Une fois l&apos;upload termine, Supprimer l&apos;ancienne photo de profil avant de Sauvegarder</p>
            <div>
              <Label htmlFor="coverImage">Image de couverture</Label>
              <UploadFile
                endpoint="vendorCover"
                value={formData.coverImage ? [{ name: "cover", url: formData.coverImage }] : []}
                onChange={(files) => {
                  if (files.length > 0) {
                    handleFileUpload("coverImage", files[0].url);
                  } else {
                    handleFileUpload("coverImage", "");
                  }
                }}
                onSuccess={(message) => success(message)}
                accept={{ image: ["png", "jpg", "jpeg", "gif", "webp"] }}
                placeholder="Télécharger une image de couverture"
              />
            </div>
            <p className="flex items-center text-red-400 gap-1"><AlertCircle className="text-red-500" /> Une fois l&apos;upload termine, Supprimer l&apos;ancienne photo de couverture avant de Sauvegarder</p>
          </CardContent>
        </Card>

        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="businessName">Nom de la boutique</Label>
              <Input
                id="businessName"
                value={vendor.businessName}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">Le nom de la boutique ne peut pas être modifié</p>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez votre boutique..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  value={vendor.user?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">L&apos;email ne peut pas être modifié</p>
            </div>
            <div>
              <Label htmlFor="contactPhone">Téléphone</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="+237 XX XX XX XX XX"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="whatsappLink">WhatsApp</Label>
              <div className="flex items-center gap-2">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  width={16}
                  height={16}
                  className="text-gray-400"
                />
                <Input
                  id="whatsappLink"
                  value={formData.whatsappLink}
                  onChange={(e) => handleInputChange("whatsappLink", e.target.value)}
                  placeholder="(ex: +237698234579)"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="telegramLink">Telegram</Label>
              <div className="flex items-center gap-2">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                  alt="Telegram"
                  width={16}
                  height={16}
                  className="text-gray-400"
                />
                <Input
                  id="telegramLink"
                  value={formData.telegramLink}
                  onChange={(e) => handleInputChange("telegramLink", e.target.value)}
                  placeholder="(ex: @mon_boutique)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localisation */}
        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="address">Adresse</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Entrez votre adresse"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Utilisez Google Maps pour trouver votre adresse exacte
              </p>
            </div>
            <div ref={mapRef} className="h-64 bg-gray-100 rounded-lg"></div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => setFormData(originalFormData)}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sauvegarder
          </Button>
        </div>
      </form>
    </div>
  );
}
