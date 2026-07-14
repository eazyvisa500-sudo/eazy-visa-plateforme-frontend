import { useState } from 'react';
import { ArrowRight, Plane, Shield, Users, BarChart3, CreditCard, Lock, Smartphone, Headphones, Globe, Check, ChevronDown, ChevronUp, Menu, X, Hotel, Sparkles, Star, Quote, TrendingUp } from 'lucide-react';

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: Sparkles, title: 'IA Intelligente', desc: 'Algorithmes avancés pour optimiser chaque réservation' },
    { icon: Plane, title: 'Réservation intelligente', desc: 'IA pour trouver les meilleurs vols et hôtels' },
    { icon: Shield, title: 'Conformité garantie', desc: 'Politiques de voyage automatisées' },
    { icon: Users, title: 'Collaboration d\'équipe', desc: 'Gestion simplifiée des déplacements' },
    { icon: BarChart3, title: 'Analytics avancées', desc: 'Tableaux de bord en temps réel' },
    { icon: CreditCard, title: 'Paiements simplifiés', desc: 'Facturation centralisée' },
    { icon: Lock, title: 'Sécurité maximale', desc: 'Données protégées et chiffrées' },
    { icon: Smartphone, title: 'App mobile', desc: 'Gestion depuis n\'importe où' },
    { icon: Headphones, title: 'Support 24/7', desc: 'Assistance disponible en permanence' },
    { icon: Globe, title: 'Couverture mondiale', desc: 'Vols et hôtels partout dans le monde' },
  ];

  const plans = [
    {
      name: 'Starter',
      price: 'Gratuit',
      features: ['Jusqu\'à 10 employés', 'Réservation de vols', 'Réservation d\'hôtels', 'Support email', 'Rapports basiques'],
      popular: false,
    },
    {
      name: 'Business',
      price: '49€/mois',
      features: ['Jusqu\'à 50 employés', 'Tout de Starter', 'Politiques de voyage', 'Analytics avancés', 'Support prioritaire', 'App mobile', 'Intégrations API'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      features: ['Employés illimités', 'Tout de Business', 'SSO & SAML', 'Dédier account manager', 'SLA garanti', 'Formation personnalisée', 'Développement sur mesure'],
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: 'Marie Dupont',
      role: 'Directrice des voyages, TechCorp',
      content: 'EasyVisa nous a permis de réduire nos coûts de voyage de 35% en seulement 6 mois. L\'IA est incroyablement efficace.',
      rating: 5,
    },
    {
      name: 'Jean Martin',
      role: 'CEO, StartupXYZ',
      content: 'La simplicité d\'utilisation et le support 24/7 font d\'EasyVisa notre partenaire de confiance pour tous nos déplacements.',
      rating: 5,
    },
    {
      name: 'Sophie Bernard',
      role: 'Responsable RH, GlobalInc',
      content: 'Les politiques de voyage automatisées nous font gagner des heures chaque semaine. Je recommande vivement !',
      rating: 5,
    },
  ];

  const steps = [
    { icon: Users, title: 'Inscription gratuite', desc: 'Créez votre compte en moins de 2 minutes' },
    { icon: Shield, title: 'Configuration', desc: 'Définissez vos politiques et préférences' },
    { icon: Plane, title: 'Première réservation', desc: 'Réservez votre premier vol ou hôtel' },
    { icon: TrendingUp, title: 'Optimisation', desc: 'L\'IA optimise vos futures réservations' },
  ];

  const faqs = [
    {
      q: 'Combien de temps faut-il pour configurer la plateforme ?',
      a: 'La configuration initiale prend moins de 30 minutes. Vous pouvez commencer à réserver dès que votre compte est activé.',
    },
    {
      q: 'Puis-je intégrer EasyVisa avec mes outils existants ?',
      a: 'Oui, nous proposons des intégrations avec les principaux outils d\'entreprise (ERP, CRM, outils comptables) via notre API.',
    },
    {
      q: 'Comment sont calculées les économies ?',
      a: 'Nos algorithmes comparent les prix en temps réel et appliquent vos politiques de voyage pour optimiser chaque réservation.',
    },
    {
      q: 'Le support client est-il vraiment disponible 24/7 ?',
      a: 'Oui, notre équipe d\'assistance est disponible 24h/24 et 7j/7 par chat, email et téléphone pour les plans Business et Enterprise.',
    },
    {
      q: 'Puis-je annuler mon abonnement à tout moment ?',
      a: 'Oui, vous pouvez annuler votre abonnement à tout moment sans frais cachés. Aucun engagement de durée.',
    },
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#A11B1B] flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#565556]">EasyVisa</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm text-[#565556] hover:text-[#A11B1B] transition-colors">Services</a>
              <a href="#features" className="text-sm text-[#565556] hover:text-[#A11B1B] transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-sm text-[#565556] hover:text-[#A11B1B] transition-colors">Tarifs</a>
              <a href="#faq" className="text-sm text-[#565556] hover:text-[#A11B1B] transition-colors">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <a href="/connexion" className="text-sm text-[#565556] hover:text-[#A11B1B] transition-colors">Connexion</a>
              <a href="/connexion" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors">
                Commencer <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" className="block text-sm text-[#565556] hover:text-[#A11B1B]">Services</a>
              <a href="#features" className="block text-sm text-[#565556] hover:text-[#A11B1B]">Fonctionnalités</a>
              <a href="#pricing" className="block text-sm text-[#565556] hover:text-[#A11B1B]">Tarifs</a>
              <a href="#faq" className="block text-sm text-[#565556] hover:text-[#A11B1B]">FAQ</a>
              <hr className="border-gray-100" />
              <a href="/connexion" className="block text-sm text-[#565556] hover:text-[#A11B1B]">Connexion</a>
              <a href="/connexion" className="block text-center px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium">Commencer</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#A11B1B] rounded-full filter blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A11B1B]/10 text-[#A11B1B] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Propulsé par l'IA</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#565556] mb-6 leading-tight">
            Révolutionnez vos{' '}
            <span className="text-[#A11B1B] relative">
              voyages d'affaires
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M0 4Q50 0 100 4T200 4" stroke="#A11B1B" strokeWidth="3" fill="none" opacity="0.3" />
              </svg>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[#A5A6A5] mb-8 max-w-2xl mx-auto leading-relaxed">
            Optimisez vos coûts avec notre IA de voyages d'affaires. Réservation intelligente, conformité garantie et analytics en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a href="/connexion" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#A11B1B] text-white font-medium hover:bg-[#8a1616] hover:shadow-xl hover:shadow-[#A11B1B]/30 transition-all w-full sm:w-auto justify-center">
              Commencer gratuitement <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[#e5e5e5] text-[#565556] font-medium hover:border-[#A11B1B] hover:bg-[#A11B1B]/5 transition-all w-full sm:w-auto justify-center">
              En savoir plus
            </a>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-[#A5A6A5]">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Essai gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Annulation à tout moment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#565556] mb-4">Nos Services Premium</h2>
            <p className="text-[#A5A6A5] max-w-2xl mx-auto">Une solution complète pour gérer tous vos déplacements professionnels</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Plane className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#565556] mb-3">Réservation de Vols</h3>
              <p className="text-[#A5A6A5]">Comparez et réservez des vols auprès de centaines de compagnies aériennes avec notre IA.</p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Hotel className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#565556] mb-3">Réservation d'Hôtels</h3>
              <p className="text-[#A5A6A5]">Accédez à des tarifs négociés et réservez des hôtels conformes à vos politiques.</p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#565556] mb-3">Analytics & Rapports</h3>
              <p className="text-[#A5A6A5]">Suivez vos dépenses de voyage en temps réel avec des tableaux de bord détaillés.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#565556] mb-4">Fonctionnalités puissantes</h2>
            <p className="text-[#A5A6A5] max-w-2xl mx-auto">Tout ce dont vous avez besoin pour gérer vos voyages d'affaires</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl bg-white border border-gray-200 hover:border-[#A11B1B] hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#A11B1B]/10 flex items-center justify-center mb-4 group-hover:bg-[#A11B1B] transition-colors">
                  <feature.icon className="w-6 h-6 text-[#A11B1B] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-[#565556] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#A5A6A5]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#565556] mb-4">Comment ça marche ?</h2>
            <p className="text-[#A5A6A5] max-w-2xl mx-auto">Commencez en 4 étapes simples</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A11B1B] to-[#8a1616] flex items-center justify-center mb-4 shadow-lg">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#A11B1B] text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-[#565556] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#A5A6A5]">{step.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#A11B1B]/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#565556] mb-4">Ce que disent nos clients</h2>
            <p className="text-[#A5A6A5] max-w-2xl mx-auto">Des entreprises de toutes tailles nous font confiance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-8 rounded-2xl bg-white border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-[#A11B1B]/20 mb-4" />
                <p className="text-[#565556] mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-[#565556]">{testimonial.name}</p>
                  <p className="text-sm text-[#A5A6A5]">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#565556] mb-4">Tarifs transparents</h2>
            <p className="text-[#A5A6A5] max-w-2xl mx-auto">Choisissez le plan adapté à vos besoins</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border-2 ${
                  plan.popular
                    ? 'border-[#A11B1B] bg-gradient-to-b from-[#A11B1B]/5 to-white relative'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#A11B1B] text-white text-xs font-medium">
                    Populaire
                  </div>
                )}
                <h3 className="text-2xl font-bold text-[#565556] mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-[#A11B1B] mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3 text-sm text-[#565556]">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/connexion"
                  className={`block w-full py-3 rounded-xl text-center font-medium transition-colors ${
                    plan.popular
                      ? 'bg-[#A11B1B] text-white hover:bg-[#8a1616]'
                      : 'bg-gray-100 text-[#565556] hover:bg-gray-200'
                  }`}
                >
                  Choisir ce plan
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#565556] mb-4">Questions fréquentes</h2>
            <p className="text-[#A5A6A5]">Tout ce que vous devez savoir sur EasyVisa</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-[#565556]">{faq.q}</span>
                  {activeFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[#A5A6A5]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#A5A6A5]" />
                  )}
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 text-sm text-[#A5A6A5] border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#A11B1B] to-[#8a1616]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à révolutionner vos voyages d'affaires ?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Rejoignez des centaines d'entreprises qui font confiance à EasyVisa
          </p>
          <a
            href="/connexion"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#A11B1B] font-medium hover:bg-gray-100 transition-colors"
          >
            Demander une démo <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#A11B1B] flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">EasyVisa</span>
              </div>
              <p className="text-gray-400 text-sm">Leader africain du voyage d'affaires</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © 2026 EasyVisa. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
