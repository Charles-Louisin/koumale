import type { Metadata } from "next";
import { FileText, Shield, AlertTriangle, Scale, Users, Gavel } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions d&apos;Utilisation | KOUMALE",
  description: "Consultez les conditions d&apos;utilisation de KOUMALE. Règles et conditions générales d&apos;utilisation de la plateforme.",
};

export default function TermsPage() {
  const termsSections = [
    {
      title: "Objet et acceptation des conditions",
      icon: <FileText className="w-6 h-6" />,
      content: [
        "Les présentes conditions générales d&apos;utilisation régissent l&apos;utilisation de la plateforme KOUMALE",
        "En accédant à notre site, vous acceptez d&apos;être lié par ces conditions",
        "KOUMALE est un intermédiaire technique facilitant les transactions entre acheteurs et vendeurs",
        "Nous ne sommes pas propriétaires des produits vendus sur notre plateforme"
      ]
    },
    {
      title: "Obligations des utilisateurs",
      icon: <Users className="w-6 h-6" />,
      content: [
        "Fournir des informations exactes et à jour lors de l&apos;inscription",
        "Respecter les droits de propriété intellectuelle d&apos;autrui",
        "Ne pas utiliser la plateforme à des fins illégales ou frauduleuses",
        "Maintenir la confidentialité de vos identifiants de connexion",
        "Respecter les autres utilisateurs et ne pas harceler ou intimider"
      ]
    },
    {
      title: "Obligations des vendeurs",
      icon: <Shield className="w-6 h-6" />,
      content: [
        "Décrire avec précision les produits proposés à la vente",
        "Respecter les délais de livraison annoncés",
        "Fournir des produits conformes à leur description",
        "Traiter les réclamations des acheteurs de bonne foi",
        "Respecter les lois et réglementations en vigueur"
      ]
    },
    {
      title: "Propriété intellectuelle",
      icon: <Scale className="w-6 h-6" />,
      content: [
        "KOUMALE détient tous les droits sur la plateforme et son contenu",
        "Les utilisateurs conservent les droits sur leur contenu personnel",
        "Il est interdit de copier, modifier ou distribuer notre contenu sans autorisation",
        "Les marques KOUMALE sont protégées par le droit des marques"
      ]
    }
  ];

  const prohibitedActivities = [
    "Vendre des produits illégaux ou contrefaits",
    "Publier des informations fausses ou trompeuses",
    "Harceler, intimider ou menacer d&apos;autres utilisateurs",
    "Utiliser des programmes automatisés pour accéder à la plateforme",
    "Contourner les mesures de sécurité de la plateforme",
    "Diffuser des virus ou autres programmes malveillants",
    "Violer les droits de propriété intellectuelle d&apos;autrui",
    "Utiliser la plateforme pour des activités frauduleuses"
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gavel className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Conditions d&apos;Utilisation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Découvrez les règles et conditions générales d&apos;utilisation de la plateforme KOUMALE.
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
              Acceptation des conditions
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-4">
                Bienvenue sur KOUMALE ! En utilisant notre plateforme, vous acceptez d&apos;être lié par les présentes conditions générales d&apos;utilisation.
                Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>
              <p className="mb-4">
                KOUMALE agit en tant qu&apos;intermédiaire technique entre acheteurs et vendeurs. Nous ne sommes pas propriétaires des produits vendus
                sur notre plateforme et n&apos;intervenons pas dans les transactions commerciales.
              </p>
              <p>
                Ces conditions s&apos;appliquent à tous les visiteurs, utilisateurs, vendeurs et acheteurs utilisant la plateforme KOUMALE.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Conditions générales
            </h2>
            <p className="text-xl text-gray-600">
              Comprendre vos droits et obligations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {termsSections.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-gray-600">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prohibited Activities */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-red-50 rounded-2xl p-8 md:p-12 border border-red-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-red-900">
                Activités interdites
              </h2>
            </div>
            <p className="text-red-700 mb-6">
              Les activités suivantes sont strictement interdites sur la plateforme KOUMALE :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prohibitedActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 text-red-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  {activity}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Liability and Termination */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Liability Limitations */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                Limitation de responsabilité
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  KOUMALE n&apos;est pas responsable des litiges entre acheteurs et vendeurs, dans les limites autorisées par la loi.
                </p>
                <p>
                  Nous ne garantissons pas l&apos;exactitude des informations fournies par les vendeurs ni la qualité des produits.
                </p>
                <p>
                  KOUMALE se réserve le droit de suspendre ou résilier votre compte en cas de violation des présentes conditions.
                </p>
              </div>
            </div>

            {/* Termination */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                Résiliation
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Vous pouvez résilier votre compte à tout moment en nous contactant.
                </p>
                <p>
                  KOUMALE peut résilier votre accès à la plateforme immédiatement en cas de violation grave des conditions.
                </p>
                <p>
                  En cas de résiliation, vos données seront supprimées conformément à notre politique de confidentialité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Governing Law */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Droit applicable et juridiction
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-4">
                Les présentes conditions sont régies par le droit ivoirien. Tout litige relatif à l&apos;utilisation de la plateforme
                KOUMALE sera soumis à la compétence exclusive des tribunaux ivoiriens.
              </p>
              <p className="mb-4">
                En cas de litige, nous encourageons d&apos;abord une résolution amiable. Si cela n&apos;est pas possible,
                le litige sera porté devant les juridictions compétentes.
              </p>
              <p>
                Ces conditions constituent l&apos;intégralité de l&apos;accord entre vous et KOUMALE concernant l&apos;utilisation de nos services.
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
              Questions sur les conditions ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Notre équipe juridique est là pour répondre à vos questions
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:clynlouisin@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Contacter le service juridique
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
