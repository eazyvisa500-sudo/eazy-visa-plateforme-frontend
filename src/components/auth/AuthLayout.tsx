import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const authImages = [
  { src: '/logo%20site/apple-splash-2778-1284.jpg', alt: 'EasyVisa' },
  { src: '/EVBilleterie.jpg', alt: 'Billeterie' },
  { src: '/EVServices3.jpg', alt: 'Services' },
  { src: '/image1.jpg', alt: 'Voyage' },
];

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  backLink?: {
    to: string;
    label: string;
  };
}

export default function AuthLayout({ children, title, subtitle, backLink }: AuthLayoutProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % authImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + authImages.length) % authImages.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="min-h-svh flex">
      {/* Left side - Image carousel */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-[#565556]">
        {authImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#565556]/90 via-[#565556]/40 to-transparent" />
          </div>
        ))}

        {/* Left side content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <img
              src="/logo%20site/apple-icon-180.png"
              alt="EasyVisa"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-white">EasyVisa</span>
          </div>

          <div className="max-w-md">
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Simplifiez vos voyages d'affaires
            </h2>
            <p className="text-white/80 text-lg">
              Une plateforme intelligente pour gérer, réserver et optimiser tous vos déplacements professionnels.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {authImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide
                      ? 'w-8 h-2 bg-[#A11B1B]'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Aller à l'image ${index + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-white relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <img
            src="/logo%20site/apple-icon-180.png"
            alt="EasyVisa"
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="text-xl font-bold text-[#565556]">EasyVisa</span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <div className="hidden lg:flex items-center justify-center w-16 h-16 rounded-2xl bg-[#A11B1B]/10 mb-6">
              <img
                src="/logo%20site/apple-icon-180.png"
                alt="EasyVisa"
                className="h-10 w-10 rounded-lg object-cover"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#565556]">{title}</h1>
            <p className="text-[#A5A6A5] mt-2">{subtitle}</p>
          </div>

          {children}

          {backLink && (
            <div className="mt-6 text-center">
              <a
                href={backLink.to}
                className="text-sm text-[#A5A6A5] hover:text-[#A11B1B] transition-colors duration-200 font-medium"
              >
                {backLink.label}
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-[#A5A6A5]">
          © 2026 EasyVisa. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}
