import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Plane, Shield, Users, BarChart3, CreditCard, Lock, Smartphone, Headphones, Globe, Check, ChevronDown, ChevronUp, Menu, X, Hotel, Sparkles, Star, Quote, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

const carouselImages = [
  { src: '/logo%20site/apple-splash-2778-1284.jpg', alt: 'EasyVisa - Expérience voyage' },
  { src: '/logo%20site/apple-splash-1136-640.jpg', alt: 'EasyVisa - Billeterie' },
  { src: '/EVBilleterie.jpg', alt: 'Billeterie EasyVisa' },
  { src: '/EVServices3.jpg', alt: 'Services premium' },
  { src: '/image1.jpg', alt: 'Voyage d\'affaires' },
];

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

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
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-sm'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <img
                src="/logo%20site/apple-icon-180.png"
                alt="EasyVisa"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className={`text-xl font-bold transition-colors ${isScrolled ? 'text-gray-100' : 'text-gray-100'}`}>
                EasyVisa
              </span>
            </a>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className={`text-sm transition-colors ${isScrolled ? 'text-gray-100 hover:text-[#ff4d4d]' : 'text-gray-100/80 hover:text-gray-100'}`}>Services</a>
              <a href="#features" className={`text-sm transition-colors ${isScrolled ? 'text-gray-100 hover:text-[#ff4d4d]' : 'text-gray-100/80 hover:text-gray-100'}`}>Fonctionnalités</a>
              <a href="#pricing" className={`text-sm transition-colors ${isScrolled ? 'text-gray-100 hover:text-[#ff4d4d]' : 'text-gray-100/80 hover:text-gray-100'}`}>Tarifs</a>
              <a href="#faq" className={`text-sm transition-colors ${isScrolled ? 'text-gray-100 hover:text-[#ff4d4d]' : 'text-gray-100/80 hover:text-gray-100'}`}>FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <a href="/connexion" className={`text-sm transition-colors ${isScrolled ? 'text-gray-100 hover:text-[#ff4d4d]' : 'text-gray-100/80 hover:text-gray-100'}`}>Connexion</a>
              <a href="/connexion" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A11B1B] text-gray-100 text-sm font-medium hover:bg-[#8a1616] transition-colors">
                Commencer <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`md:hidden p-2 ${isScrolled ? 'text-gray-100' : 'text-gray-100'}`}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" className="block text-sm text-gray-100 hover:text-[#ff4d4d]">Services</a>
              <a href="#features" className="block text-sm text-gray-100 hover:text-[#ff4d4d]">Fonctionnalités</a>
              <a href="#pricing" className="block text-sm text-gray-100 hover:text-[#ff4d4d]">Tarifs</a>
              <a href="#faq" className="block text-sm text-gray-100 hover:text-[#ff4d4d]">FAQ</a>
              <hr className="border-gray-700" />
              <a href="/connexion" className="block text-sm text-gray-100 hover:text-[#ff4d4d]">Connexion</a>
              <a href="/connexion" className="block text-center px-4 py-2 rounded-lg bg-[#A11B1B] text-gray-100 text-sm font-medium">Commencer</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Carousel Section */}
      <section className="relative h-[600px] sm:h-[650px] lg:h-[700px] overflow-hidden bg-gray-900">
        {/* Carousel Images */}
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A11B1B]/20 backdrop-blur-sm text-gray-100 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Propulsé par l'IA</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-100 mb-6 leading-tight">
                Révolutionnez vos{' '}
                <span className="text-[#ff4d4d] relative">
                  voyages d'affaires
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                    <path d="M0 4Q50 0 100 4T200 4" stroke="#A11B1B" strokeWidth="3" fill="none" opacity="0.3" />
                  </svg>
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-100/80 mb-8 leading-relaxed">
                Optimisez vos coûts avec notre IA de voyages d'affaires. Réservation intelligente, conformité garantie et analytics en temps réel.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <a href="/connexion" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#A11B1B] text-gray-100 font-medium hover:bg-[#8a1616] hover:shadow-xl hover:shadow-[#A11B1B]/30 transition-all w-full sm:w-auto justify-center">
                  Commencer gratuitement <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-gray-100 font-medium hover:bg-white/10 hover:border-white/50 transition-all w-full sm:w-auto justify-center">
                  En savoir plus
                </a>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-sm text-gray-100/70">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Essai gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Sans carte bancaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Annulation à tout moment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-sm text-gray-100 hover:bg-white/20 transition-colors"
          aria-label="Image précédente"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-sm text-gray-100 hover:bg-white/20 transition-colors"
          aria-label="Image suivante"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-8 h-2 bg-[#A11B1B]'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#A11B1B]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-100">500+</p>
              <p className="text-gray-100/70 text-sm">Entreprises</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-100">50k+</p>
              <p className="text-gray-100/70 text-sm">Voyages</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-100">35%</p>
              <p className="text-gray-100/70 text-sm">Économies moyennes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-100">24/7</p>
              <p className="text-gray-100/70 text-sm">Support client</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <img src="/logo%20site/apple-icon-180.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A11B1B]/20 text-[#ff4d4d] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" /> Nos services
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">Nos Services Premium</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Une solution complète pour gérer tous vos déplacements professionnels</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-800 border border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-[#A11B1B] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-[#A11B1B]/25">
                <Plane className="w-7 h-7 text-gray-100" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Réservation de Vols</h3>
              <p className="text-gray-400">Comparez et réservez des vols auprès de centaines de compagnies aériennes avec notre IA.</p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-800 border border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-[#A11B1B] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-[#A11B1B]/25">
                <Hotel className="w-7 h-7 text-gray-100" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Réservation d'Hôtels</h3>
              <p className="text-gray-400">Accédez à des tarifs négociés et réservez des hôtels conformes à vos politiques.</p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-800 border border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-[#A11B1B] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-[#A11B1B]/25">
                <BarChart3 className="w-7 h-7 text-gray-100" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Analytics & Rapports</h3>
              <p className="text-gray-400">Suivez vos dépenses de voyage en temps réel avec des tableaux de bord détaillés.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">Fonctionnalités puissantes</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Tout ce dont vous avez besoin pour gérer vos voyages d'affaires</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl bg-gray-800 border border-gray-700 hover:border-[#A11B1B] hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#A11B1B]/20 flex items-center justify-center mb-4 group-hover:bg-[#A11B1B] transition-colors">
                  <feature.icon className="w-6 h-6 text-[#ff4d4d] group-hover:text-gray-100 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">Comment ça marche ?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Commencez en 4 étapes simples</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A11B1B] to-[#8a1616] flex items-center justify-center mb-4 shadow-lg">
                    <step.icon className="w-8 h-8 text-gray-100" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#A11B1B] text-gray-100 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.desc}</p>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 opacity-5 -translate-x-1/2 translate-y-1/2">
          <img src="/logo%20site/apple-icon-180.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A11B1B]/20 text-[#ff4d4d] text-sm font-medium mb-4">
              <Star className="w-4 h-4" /> Témoignages
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">Ce que disent nos clients</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Des entreprises de toutes tailles nous font confiance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-8 rounded-2xl bg-gray-800 border border-gray-700 hover:shadow-xl transition-shadow relative">
                <div className="absolute top-4 right-4 w-8 h-8 opacity-10">
                  <img src="/logo%20site/apple-icon-180.png" alt="" className="w-full h-full object-contain" />
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-[#ff4d4d]/20 mb-4" />
                <p className="text-gray-100 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-100">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">Tarifs transparents</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Choisissez le plan adapté à vos besoins</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border-2 ${
                  plan.popular
                    ? 'border-[#A11B1B] bg-gradient-to-b from-[#A11B1B]/10 to-gray-800 relative'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#A11B1B] text-gray-100 text-xs font-medium">
                    Populaire
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-100 mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-[#ff4d4d] mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3 text-sm text-gray-100">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/connexion"
                  className={`block w-full py-3 rounded-xl text-center font-medium transition-colors ${
                    plan.popular
                      ? 'bg-[#A11B1B] text-gray-100 hover:bg-[#8a1616]'
                      : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
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
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">Questions fréquentes</h2>
            <p className="text-gray-400">Tout ce que vous devez savoir sur EasyVisa</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-gray-100">{faq.q}</span>
                  {activeFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 text-sm text-gray-400 border-t border-gray-700 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#A11B1B] to-[#8a1616] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/logo%20site/apple-icon-180.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
            <img src="/logo%20site/apple-icon-180.png" alt="EasyVisa" className="w-10 h-10 rounded-lg" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
            Prêt à révolutionner vos voyages d'affaires ?
          </h2>
          <p className="text-gray-100/80 mb-8 text-lg">
            Rejoignez des centaines d'entreprises qui font confiance à EasyVisa
          </p>
          <a
            href="/connexion"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#A11B1B] font-medium hover:bg-gray-100 transition-colors shadow-lg"
          >
            Demander une démo <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <a href="/" className="flex items-center gap-2 mb-4">
                <img
                  src="/logo%20site/apple-icon-180.png"
                  alt="EasyVisa"
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="text-xl font-bold">EasyVisa</span>
              </a>
              <p className="text-gray-400 text-sm">Leader africain du voyage d'affaires</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#services" className="hover:text-gray-100 transition-colors">Services</a></li>
                <li><a href="#features" className="hover:text-gray-100 transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-gray-100 transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-gray-100 transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-gray-100 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-gray-100 transition-colors">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#faq" className="hover:text-gray-100 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-gray-100 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-gray-100 transition-colors">Mentions légales</a></li>
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
