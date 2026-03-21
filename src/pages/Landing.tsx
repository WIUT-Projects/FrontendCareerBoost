import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Brain, Users, Briefcase, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { PricingSection } from './Subscription';
import { useTranslation } from 'react-i18next';
import { TiltCard } from '@/components/shared/TiltCard';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import heroImage from '@/assets/hero-illustration.png';
import { InteractiveDotGrid } from '@/components/shared/InteractiveDotGrid';

export default function LandingPage() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    { icon: FileText, title: t('features.resumeBuilder'), description: t('features.resumeBuilderDesc') },
    { icon: Brain, title: t('features.aiAnalysis'), description: t('features.aiAnalysisDesc') },
    { icon: Users, title: t('features.hrReviews'), description: t('features.hrReviewsDesc') },
    { icon: Briefcase, title: t('features.jobMarket'), description: t('features.jobMarketDesc') },
  ];

  const stats = [
    { value: '50K+', label: t('stats.resumes') },
    { value: '200+', label: t('stats.experts') },
    { value: '10K+', label: t('stats.jobs') },
    { value: '95%', label: t('stats.satisfaction') },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative">
      <InteractiveDotGrid />
      {/* Navbar */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <h1 className="font-display text-xl font-bold text-gradient-primary">CareerBoost Pro</h1>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.features')}</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.about')}</a>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.blog')}</Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/login"><Button variant="ghost" size="sm">{t('nav.signIn')}</Button></Link>
            <Link to="/register"><Button size="sm">{t('nav.getStarted')} <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-primary/30 blur-[150px]" />
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-[hsl(220,76%,70%)]/25 blur-[130px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/15 blur-[100px]" />
          <div className="absolute top-10 right-[15%] w-[250px] h-[250px] rounded-full bg-[hsl(150,58%,50%)]/15 blur-[100px]" />
        </div>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm text-accent-foreground mb-6">
                <Star className="h-3.5 w-3.5" /> {t('hero.badge')}
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                {t('hero.titleStart')} <span className="text-gradient-primary">{t('hero.titleHighlight')}</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">{t('hero.description')}</p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link to="/register"><Button size="lg">{t('hero.startFree')} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <Link to="/login"><Button variant="outline" size="lg">{t('nav.signIn')}</Button></Link>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {[t('hero.noCard'), t('hero.freeTemplates'), t('hero.aiIncluded')].map((txt) => (
                  <span key={txt} className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-success" />{txt}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <img src={heroImage} alt="Career boost illustration" className="w-full max-w-xl lg:max-w-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y bg-card">
        <div className="container py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="text-center mb-14">
          <h3 className="font-display text-3xl font-bold mb-3">{t('features.title')}</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">{t('features.subtitle')}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <TiltCard key={f.title} className="rounded-xl border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-display font-semibold mb-2">{f.title}</h4>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-20">
        <div className="text-center mb-10">
          <h3 className="font-display text-3xl font-bold mb-3">Simple, Transparent Pricing</h3>
          <p className="text-muted-foreground max-w-md mx-auto">Choose the plan that fits your career goals.</p>
        </div>
        <PricingSection embedded />
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <TiltCard className="rounded-2xl bg-primary p-12 text-center text-primary-foreground">
          <h3 className="font-display text-3xl font-bold mb-4">{t('cta.title')}</h3>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">{t('cta.subtitle')}</p>
          <Link to="/register">
            <Button size="lg" variant="secondary">{t('cta.button')} <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </TiltCard>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display font-semibold text-gradient-primary">CareerBoost Pro</p>
          <p className="text-sm text-muted-foreground">{t('footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
}
