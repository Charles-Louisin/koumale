import type { Metadata } from "next";
import { RefreshCw, Clock, Package, CreditCard, Truck, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de Retour | KOUMALE",
  description: "Découvrez notre politique de retour et de remboursement. Retours faciles et sécurisés sur KOUMALE.",
};

export default function ReturnsPage() {
  const returnSteps = [
    {
      step: 1,
      title: "Préparez votre retour",
      description: "Vérifiez que le produit est éligible au retour et préparez le colis.",
      icon: <Package className="w-8 h-8" />,
      details: [
        "Le produit doit être dans son état d'origine",
        "Avec tous les accessoires et emballages",
        "Dans les 30 jours suivant la réception"
      ]
    },
    {
      step: 2,
      title: "Demandez votre retour",
      description: "Connectez-vous à votre compte et créez une demande de retour.",
      icon: <RefreshCw className="w-8 h-8" />,
      details: [
        "Accédez à vos commandes",
        "Sélectionnez le produit à retourner",
        "Choisissez le motif du retour"
      ]
    },
    {
      step: 3,
      title: "Expédiez le colis",
      description: "Utilisez l'étiquette de retour prépayée pour envoyer le produit.",
      icon: <Truck className="w-8 h-8" />,
      details: [
        "Étiquette de retour fournie",
        "Frais de port offerts",
        "Suivi du colis disponible"
      ]
    },
    {
      step: 4,
      title: "Recevez votre remboursement",
      description: "Une fois le produit reçu et vérifié, votre remboursement est traité.",
      icon: <CreditCard className="w-8 h-8" />,
      details: [
        "Remboursement sous 5-7 jours ouvrés",
        "Par le même moyen de paiement",
        "Confirmation par email"
      ]
    }
  ];

  const returnPolicies = [
    {
      title: "Délai de retour",
      description: "Vous disposez de 30 jours à compter de la réception de votre commande pour effectuer un retour.",
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: "État du produit",
      description: "Le produit doit être retourné dans son état d'origine, non utilisé, avec tous ses accessoires.",
      icon: <Package className="w-6 h-6" />
    },
    {
      title: "Frais de retour",
      description: "Les frais de retour sont offerts pour les retours acceptés. Une étiquette prépayée vous sera fournie.",
      icon: <Truck className="w-6 h-6" />
    },
    {
      title: "Remboursement",
      description: "Le remboursement est effectué par le même moyen de paiement utilisé lors de l'achat.",
      icon: <CreditCard className="w-6 h-6" />
    }
  ];

  const nonReturnableItems = [
    "Produits personnalisés ou sur mesure",
    "Articles d'hygiène et de soin personnel ouverts",
    "Logiciels et cartes cadeaux",
    "Produits périssables",
    "Articles endommagés par l'usage"
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Politique de Retour
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Retours faciles et sécurisés. Nous nous engageons à rendre votre expérience d&apos;achat agréable.
            </p>
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Comment effectuer un retour ?
            </h2>
            <p className="text-xl text-gray-600">
              Suivez ces 4 étapes simples pour retourner votre produit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {returnSteps.map((step, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 mt-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, dIndex) => (
                    <li key={dIndex} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Return Policies */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Conditions de retour
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez les règles applicables à nos retours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {returnPolicies.map((policy, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {policy.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{policy.title}</h3>
                    <p className="text-gray-600">{policy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Non-returnable items */}
          <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
            <h3 className="text-xl font-semibold text-red-900 mb-4">
              Articles non retournables
            </h3>
            <p className="text-red-700 mb-6">
              Les articles suivants ne peuvent pas faire l&apos;objet d&apos;un retour :
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nonReturnableItems.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-red-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Trouvez rapidement des réponses à vos questions sur les retours
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Combien de temps ai-je pour retourner un produit ?
              </h3>
              <p className="text-gray-600">
                Vous disposez de 30 jours à compter de la date de réception de votre commande pour effectuer un retour.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Les frais de retour sont-ils offerts ?
              </h3>
              <p className="text-gray-600">
                Oui, les frais de retour sont offerts pour tous les retours acceptés. Nous vous fournissons une étiquette de retour prépayée.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quand serai-je remboursé ?
              </h3>
              <p className="text-gray-600">
                Une fois votre retour reçu et vérifié, le remboursement est traité sous 5 à 7 jours ouvrés. Vous recevrez une confirmation par email.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Puis-je échanger un produit au lieu de le retourner ?
              </h3>
              <p className="text-gray-600">
                Actuellement, nous proposons uniquement les retours avec remboursement. Les échanges ne sont pas disponibles pour le moment.
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
              Besoin d&apos;aide ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Notre équipe est là pour vous accompagner dans votre processus de retour
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Nous contacter
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Consulter l&apos;aide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
