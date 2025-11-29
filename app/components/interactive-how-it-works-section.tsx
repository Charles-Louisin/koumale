"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, ShoppingBag, Shield, CheckCircle, ArrowRight, ArrowLeft, UserPlus, Search, MessageSquare, CreditCard, Truck, Star, Sparkles } from "lucide-react";
import Link from "next/link";

const howItWorksSteps = [
    {
        id: 1,
        icon: UserPlus,
        title: "Créer un compte",
        gradient: "from-blue-500 to-cyan-500",
        content: {
            description: "Inscrivez-vous gratuitement en quelques clics",
            details: [
                "Remplissez vos informations personnelles",
                "Vérifiez votre email pour activer votre compte",
                "Choisissez si vous êtes vendeur ou acheteur"
            ],
            tip: "L'inscription est 100% gratuite et ne prend que 2 minutes !"
        }
    },
    {
        id: 2,
        icon: Store,
        title: "Pour les vendeurs : Créez votre boutique",
        gradient: "from-green-500 to-emerald-500",
        content: {
            description: "Configurez votre espace de vente professionnel",
            details: [
                "Ajoutez les informations de votre entreprise",
                "Téléchargez votre logo et photos de couverture",
                "Définissez vos catégories de produits"
            ],
            tip: "Votre boutique sera visible par des milliers de clients potentiels"
        }
    },
    {
        id: 3,
        icon: ShoppingBag,
        title: "Ajoutez vos produits",
        gradient: "from-purple-500 to-pink-500",
        content: {
            description: "Présentez vos produits avec des photos de qualité",
            details: [
                "Prenez des photos claires de vos produits",
                "Rédigez des descriptions détaillées",
                "Fixez vos prix compétitifs"
            ],
            tip: "Plus vos photos sont belles, plus vous vendez !"
        }
    },
    {
        id: 4,
        icon: Search,
        title: "Pour les acheteurs : Trouvez ce que vous cherchez",
        gradient: "from-orange-500 to-red-500",
        content: {
            description: "Utilisez notre moteur de recherche intelligent",
            details: [
                "Recherchez par mots-clés ou catégories",
                "Filtrez par prix, localisation, vendeur",
                "Comparez les offres de plusieurs vendeurs"
            ],
            tip: "Tous les produits camerounais sont réunis au même endroit"
        }
    },
    {
        id: 5,
        icon: MessageSquare,
        title: "Contactez les vendeurs",
        gradient: "from-indigo-500 to-purple-500",
        content: {
            description: "Discutez directement avec les vendeurs",
            details: [
                "Utilisez WhatsApp, Telegram ou notre chat intégré",
                "Posez vos questions sur les produits",
                "Négociez les prix et conditions de livraison"
            ],
            tip: "La communication directe garantit une meilleure expérience"
        }
    },
    {
        id: 6,
        icon: CreditCard,
        title: "Effectuez vos achats",
        gradient: "from-teal-500 to-green-500",
        content: {
            description: "Payez en toute sécurité selon vos préférences",
            details: [
                "Choisissez votre mode de paiement préféré",
                "Paiement à la livraison disponible",
                "Transactions sécurisées et protégées"
            ],
            tip: "Plusieurs options de paiement pour votre confort"
        }
    },
    {
        id: 7,
        icon: Truck,
        title: "Livraison & Réception",
        gradient: "from-yellow-500 to-orange-500",
        content: {
            description: "Recevez vos produits dans les meilleurs délais",
            details: [
                "Convenez des modalités de livraison avec le vendeur",
                "Suivez votre commande en temps réel",
                "Recevez vos produits en parfait état"
            ],
            tip: "La livraison est organisée directement avec le vendeur"
        }
    },
    {
        id: 8,
        icon: Star,
        title: "Évaluez & Recommandez",
        gradient: "from-pink-500 to-rose-500",
        content: {
            description: "Partagez votre expérience et aidez les autres",
            details: [
                "Laissez un avis sur votre achat",
                "Notez la qualité du service",
                "Recommandez les meilleurs vendeurs"
            ],
            tip: "Vos avis aident la communauté à faire les meilleurs choix"
        }
    }
];

