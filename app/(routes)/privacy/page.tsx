import type { Metadata } from "next";
import { Shield, Eye, Lock, Database, Users, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | KOUMALE",
  description: "Découvrez comment KOUMALE protège vos données personnelles. Politique de confidentialité et protection des données.",
};

export default function PrivacyPage() {
  const privacySections = [
    {
      title: "Collecte des données",
      icon: <Database className="w-6 h-6" />,
      content: [
        "Informations d'identification (nom, email, téléphone)",
        "Informations de livraison et facturation",
        "Historique des commandes et achats",
        "Données de navigation et préférences",
        "Informations de paiement (traitées de manière sécurisée)"
      ]
    },
    {
      title: "Utilisation des données",
      icon: <Eye className="w-6 h-6" />,
      content: [
        "Traitement et livraison des commandes",
        "Communication sur les commandes et services",
        "Amélioration de nos services et produits",
        "Personnalisation de l'expérience utilisateur",
        "Respect des obligations légales"
      ]
    },
    {
      title: "Protection des données",
      icon: <Shield className="w-6 h-6" />,
      content: [
        "Chiffrement SSL pour toutes les transmissions",
        "Stockage sécurisé des données sensibles",
        "Accès limité aux données personnelles",
        "Audits de sécurité réguliers",
        "Conformité aux normes de protection des données"
      ]
    },
    {
      title: "Partage des données",
      icon: <Users className="w-6 h-6" />,
      content: [
        "Avec les vendeurs pour le traitement des commandes",
        "Avec les prestataires de services de livraison",
        "Avec les partenaires de paiement sécurisés",
        "Uniquement avec votre consentement explicite",
        "Dans le respect des lois en vigueur"
      ]
    }
  ];

  const userRights = [
    {
      title: "Droit d'accès",
      description: "Vous pouvez demander l'accès à vos données personnelles à tout moment."
    },
    {
      title: "Droit de rectification",
      description: "Vous pouvez demander la correction de vos données inexactes ou incomplètes."
    },
    {
      title: "Droit à l'effacement",
      description: "Vous pouvez demander la suppression de vos données dans certaines conditions."
    },
    {
      title: "Droit à la portabilité",
      description: "Vous pouvez demander la transmission de vos données à un autre service."
    },
    {
      title: "Droit d'opposition",
      description: "Vous pouvez vous opposer au traitement de vos données pour des motifs légitimes."
    },
    {
      title: "Droit de retrait du consentement",
      description: "Vous pouvez retirer votre consentement au traitement de vos données à tout moment."
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Votre confidentialité est notre priorité. Découvrez comment nous protégeons vos données personnelles.
            </p>
            <p className="text-sm text-gray-500">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Engagement envers votre confidentialité
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-4">
                Chez KOUMALE, nous nous engageons à protéger la confidentialité et la sécurité de vos données personnelles.
                Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations.
              </p>
              <p className="mb-4">
                En utilisant nos services, vous acceptez les pratiques décrites dans cette politique.
                Nous nous conformons à toutes les réglementations applicables en matière de protection des données.
              </p>
              <p>
                Cette politique s&apos;applique à toutes les interactions avec notre plateforme, que ce soit via notre site web,
                nos applications mobiles ou tout autre service KOUMALE.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Practices */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Nos pratiques de traitement des données
            </h2>
            <p className="text-xl text-gray-600">
              Comment nous gérons vos données personnelles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {privacySections.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-gray-600">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Rights */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Vos droits concernant vos données
            </h2>
            <p className="text-xl text-gray-600">
              Vous avez le contrôle sur vos données personnelles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRights.map((right, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{right.title}</h3>
                <p className="text-gray-600 text-sm">{right.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Pour exercer vos droits ou obtenir plus d&apos;informations, contactez-nous à :
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg">
              <FileText className="w-5 h-5" />
              clynlouisin@gmail.com
            </div>
          </div>
        </div>
      </section>

      {/* Cookies and Tracking */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Cookies et technologies de suivi
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-4">
                Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience sur notre plateforme.
                Ces technologies nous aident à :
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Mémoriser vos préférences et paramètres</li>
                <li>Analyser l&apos;utilisation de notre site pour l&apos;améliorer</li>
                <li>Personnaliser le contenu et les recommandations</li>
                <li>Assurer la sécurité de votre compte</li>
                <li>Mesurer l&apos;efficacité de nos campagnes marketing</li>
              </ul>
              <p className="mb-4">
                Vous pouvez contrôler l&apos;utilisation des cookies via les paramètres de votre navigateur.
                Cependant, désactiver certains cookies peut affecter votre expérience utilisateur.
              </p>
              <p>
                Pour plus d&apos;informations sur notre utilisation des cookies, consultez notre
                <a href="/cookies" className="text-primary hover:underline"> Politique relative aux cookies</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Retention */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Conservation des données
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-4">
                Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées :
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Données de compte :</strong> Conservées tant que votre compte est actif</li>
                <li><strong>Historique des commandes :</strong> Conservé pendant 5 ans pour des raisons fiscales et légales</li>
                <li><strong>Données de navigation :</strong> Conservées pendant 13 mois maximum</li>
                <li><strong>Données de marketing :</strong> Conservées jusqu&apos;à votre désinscription</li>
              </ul>
              <p>
                À l&apos;expiration de ces périodes, vos données sont supprimées ou anonymisées de manière sécurisée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Questions sur votre confidentialité ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Notre équipe de protection des données est là pour vous aider
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:clynlouisin@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Contacter le DPO
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Support général
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
