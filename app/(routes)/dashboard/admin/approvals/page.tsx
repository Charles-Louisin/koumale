"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Modal } from "@/app/components/ui/modal";
import { Phone, Mail, DownloadCloud, ExternalLink, X, CheckCircle2, ShieldCheck, MessageCircle, Send, Eye } from "lucide-react";
import { adminApi } from "@/app/lib/api";
import Image from "next/image";
import { useToast } from "@/app/hooks/use-toast";

type PendingVendorFull = {
  _id: string;
  businessName: string;
  vendorSlug?: string;
  description?: string;
  contactPhone?: string;
  whatsappLink?: string;
  telegramLink?: string;
  address?: string;
  logo?: string;
  coverImage?: string;
  documents?: string[];
  user?: { _id: string; email?: string; firstName?: string; lastName?: string; createdAt?: string; status?: string };
};

export default function AdminApprovalsPage() {
  const [rows, setRows] = React.useState<PendingVendorFull[]>([]);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState<PendingVendorFull | null>(null);
  const [contactModal, setContactModal] = React.useState<{
    isOpen: boolean;
    action: 'approve' | 'reject';
    vendor: PendingVendorFull | null;
  }>({ isOpen: false, action: 'approve', vendor: null });
  const { success } = useToast();

  const load = React.useCallback((p: number) => {
    setLoading(true);
    adminApi
      .getPendingVendors(p, limit, q || undefined)
      .then((raw) => {
        const res = raw as unknown as { success: boolean; data?: PendingVendorFull[]; total?: number };
        if (res.success) {
          const arr: PendingVendorFull[] = Array.isArray(res.data) ? res.data : [] as PendingVendorFull[];
          // store full vendor objects so the admin can inspect all fields
          setRows(arr);
          setTotal(typeof res.total === "number" ? res.total : 0);
        }
      })
      .finally(() => setLoading(false));
  }, [limit, q]);

  React.useEffect(() => { load(page); }, [load, page]);

  const onApprove = (userId: string, vendorId: string) => {
    adminApi.approveVendor(userId).then(() => {
      setRows((p) => p.filter((r) => r._id !== vendorId));
      setTotal((t) => Math.max(0, t - 1));
      // fermer la modal si on approuve le vendeur en cours de visualisation
      setSelected((s) => (s && s._id === vendorId ? null : s));
      // Ouvrir la modal de contact
      const vendor = rows.find(r => r._id === vendorId);
      if (vendor) {
        setContactModal({ isOpen: true, action: 'approve', vendor });
      }
    });
  };

  const onReject = (userId: string, vendorId: string) => {
    adminApi.rejectVendor(userId).then(() => {
      setRows((p) => p.filter((r) => r._id !== vendorId));
      setTotal((t) => Math.max(0, t - 1));
      // fermer la modal si on rejette le vendeur en cours de visualisation
      setSelected((s) => (s && s._id === vendorId ? null : s));
      // Ouvrir la modal de contact
      const vendor = rows.find(r => r._id === vendorId);
      if (vendor) {
        setContactModal({ isOpen: true, action: 'reject', vendor });
      }
      success("Demande rejetée, La boutique a été rejetée avec succès.");
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Approbations</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Gérez les demandes d&apos;approbation des vendeurs et validez leur inscription
          </p>
        </div>

        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-t-lg border-b border-orange-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-3">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  Vendeurs en attente
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg mt-2">
                  Approuvez les vendeurs pour activer leur boutique en ligne
                </CardDescription>
              </div>
              <div className="flex gap-3 w-full lg:w-auto">
                <input
                  className="border-2 border-gray-200 rounded-xl h-12 px-4 w-full lg:w-80 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="Rechercher par entreprise / email"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-orange-600" />
                </div>
                <p className="text-2xl font-semibold text-gray-900 mb-2">Aucune demande en attente</p>
                <p className="text-gray-600 text-lg">Toutes les demandes ont été traitées</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {rows.map((v) => (
                  <Card key={v._id} className="group w-fit h-fit hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-orange-200 bg-white">
                    <CardContent className="p-2">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {v.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={v.logo} width={100} height={100} alt={v.businessName} className="w-12 h-12 rounded-xl object-contain border-2 border-gray-100" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-xs font-medium">Logo</div>
                            )}
                            <div className="flex flex-col">
                             <p className="text-[9px] md:text-lg text-gray-600">{(v.user?.firstName || '') + ' ' + (v.user?.lastName || '')}</p>
                              <h3 className="font-bold text-[10px] md:text-lg text-gray-900">{v.businessName}</h3>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 break-all mb-2">{v.user?.email}</p>
                          <div className="flex items-center text-[10px] md:text-xs text-gray-500">
                            <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                            Inscrit le {new Date(v.user?.createdAt || '').toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex  md:flex-row gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(v)}
                          className="w-[50%] text-[12px] flex items-center justify-center gap-1 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                          Détails
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApprove(v.user?._id || '', v._id)}
                          className="w-[50%] text-[12px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 transition-all"
                        >
                          Approuver
                        </Button>
                      </div>
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReject(v.user?._id || '', v._id)}
                          className="w-full text-[13px] border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 transition-all"
                        >
                          Rejeter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {rows.length > 0 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page {page} sur {totalPages} — {total} résultat(s)
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal pour afficher les détails du vendeur */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center overflow-hidden justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-auto max-h-[90vh] overflow-scroll grid grid-cols-1 md:grid-cols-3">
            {/* LEFT: media gallery */}
            <div className="md:col-span-2 bg-gray-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {selected.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.logo} alt={selected.businessName} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">Logo</div>
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold">{selected.businessName}</h2>
                    <p className="text-sm text-muted-foreground">{selected.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button aria-label="Fermer" onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                {selected.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.coverImage} width={100} height={100} alt="Couverture" className="w-full h-72 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="w-full h-72 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">Aucune image de couverture</div>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2">Galerie & Documents</h3>
                <div className="grid grid-cols-3 gap-3">
                  {/* show documents images first */}
                  {selected.documents && selected.documents.length > 0 ? (
                    selected.documents.map((doc, i) => {
                      const lower = doc.split('?')[0].toLowerCase();
                      const isImage = !!lower.match(/\.(jpg|jpeg|png|webp|gif|svg)$/);
                      const isPdf = !!lower.match(/\.(pdf)$/);

                      if (isImage) {
                        return (
                          <div key={i} className="rounded-lg overflow-hidden border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={doc} alt={`doc-${i}`} className="w-full h-28 object-cover" />
                          </div>
                        );
                      }

                      if (isPdf) {
                        return (
                          <div key={i} className="rounded-lg border border-gray-100 p-3 flex flex-col justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v16"/><path d="M8 10h8"/></svg>
                              </div>
                              <div className="text-sm break-all">{doc.split('/').pop()}</div>
                            </div>
                            <div className="mt-3 flex items-center justify-end gap-2">
                              <a href={doc} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1"><ExternalLink className="w-4 h-4" />Ouvrir</a>
                              <a href={doc} download className="text-sm text-muted-foreground flex items-center gap-1"><DownloadCloud className="w-4 h-4" />Télécharger</a>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={i} className="rounded-lg border border-gray-100 p-3 flex items-center justify-between">
                          <div className="text-sm break-all">{doc.split('/').pop()}</div>
                          <a href={doc} download className="text-sm text-muted-foreground">Télécharger</a>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-sm text-muted-foreground">Aucun document fourni</div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: details & actions */}
            <div className="md:col-span-1 p-6 border-l border-gray-100 overflow-y-auto">
              <div className="flex flex-col h-full">
                <div>
                  <h4 className="text-lg font-semibold">Informations</h4>
                  <div className="mt-3 text-sm text-muted-foreground space-y-2">
                    <div><strong>Nom :</strong> <span className="ml-2">{(selected.user?.firstName || '') + ' ' + (selected.user?.lastName || '')}</span></div>
                    <div><strong>Slug :</strong> <span className="ml-2">{selected.vendorSlug || '—'}</span></div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-lg font-semibold">Contact</h4>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                          <Phone className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Téléphone</div>
                          <div className="text-sm text-muted-foreground">{selected.contactPhone ? <a href={`tel:${selected.contactPhone.replace(/\s+/g, '')}`} className="text-primary">{selected.contactPhone}</a> : '—'}</div>
                        </div>
                      </div>
                      {/* <a href={selected.contactPhone ? `tel:${selected.contactPhone.replace(/\s+/g, '')}` : '#'} className="text-sm text-muted-foreground">Appeler</a> */}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center">
                          {/* WhatsApp SVG */}
                          <Image
                            src={"https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"}
                            alt={"WhatsApp"}
                            width={40}
                            height={40}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">WhatsApp</div>
                          <div className="text-sm text-muted-foreground">{selected.whatsappLink ? <a href={`https://wa.me/${selected.whatsappLink.replace(/\D/g, '').replace(/^0+/, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary">{selected.whatsappLink}</a> : '—'}</div>
                        </div>
                      </div>
                      {/* <a href={selected.whatsappLink ? `https://wa.me/${selected.whatsappLink.replace(/\D/g, '').replace(/^0+/, '')}` : '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground">Ouvrir</a> */}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                          {/* Telegram SVG */}
                          <Image
                            src={"https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"}
                            alt={"Telegram"}
                            width={40}
                            height={40}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Telegram</div>
                          <div className="text-sm text-muted-foreground">{selected.telegramLink ? <a href={`https://t.me/${selected.telegramLink.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary">{selected.telegramLink}</a> : '—'}</div>
                        </div>
                      </div>
                      {/* <a href={selected.telegramLink ? `https://t.me/${selected.telegramLink.replace(/^@/, '')}` : '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground">Ouvrir</a> */}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                          <Mail className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Email</div>
                          <div className="text-sm text-muted-foreground">{selected.user?.email ? (<a href={`mailto:${selected.user.email}`} className="text-primary">{selected.user.email}</a>) : '—'}</div>
                        </div>
                      </div>
                      {/* <a href={selected.user?.email ? `mailto:${selected.user.email}` : '#'} className="text-sm text-muted-foreground">Envoyer</a> */}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => setSelected(null)} className="flex-1">Fermer</Button>
                      <Button onClick={() => onApprove(selected.user?._id || '', selected._id)} className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"><CheckCircle2 className="w-4 h-4 mr-2" />Approuver</Button>
                    </div>
                    <Button onClick={() => onReject(selected.user?._id || '', selected._id)} className="w-full border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600">Rejeter la demande</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de contact */}
      {contactModal.isOpen && contactModal.vendor && (
        <Modal
          isOpen={contactModal.isOpen}
          onClose={() => setContactModal({ isOpen: false, action: 'approve', vendor: null })}
          title={`${contactModal.action === 'approve' ? 'Approbation' : 'Rejet'} - ${contactModal.vendor.businessName}`}
        >
          {(() => {
            const vendor = contactModal.vendor!;
            return (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {contactModal.action === 'approve' ? 'Demande approuvée !' : 'Demande rejetée !'}
                  </h3>
                  <p className="text-gray-600">
                    Informez {vendor.user?.firstName || 'le vendeur'} de la décision via :
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {vendor.whatsappLink && (
                    <Button
                      onClick={() => {
                        const message = contactModal.action === 'approve'
                          ? `Bonjour ${vendor.user?.firstName || ''},\n\nFélicitations ! Votre demande d'inscription sur KOUMALE a été approuvée.\n\nVotre boutique "${vendor.businessName}" est maintenant active et visible sur notre plateforme.\n\nVous pouvez commencer à ajouter vos produits et gérer votre boutique.\n\nCordialement,\nL'équipe KOUMALE`
                          : `Bonjour ${vendor.user?.firstName || ''},\n\nNous regrettons de vous informer que votre demande d'inscription sur KOUMALE a été rejetée.\n\nPour plus d'informations sur les raisons du rejet ou pour soumettre une nouvelle demande, veuillez nous contacter.\n\nCordialement,\nL'équipe KOUMALE`;

                        const phoneNumber = vendor.whatsappLink!.replace(/\D/g, '').replace(/^0+/, '');
                        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                        setContactModal({ isOpen: false, action: 'approve', vendor: null });
                      }}
                      className="flex items-center gap-3 p-4 h-auto bg-green-50 hover:bg-green-100 border border-green-200 text-green-700"
                      variant="outline"
                    >
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        alt="WhatsApp"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <span>WhatsApp</span>
                    </Button>
                  )}

                  {vendor.telegramLink && (
                    <Button
                      onClick={() => {
                        const message = contactModal.action === 'approve'
                          ? `Bonjour ${vendor.user?.firstName || ''},\n\nFélicitations ! Votre demande d'inscription sur KOUMALE a été approuvée.\n\nVotre boutique "${vendor.businessName}" est maintenant active et visible sur notre plateforme.\n\nVous pouvez commencer à ajouter vos produits et gérer votre boutique.\n\nCordialement,\nL'équipe KOUMALE`
                          : `Bonjour ${vendor.user?.firstName || ''},\n\nNous regrettons de vous informer que votre demande d'inscription sur KOUMALE a été rejetée.\n\nPour plus d'informations sur les raisons du rejet ou pour soumettre une nouvelle demande, veuillez nous contacter.\n\nCordialement,\nL'équipe KOUMALE`;

                        const username = vendor.telegramLink!.replace(/^@/, '');
                        const telegramUrl = `https://t.me/${username}?text=${encodeURIComponent(message)}`;
                        window.open(telegramUrl, '_blank');
                        setContactModal({ isOpen: false, action: 'approve', vendor: null });
                      }}
                      className="flex items-center gap-3 p-4 h-auto bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700"
                      variant="outline"
                    >
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
                        alt="Telegram"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <span>Telegram</span>
                    </Button>
                  )}

                  {vendor.user?.email && (
                    <Button
                      onClick={() => {
                        const subject = contactModal.action === 'approve'
                          ? 'Approbation de votre demande - Buy\'s Me Ways'
                          : 'Rejet de votre demande - Buy\'s Me Ways';

                        const body = contactModal.action === 'approve'
                          ? `Bonjour ${vendor.user!.firstName || ''},\n\nFélicitations ! Votre demande d'inscription sur KOUMALE a été approuvée.\n\nVotre boutique "${vendor.businessName}" est maintenant active et visible sur notre plateforme.\n\nVous pouvez commencer à ajouter vos produits et gérer votre boutique.\n\nCordialement,\nL'équipe KOUMALE`
                          : `Bonjour ${vendor.user!.firstName || ''},\n\nNous regrettons de vous informer que votre demande d'inscription sur KOUMALE a été rejetée.\n\nPour plus d'informations sur les raisons du rejet ou pour soumettre une nouvelle demande, veuillez nous contacter.\n\nCordialement,\nL'équipe KOUMALE`;

                        const emailUrl = `mailto:${vendor.user!.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(emailUrl, '_blank');
                        setContactModal({ isOpen: false, action: 'approve', vendor: null });
                      }}
                      className="flex items-center gap-3 p-4 h-auto bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700"
                      variant="outline"
                    >
                      <Mail className="w-6 h-6" />
                      <span>Email</span>
                    </Button>
                  )}

                  {(vendor.whatsappLink || vendor.telegramLink) && vendor.user?.email && (
                    <Button
                      onClick={() => {
                        const message = contactModal.action === 'approve'
                          ? `Bonjour ${vendor.user?.firstName || ''},\n\nFélicitations ! Votre demande d'inscription sur KOUMALE a été approuvée.\n\nVotre boutique "${vendor.businessName}" est maintenant active et visible sur notre plateforme.\n\nVous pouvez commencer à ajouter vos produits et gérer votre boutique.\n\nCordialement,\nL'équipe KOUMALE`
                          : `Bonjour ${vendor.user?.firstName || ''},\n\nNous regrettons de vous informer que votre demande d'inscription sur KOUMALE a été rejetée.\n\nPour plus d'informations sur les raisons du rejet ou pour soumettre une nouvelle demande, veuillez nous contacter.\n\nCordialement,\nL'équipe KOUMALEs`;

                        // Ouvrir WhatsApp
                        if (vendor.whatsappLink) {
                          const phoneNumber = vendor.whatsappLink!.replace(/\D/g, '').replace(/^0+/, '');
                          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }

                        // Ouvrir Telegram
                        if (vendor.telegramLink) {
                          const username = vendor.telegramLink!.replace(/^@/, '');
                          const telegramUrl = `https://t.me/${username}?text=${encodeURIComponent(message)}`;
                          window.open(telegramUrl, '_blank');
                        }

                        // Ouvrir Email
                        if (vendor.user?.email) {
                          const subject = contactModal.action === 'approve'
                            ? 'Approbation de votre demande - KOUMALE'
                            : 'Rejet de votre demande - KOUMALE';

                          const emailUrl = `mailto:${vendor.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
                          window.open(emailUrl, '_blank');
                        }

                        setContactModal({ isOpen: false, action: 'approve', vendor: null });
                      }}
                      className="flex items-center gap-3 p-4 h-auto bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 text-orange-700"
                      variant="outline"
                    >
                      <Send className="w-6 h-6" />
                      <span>Tous les moyens</span>
                    </Button>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setContactModal({ isOpen: false, action: 'approve', vendor: null })}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
