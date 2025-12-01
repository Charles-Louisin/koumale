import type { Metadata } from "next";
import { HelpCircle, Mail, MessageCircle, Phone, Search } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Centre d'Aide | KOUMALE",
  description: "Trouvez des réponses à vos questions sur KOUMALE. Guide d'utilisation, FAQ et support client.",
};

export default function HelpPage() {
  const faqCategories = [
    {
      title: "Commandes et Paiements",
      icon: <HelpCircle className="w-6 h-6" />,
      questions: [
        "Comment passer une commande ?",
        "Quels sont les moyens de paiement acceptés ?",
        "Comment suivre ma commande ?",
        "Puis-je modifier ou annuler ma commande ?"
      ]
    },
    {
      title: "Livraison",
      icon: <HelpCircle className="w-6 h-6" />,
      questions: [
        "Quels sont les délais de livraison ?",
        "Quels sont les frais de livraison ?",
        "Puis-je changer l'adresse de livraison ?",
        "Que faire si mon colis est endommagé ?"
      ]
    },
    {
      title: "Retours et Remboursements",
      icon: <HelpCircle className="w-6 h-6" />,
      questions: [
        "Quelle est la politique de retour ?",
        "Comment retourner un produit ?",
        "Quand serai-je remboursé ?",
        "Quels produits ne peuvent pas être retournés ?"
      ]
    },
    {
      title: "Vendeurs",
      icon: <HelpCircle className="w-6 h-6" />,
      questions: [
        "Comment devenir vendeur sur KOUMALE ?",
        "Quelles sont les commissions ?",
        "Comment gérer mes produits ?",
        "Comment contacter mes clients ?"
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Centre d&apos;Aide
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Trouvez rapidement des réponses à vos questions. Notre équipe est là pour vous aider.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans l'aide..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-12">
            Questions Fréquentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                </div>

                <ul className="space-y-3">
                  {category.questions.map((question, qIndex) => (
                    <li key={qIndex}>
                      <button className="w-full text-left text-gray-700 hover:text-primary transition-colors py-2">
                        {question}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Besoin d&apos;aide supplémentaire ?
            </h2>
            <p className="text-xl text-gray-600">
              Notre équipe de support est là pour vous aider
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-4">support@koumale.com</p>
              <Link
                href="mailto:clynlouisin@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Envoyer un email
              </Link>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Whatsapp</h3>
              <p className="text-gray-600 mb-4">+237 682601458</p>
              {/* <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Démarrer le chat
              </button> */}
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Téléphone</h3>
              <p className="text-gray-600 mb-4">+237 682601458</p>
              {/* <Link
                href="tel:+225XXXXXXXXX"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Appeler maintenant
              </Link> */}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-12">
            Ressources Supplémentaires
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/contact" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nous contacter</h3>
              <p className="text-gray-600">Formulaire de contact et informations</p>
            </Link>

            <Link href="/returns" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Retours</h3>
              <p className="text-gray-600">Politique de retour et remboursement</p>
            </Link>

            <Link href="/privacy" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confidentialité</h3>
              <p className="text-gray-600">Protection de vos données personnelles</p>
            </Link>

            <Link href="/terms" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Conditions</h3>
              <p className="text-gray-600">Conditions d&apos;utilisation du service</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
