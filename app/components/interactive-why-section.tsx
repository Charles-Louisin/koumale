"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, ShoppingBag, Shield, CheckCircle, ArrowRight, ArrowLeft, ThumbsUp, MessageCircle, Sparkles, PartyPopper, RefreshCw } from "lucide-react";
import Link from "next/link";

const features = [
  {
    id: 1,
    icon: Store,
    title: "Pour les Vendeurs",
    gradient: "bg-orange-500",
    content: {
      intro: "Vous êtes un petit commerçant ou vous vendez vos produits depuis chez vous ?",
      problem: "Vous en avez marre de poster sur WhatsApp et Facebook sans vraie visibilité ?",
      solution: "KOUMALE est fait pour vous ! Créez votre boutique en ligne GRATUITEMENT.",
      benefits: [
        {
          title: "Pas besoin de local physique",
          desc: "Vendez depuis chez vous, présentez vos vêtements même si vous ne les portez pas"
        },
        {
          title: "Inscription 100% gratuite et sécurisée",
          desc: "Nous vérifions tous les vendeurs pour garantir la confiance"
        },
        {
          title: "Visibilité maximale",
          desc: "Vos produits sont vus par des milliers de clients potentiels"
        },
        {
          title: "Gestion simple",
          desc: "Interface facile pour ajouter vos produits avec photos et descriptions"
        }
      ],
      comparison: {
        title: "Pourquoi KOUMALE plutôt que WhatsApp/Facebook ?",
        points: [
          "✅ Vos produits restent visibles (pas de stories qui disparaissent)",
          "✅ Les clients vous trouvent facilement par recherche",
          "✅ Vous gérez tout depuis un seul endroit",
          "✅ Suivi professionnel de vos ventes",
          "✅ Crédibilité auprès des acheteurs"
        ]
      },
      cta: "Créer ma boutique gratuitement"
    }
  },
  {
    id: 2,
    icon: ShoppingBag,
    title: "Pour les Acheteurs",
    gradient: "bg-purple-500",
    content: {
      intro: "Vous cherchez un produit spécifique au Cameroun ?",
      problem: "Difficile de comparer les prix et de trouver le bon vendeur ?",
      solution: "KOUMALE rassemble TOUS les vendeurs en un seul endroit !",
      benefits: [
        {
          title: "Tous les produits camerounais",
          desc: "Vêtements, électronique, cuisine, accessoires... Tout au même endroit"
        },
        {
          title: "Comparez facilement les prix",
          desc: "Voyez plusieurs vendeurs pour le même produit et choisissez le meilleur prix"
        },
        {
          title: "Contact direct avec les vendeurs",
          desc: "Discutez via WhatsApp, Telegram ou autre pour négocier"
        },
        {
          title: "Livraison organisée",
          desc: "Convenez des modalités de livraison directement avec le vendeur"
        }
      ],
      comparison: {
        title: "Votre avantage ?",
        points: [
          "✅ Gain de temps : tout est centralisé",
          "✅ Meilleurs prix grâce à la comparaison",
          "✅ Vendeurs vérifiés et fiables",
          "✅ Large choix de produits",
          "✅ Négociation possible avec chaque vendeur"
        ]
      },
      cta: "Commencer mes achats"
    }
  },
  {
    id: 3,
    icon: Shield,
    title: "Sécurité & Confiance",
    gradient: "bg-emerald-500",
    content: {
      intro: "Votre sécurité est notre priorité absolue",
      problem: "Peur de tomber sur des vendeurs malhonnêtes ?",
      solution: "Nous vérifions TOUS les vendeurs avant leur inscription !",
      benefits: [
        {
          title: "Vendeurs 100% vérifiés",
          desc: "Processus de vérification strict pour éliminer les malfaiteurs"
        },
        {
          title: "Plateforme entièrement gratuite",
          desc: "Aucun frais caché, ni pour les vendeurs ni pour les acheteurs"
        },
        {
          title: "Suivi sécurisé",
          desc: "Toutes les adhésions sont suivies et contrôlées"
        },
        {
          title: "Support réactif",
          desc: "Notre équipe est là pour vous aider en cas de problème"
        }
      ],
      comparison: {
        title: "Notre engagement",
        points: [
          "✅ Zéro tolérance pour la fraude",
          "✅ Vérification d'identité obligatoire",
          "✅ Système de signalement efficace",
          "✅ Modération active",
          "✅ Protection des données personnelles"
        ]
      },
      cta: "En savoir plus"
    }
  }
];

