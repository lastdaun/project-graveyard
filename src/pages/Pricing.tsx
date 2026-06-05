import { Check, Zap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Pricing = () => {
  const { t } = useLanguage();

  const tiers = [
    {
      name: t("pricing.free"),
      price: "0₫",
      period: t("pricing.free.period"),
      description: t("pricing.free.desc"),
      icon: Zap,
      features: [t("pricing.free.f1"), t("pricing.free.f2"), t("pricing.free.f3"), t("pricing.free.f4"), t("pricing.free.f5")],
      cta: t("pricing.free.cta"),
      highlight: false,
    },
    {
      name: t("pricing.premium"),
      price: t("pricing.premium.price"),
      period: t("pricing.premium.period"),
      description: t("pricing.premium.desc"),
      icon: Rocket,
      features: [t("pricing.premium.f1"), t("pricing.premium.f2"), t("pricing.premium.f3"), t("pricing.premium.f4"), t("pricing.premium.f5"), t("pricing.premium.f6")],
      cta: t("pricing.premium.cta"),
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-16">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="font-display text-4xl font-bold tracking-tight">{t("pricing.title")}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{t("pricing.sub")}</p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div key={tier.name} className={`relative rounded-2xl border p-8 transition-shadow ${tier.highlight ? "border-primary shadow-lg ring-1 ring-primary/20" : "bg-card card-hover"}`}>
                {tier.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">{t("pricing.popular")}</span>
                )}
                <div className="mb-5 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tier.highlight ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`h-5 w-5 ${tier.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <h2 className="font-display text-xl font-bold">{tier.name}</h2>
                </div>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">{tier.description}</p>
                <ul className="mb-8 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex flex-row items-center space-x-3 leading-normal tracking-normal text-base text-muted-foreground">
                      <Check className="h-4 w-4 shrink-0 text-accent" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={tier.highlight ? "default" : "outline"} onClick={() => toast.success(`✓ ${tier.name}`)}>
                  {tier.cta}
                </Button>
              </div>
            );
          })}
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
