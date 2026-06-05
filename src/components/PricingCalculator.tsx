import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Palette, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { usePricingConfig, getMultiplier } from "@/contexts/PricingConfigContext";
import { useLanguage } from "@/contexts/LanguageContext";

const IT_OPTIONS_KEYS = ["landing", "website_full", "web_app", "mobile_app", "ai_ml"] as const;
const DESIGN_OPTIONS_KEYS = ["social_post", "logo_branding", "ui_ux_full", "motion_video", "3d_model"] as const;

const Q1_KEYS = ["a", "b", "c", "d", "e"] as const;
const Q2_KEYS = ["q2a", "q2b", "q2c", "q2d"] as const;
const Q3_KEYS = ["q3a", "q3b", "q3c", "q3d"] as const;
const Q4_KEYS = ["q4a", "q4b", "q4c", "q4d"] as const;
const Q5_KEYS = ["a", "b", "c", "d"] as const;

interface Props {
  onApply: (price: number) => void;
}

const PricingCalculator = ({ onApply }: Props) => {
  const { config } = usePricingConfig();
  const { t } = useLanguage();

  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState<"it" | "design" | "">("");
  const [projectType, setProjectType] = useState("");
  const [complexity, setComplexity] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [quality, setQuality] = useState<string[]>([]);
  const [market, setMarket] = useState<string[]>([]);
  const [innovation, setInnovation] = useState("");

  const basePrice = useMemo(() => {
    if (!projectType) return 0;
    return (domain === "it" ? config.itBase : config.designBase)[projectType] ?? 0;
  }, [domain, projectType, config]);

  const totalScore = useMemo(() => {
    let s = 0;
    s += config.complexityPts[complexity] ?? 0;
    s += deliverables.length * config.checkPt;
    s += quality.length * config.checkPt;
    s += market.length * config.checkPt;
    s += config.innovationPts[innovation] ?? 0;
    return s;
  }, [complexity, deliverables, quality, market, innovation, config]);

  const finalPrice = Math.round(basePrice * getMultiplier(totalScore, config.multiplierBrackets));

  const toggleCheck = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, v: string) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const canNext =
    (step === 0 && domain !== "") ||
    (step === 1 && projectType !== "") ||
    (step === 2 && complexity !== "" && innovation !== "") ||
    step === 3;

  const itOptions = IT_OPTIONS_KEYS.map((k) => ({ value: k, label: t(`calc.it.${k}`) }));
  const designOptions = DESIGN_OPTIONS_KEYS.map((k) => ({ value: k, label: t(`calc.design.${k}`) }));
  const q1 = Q1_KEYS.map((k) => ({ value: k, label: t(`calc.q1.${k}`) }));
  const q2 = Q2_KEYS.map((k) => ({ value: k, label: t(`calc.q2.${k.replace("q2", "")}`) }));
  const q3 = Q3_KEYS.map((k) => ({ value: k, label: t(`calc.q3.${k.replace("q3", "")}`) }));
  const q4 = Q4_KEYS.map((k) => ({ value: k, label: t(`calc.q4.${k.replace("q4", "")}`) }));
  const q5 = Q5_KEYS.map((k) => ({ value: k, label: t(`calc.q5.${k}`) }));

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {/* Step 0 – Domain */}
      {step === 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold">{t("calc.step1.title")}</h3>
          <div className="grid grid-cols-2 gap-4">
            {([["it", t("calc.domain.it"), Monitor], ["design", t("calc.domain.design"), Palette]] as const).map(([val, label, Icon]) => (
              <button
                key={val}
                type="button"
                onClick={() => { setDomain(val as "it" | "design"); setProjectType(""); }}
                className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${domain === val ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <Icon className={`h-8 w-8 ${domain === val ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 – Project Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold">{t("calc.step2.title")}</h3>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger><SelectValue placeholder={t("calc.step2.ph")} /></SelectTrigger>
            <SelectContent>
              {(domain === "it" ? itOptions : designOptions).map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Step 2 – Assessment */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="font-display text-lg font-semibold">{t("calc.step3.title")}</h3>

          <Card>
            <CardContent className="pt-5 space-y-3">
              <Label className="text-sm font-semibold">{t("calc.q1.label")}</Label>
              <RadioGroup value={complexity} onValueChange={setComplexity}>
                {q1.map((o) => (
                  <div key={o.value} className="flex items-center gap-2">
                    <RadioGroupItem value={o.value} id={`c-${o.value}`} />
                    <Label htmlFor={`c-${o.value}`} className="font-normal cursor-pointer">{o.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-3">
              <Label className="text-sm font-semibold">{t("calc.q2.label")}</Label>
              {q2.map((o) => (
                <div key={o.value} className="flex items-center gap-2">
                  <Checkbox id={o.value} checked={deliverables.includes(o.value)} onCheckedChange={() => toggleCheck(deliverables, setDeliverables, o.value)} />
                  <Label htmlFor={o.value} className="font-normal cursor-pointer">{o.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-3">
              <Label className="text-sm font-semibold">{t("calc.q3.label")}</Label>
              {q3.map((o) => (
                <div key={o.value} className="flex items-center gap-2">
                  <Checkbox id={o.value} checked={quality.includes(o.value)} onCheckedChange={() => toggleCheck(quality, setQuality, o.value)} />
                  <Label htmlFor={o.value} className="font-normal cursor-pointer">{o.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-3">
              <Label className="text-sm font-semibold">{t("calc.q4.label")}</Label>
              {q4.map((o) => (
                <div key={o.value} className="flex items-center gap-2">
                  <Checkbox id={o.value} checked={market.includes(o.value)} onCheckedChange={() => toggleCheck(market, setMarket, o.value)} />
                  <Label htmlFor={o.value} className="font-normal cursor-pointer">{o.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-3">
              <Label className="text-sm font-semibold">{t("calc.q5.label")}</Label>
              <RadioGroup value={innovation} onValueChange={setInnovation}>
                {q5.map((o) => (
                  <div key={o.value} className="flex items-center gap-2">
                    <RadioGroupItem value={o.value} id={`i-${o.value}`} />
                    <Label htmlFor={`i-${o.value}`} className="font-normal cursor-pointer">{o.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3 – Result */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">{t("calc.result.title")}</span>
            </div>
            <p className="font-display text-4xl font-extrabold">
              {finalPrice.toLocaleString("vi-VN")}₫
            </p>
          </div>
          <Button type="button" className="w-full" onClick={() => onApply(finalPrice)}>
            {t("calc.result.apply")}
          </Button>
        </div>
      )}

      {/* Nav */}
      {step < 3 && (
        <div className="flex justify-between">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> {t("calc.nav.back")}
          </Button>
          <Button type="button" disabled={!canNext} onClick={() => setStep(step + 1)}>
            {t("calc.nav.next")} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PricingCalculator;