export default function InteractiveWhySection() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [currentFeature, setCurrentFeature] = React.useState(0);
  const [showEndQuestion, setShowEndQuestion] = React.useState(false);
  const [hasUnderstood, setHasUnderstood] = React.useState<boolean | null>(null);
  const [windowWidth, setWindowWidth] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const feature = features[currentFeature];
  const Icon = feature.icon;
  const isLastStep = currentStep === 4;

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setShowEndQuestion(false);
      setHasUnderstood(null);
    } else {
      setShowEndQuestion(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowEndQuestion(false);
      setHasUnderstood(null);
    }
  };

  const nextFeature = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1);
      setCurrentStep(0);
      setShowEndQuestion(false);
      setHasUnderstood(null);
    }
  };

  const prevFeature = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
      setCurrentStep(0);
      setShowEndQuestion(false);
      setHasUnderstood(null);
    }
  };

  const restartCourse = () => {
    setCurrentStep(0);
    setShowEndQuestion(false);
    setHasUnderstood(null);
  };

  const handleUnderstand = (understood: boolean) => {
    setHasUnderstood(understood);
    if (!understood) {
      setTimeout(() => restartCourse(), 1500);
    }
  };

  return (
    <section className={`${windowWidth <= 440 ? 'py-8 md:py-16 px-3 md:px-4' : 'py-12 md:py-20 px-4 md:px-6'} bg-white relative overflow-hidden`}>
      <div className="absolute inset-0 mesh-gradient pointer-events-none"></div>

      <div className={`${windowWidth <= 440 ? 'max-w-3xl' : 'max-w-4xl'} mx-auto relative z-10`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`${windowWidth <= 440 ? 'text-center mb-6' : 'text-center mb-8'}`}
        >
          <h2 className={`${windowWidth <= 440 ? 'text-xl md:text-3xl' : 'text-3xl md:text-4xl'} font-display font-bold mb-3`}>
            Découvrez <span className="gradient-text">KOUMALE</span>
          </h2>
          <p className={`${windowWidth <= 440 ? 'text-sm' : 'text-base'} text-gray-600`}>
            Prenez quelques minutes pour comprendre comment nous pouvons vous aider
          </p>
        </motion.div>

        {/* Feature Navigation */}
        <div className="flex justify-center gap-3 mb-8">
          {features.map((f, idx) => {
            const FeatureIcon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setCurrentFeature(idx);
                  setCurrentStep(0);
                  setShowEndQuestion(false);
                  setHasUnderstood(null);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  currentFeature === idx
                    ? `bg-linear-to-r ${f.gradient} text-white shadow-lg scale-105`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <FeatureIcon className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">{f.title}</span>
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Étape {currentStep + 1} sur 5
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / 5) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-linear-to-r ${feature.gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / 5) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentFeature}-${currentStep}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(event, info) => {
              const swipeThreshold = 50;
              if (info.offset.x > swipeThreshold) {
                // Swipe right - go to previous
                if (currentStep > 0) {
                  prevStep();
                } else if (currentFeature > 0) {
                  prevFeature();
                }
              } else if (info.offset.x < -swipeThreshold) {
                // Swipe left - go to next
                if (currentStep < 4) {
                  nextStep();
                } else if (currentFeature < features.length - 1) {
                  nextFeature();
                }
              }
            }}
            className={`bg-white rounded-2xl ${windowWidth <= 440 ? 'p-4 md:p-6' : 'p-6 md:p-8'} shadow-xl border border-gray-100 cursor-grab active:cursor-grabbing`}
          >
            {/* Icon */}
            <div className={`${windowWidth <= 440 ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} bg-linear-to-br ${feature.gradient} rounded-xl flex items-center justify-center mx-auto`}>
              <Icon className={`${windowWidth <= 440 ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
            </div>

            {/* Step Content */}
            <div className="space-y-4">
              {currentStep === 0 && (
                <div className="text-center space-y-3">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                    {feature.content.intro}
                  </h3>
                  <p className="text-base text-gray-600">
                    {feature.content.problem}
                  </p>
                </div>
              )}

              {currentStep === 1 && (
                <div className="text-center space-y-3">
                  <h3 className="text-xl md:text-2xl font-bold gradient-text">
                    {feature.content.solution}
                  </h3>
                  <p className="text-base text-gray-600">
                    Laissez-nous vous expliquer comment...
                  </p>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                    Vos avantages
                  </h3>
                  <div className="grid gap-3">
                    {feature.content.benefits.map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm text-gray-800 mb-0.5">{benefit.title}</h4>
                          <p className="text-xs text-gray-600">{benefit.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                    {feature.content.comparison.title}
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                    <ul className="space-y-2">
                      {feature.content.comparison.points.map((point, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="text-gray-700 text-sm flex items-start gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{point.replace("✅ ", "")}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 4 && !showEndQuestion && (
                <div className="text-center space-y-4">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                    Prêt à commencer ?
                  </h3>
                  <p className="text-base text-gray-600">
                    Rejoignez des centaines d&apos;utilisateurs satisfaits
                  </p>
                  <Link
                    href={currentFeature === 0 ? "/auth/register" : "/products"}
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}
                  >
                    {feature.content.cta}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>

            {/* End of Course Question */}
            {isLastStep && showEndQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                {hasUnderstood === null && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700 font-medium">
                      Avez-vous bien compris ce cours ?
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleUnderstand(true)}
                        className="px-6 py-2.5 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors text-sm"
                      >
                        Oui, j&apos;ai compris !
                      </button>
                      <button
                        onClick={() => handleUnderstand(false)}
                        className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 transition-colors text-sm"
                      >
                        Non, pas vraiment
                      </button>
                    </div>
                  </div>
                )}

                {hasUnderstood === true && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <p className="text-green-600 font-semibold mb-3 flex items-center justify-center gap-2">
                      Excellent ! <PartyPopper className="w-5 h-5" />
                    </p>
                    <p className="text-gray-700 font-medium mb-4">
                      Voulez-vous passer au cours suivant ?
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={nextFeature}
                        disabled={currentFeature === features.length - 1}
                        className="px-6 py-2.5 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Oui, suivant
                      </button>
                      <button
                        onClick={restartCourse}
                        className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 transition-colors text-sm"
                      >
                        Recommencer
                      </button>
                    </div>
                  </motion.div>
                )}

                {hasUnderstood === false && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <p className="text-orange-600 font-semibold flex items-center justify-center gap-2">
                      Pas de souci ! On recommence depuis le début <RefreshCw className="w-5 h-5" />
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={currentStep === 0 ? prevFeature : prevStep}
            disabled={currentFeature === 0 && currentStep === 0}
            className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Précédent</span>
            <span className="sm:hidden">Préc.</span>
          </button>

          <button
            onClick={isLastStep ? () => setShowEndQuestion(true) : nextStep}
            className={`flex items-center gap-2 px-5 py-2 bg-gradient-to-r ${feature.gradient} text-white rounded-full text-sm font-medium hover:shadow-lg transition-all`}
          >
            <span className="hidden sm:inline">Suivant</span>
            <span className="sm:hidden">Suiv.</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