export default function InteractiveHowItWorksSection() {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [showOverview, setShowOverview] = React.useState(false);

    const step = howItWorksSteps[currentStep];
    const Icon = step.icon;
    const isLastStep = currentStep === howItWorksSteps.length - 1;

    const nextStep = () => {
        if (currentStep < howItWorksSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            setShowOverview(false);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setShowOverview(false);
        }
    };

    const goToStep = (stepIndex: number) => {
        setCurrentStep(stepIndex);
        setShowOverview(false);
    };

    const toggleOverview = () => {
        setShowOverview(!showOverview);
    };

    return (
        <section className="py-12 md:py-20 px-4 md:px-6 bg-white relative overflow-hidden">
            <div className="absolute inset-0 mesh-gradient pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
                        Comment ça <span className="gradient-text">marche</span> ?
                    </h2>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto">
                        Découvrez en 8 étapes simples comment utiliser KOUMALE pour vos achats et ventes
                    </p>
                    <button
                        onClick={toggleOverview}
                        className="mt-4 px-4 py-2 bg-white text-primary rounded-full text-sm font-medium hover:bg-primary/5 transition-colors border border-primary/20"
                    >
                        {showOverview ? "Masquer l'aperçu" : "Voir tous les étapes"}
                    </button>
                </motion.div>

                {/* Overview Carousel */}
                <AnimatePresence>
                    {showOverview && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4 }}
                            className="mb-8 "
                        >
                            <div className="relative">
                                <div className="overflow-x-auto scrollbar-hide">
                                    <motion.div
                                        className="flex gap-3 pb-2"
                                        style={{ minWidth: 'min-content' }}
                                    >
                                        {howItWorksSteps.map((step, index) => {
                                            const StepIcon = step.icon;
                                            return (
                                                <motion.button
                                                    key={step.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    onClick={() => goToStep(index)}
                                                    className={`flex-shrink-0 w-55 p-4 rounded-2xl border-2 transition-all hover:scale-105 ${currentStep === index
                                                            ? `bg-gradient-to-br ${step.gradient} text-white border-transparent shadow-lg`
                                                            : "bg-white text-gray-700 border-gray-200 hover:border-primary"
                                                        }`}
                                                >
                                                    <StepIcon className={`w-8 h-8 mx-auto mb-2 ${currentStep === index ? "text-white" : "text-primary"}`} />
                                                    <div className="text-xs font-medium text-center leading-tight">
                                                        Étape {step.id}
                                                    </div>
                                                    <div className="text-sm font-semibold text-center mt-1 leading-tight">
                                                        {step.title.split(':')[0]}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                            Étape {currentStep + 1} sur {howItWorksSteps.length}
                        </span>
                        <span className="text-sm text-gray-500">
                            {Math.round(((currentStep + 1) / howItWorksSteps.length) * 100)}%
                        </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${step.gradient}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / howItWorksSteps.length) * 100}%` }}
                            transition={{ duration: 0.6 }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(event, info) => {
                            if (showOverview) return; // Disable swipe when overview is shown
                            const swipeThreshold = 50;
                            if (info.offset.x > swipeThreshold) {
                                // Swipe right - go to previous
                                prevStep();
                            } else if (info.offset.x < -swipeThreshold) {
                                // Swipe left - go to next
                                nextStep();
                            }
                        }}
                        className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 cursor-grab active:cursor-grabbing"
                    >
                        {/* Step Header */}
                        <div className="text-center mb-8">
                            <div className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-3xl flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                                <Icon className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-sm text-gray-500 mb-2">Étape {step.id}</div>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                                {step.title}
                            </h3>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                {step.content.description}
                            </p>
                        </div>

                        {/* Step Details */}
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    Ce que vous devez faire :
                                </h4>
                                <ul className="space-y-3">
                                    {step.content.details.map((detail, idx) => (
                                        <motion.li
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-start gap-3 text-gray-700"
                                        >
                                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                <span className="text-white text-xs font-bold">{idx + 1}</span>
                                            </div>
                                            <span className="text-sm leading-relaxed">{detail}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Conseil utile
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {step.content.tip.replace("💡", "")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Précédent
                            </button>

                            {/*  */}

                            <button
                                onClick={nextStep}
                                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${step.gradient} text-white rounded-full text-sm font-medium hover:shadow-lg transition-all`}
                            >
                                {isLastStep ? "Terminé" : "Suivant"}
                                {!isLastStep && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* CTA for last step */}
                        {isLastStep && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-8 pt-6 border-t border-gray-200 text-center"
                            >
                                <h4 className="text-xl font-bold text-gray-800 mb-3">
                                    Prêt à commencer votre aventure KOUMALE ?
                                </h4>
                                <p className="text-gray-600 mb-6">
                                    Rejoignez notre communauté et commencez dès aujourd&apos;hui !
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Link
                                        href="/auth/register"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        Créer mon compte
                                    </Link>
                                    <Link
                                        href="/products"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-blue-300 transition-all hover:-translate-y-1"
                                    >
                                        <Search className="w-5 h-5" />
                                        Explorer les produits
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
