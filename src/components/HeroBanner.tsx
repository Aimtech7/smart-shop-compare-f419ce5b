import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap, ShoppingBag, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    title: 'Shop Smart\nLive Better',
    subtitle: 'Compare prices across 240+ stores and find the best deals.',
    cta: 'Shop Now',
    ctaLink: '/search',
    gradient: 'from-primary via-primary/90 to-primary/70',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
  },
  {
    title: 'Start Selling\nOn Tha Buyer',
    subtitle: 'Join thousands of sellers. Set up your store in minutes.',
    cta: 'Register as Seller',
    ctaLink: '/auth/signup?role=seller',
    gradient: 'from-accent via-accent/90 to-accent/70',
    icon: ShoppingBag,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
  },
  {
    title: 'Best Deals\nEvery Day',
    subtitle: 'AI-powered price comparison finds you unbeatable prices.',
    cta: 'Try It Now',
    ctaLink: '/search',
    gradient: 'from-info via-info/90 to-info/70',
    icon: TrendingUp,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${slide.gradient} text-primary-foreground min-h-[280px] sm:min-h-[340px]`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5" />
        <img src={slide.image} alt="" className="absolute right-0 bottom-0 w-1/2 h-full object-cover opacity-20 sm:opacity-30 mix-blend-overlay" loading="lazy" />
      </div>

      <div className={`relative z-10 p-8 sm:p-12 flex flex-col justify-center min-h-[280px] sm:min-h-[340px] transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Tha Buyer</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold whitespace-pre-line leading-tight mb-3">
          {slide.title}
        </h2>
        <p className="text-sm sm:text-base opacity-90 max-w-md mb-6">{slide.subtitle}</p>
        <div>
          <Link to={slide.ctaLink}>
            <Button size="lg" variant="secondary" className="shadow-xl font-semibold">
              {slide.cta}
            </Button>
          </Link>
        </div>
      </div>

      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition z-20">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition z-20">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
}
