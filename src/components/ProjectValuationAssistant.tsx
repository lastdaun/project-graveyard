import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProjectType =
  | "LANDING"
  | "CRUD_WEB"
  | "MOBILE"
  | "ECOMMERCE"
  | "SAAS"
  | "AI"
  | "OTHER";

export type CodeStatus = "OK" | "MINOR_BUGS" | "MAJOR_BUGS" | "NOT_TESTED";

export interface ValuationInput {
  projectType: ProjectType | "";
  completionPercent: number;
  projectStage: string;
  hasDemo: boolean;
  hasSourceCode: boolean;
  hasDatabase: boolean;
  hasReadme: boolean;
  hasApiDocs: boolean;
  hasScreenshots: boolean;
  hasTestAccount: boolean;
  codeStatus: CodeStatus | "";
  handoverType: string;
}

export interface ValuationResult {
  estimatedPriceLow: number;
  estimatedPriceSuggested: number;
  estimatedPriceHigh: number;
  valuationScore: number;
  valuationConfidence: "Thấp" | "Trung bình" | "Cao";
  valuationNote: string;
  softPriceCap: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: "LANDING", label: "Landing page / Website đơn giản" },
  { value: "CRUD_WEB", label: "CRUD Web App" },
  { value: "MOBILE", label: "Mobile App Prototype" },
  { value: "ECOMMERCE", label: "E-commerce / Marketplace" },
  { value: "SAAS", label: "SaaS / Dashboard / CRM" },
  { value: "AI", label: "AI / Data Prototype" },
  { value: "OTHER", label: "Khác" },
];

export const CODE_STATUS_OPTIONS: { value: CodeStatus; label: string }[] = [
  { value: "OK", label: "Code chạy local ổn định" },
  { value: "MINOR_BUGS", label: "Có lỗi nhỏ" },
  { value: "MAJOR_BUGS", label: "Có lỗi lớn" },
  { value: "NOT_TESTED", label: "Chưa test kỹ" },
];

const BASE_PRICES: Record<ProjectType, { min: number; max: number }> = {
  LANDING:   { min: 1_000_000,  max: 4_000_000 },
  CRUD_WEB:  { min: 3_000_000,  max: 8_000_000 },
  MOBILE:    { min: 4_000_000,  max: 12_000_000 },
  ECOMMERCE: { min: 6_000_000,  max: 20_000_000 },
  SAAS:      { min: 5_000_000,  max: 18_000_000 },
  AI:        { min: 4_000_000,  max: 15_000_000 },
  OTHER:     { min: 2_000_000,  max: 10_000_000 },
};

const SOFT_PRICE_CAP: Record<ProjectType, number> = {
  LANDING:   6_000_000,
  CRUD_WEB:  12_000_000,
  MOBILE:    18_000_000,
  ECOMMERCE: 30_000_000,
  SAAS:      28_000_000,
  AI:        25_000_000,
  OTHER:     15_000_000,
};

// ─── Calculation ──────────────────────────────────────────────────────────────

function getCompletionFactor(pct: number): number {
  if (pct <= 20) return 0.2;
  if (pct <= 40) return 0.35;
  if (pct <= 60) return 0.55;
  if (pct <= 80) return 0.75;
  if (pct <= 95) return 0.9;
  return 1.0;
}

function getRiskFactor(status: CodeStatus | ""): number {
  switch (status) {
    case "OK":          return 1.0;
    case "MINOR_BUGS":  return 0.85;
    case "MAJOR_BUGS":  return 0.65;
    case "NOT_TESTED":  return 0.55;
    default:            return 0.7;
  }
}

export function calculateValuation(input: ValuationInput): ValuationResult | null {
  if (!input.projectType || input.projectType === "OTHER" && input.completionPercent === 0) return null;

  const base = BASE_PRICES[input.projectType as ProjectType] ?? BASE_PRICES.OTHER;
  const midBase = (base.min + base.max) / 2;

  const completionFactor = getCompletionFactor(input.completionPercent);

  let qualityFactor = 0.7;
  if (input.hasDemo)        qualityFactor += 0.15;
  if (input.hasSourceCode)  qualityFactor += 0.15;
  if (input.hasDatabase)    qualityFactor += 0.10;
  if (input.hasReadme)      qualityFactor += 0.10;
  if (input.hasApiDocs)     qualityFactor += 0.10;
  if (input.hasScreenshots) qualityFactor += 0.05;
  qualityFactor = Math.min(qualityFactor, 1.25);

  const riskFactor = getRiskFactor(input.codeStatus);

  const suggested = Math.round((midBase * completionFactor * qualityFactor * riskFactor) / 100_000) * 100_000;
  const low  = Math.round((suggested * 0.75) / 100_000) * 100_000;
  const high = Math.round((suggested * 1.25) / 100_000) * 100_000;

  // Score 0-100
  const score = Math.round(completionFactor * 40 + (qualityFactor - 0.7) / 0.55 * 40 + riskFactor * 20);

  let confidence: ValuationResult["valuationConfidence"];
  if (score >= 65) confidence = "Cao";
  else if (score >= 35) confidence = "Trung bình";
  else confidence = "Thấp";

  // Build notes
  const notes: string[] = [];
  notes.push(`Project hoàn thiện ${input.completionPercent}%`);
  if (input.hasDemo)        notes.push("Có demo chạy được");
  if (input.hasSourceCode)  notes.push("Có source code đầy đủ");
  if (input.hasDatabase)    notes.push("Có database / schema");
  if (input.hasReadme)      notes.push("Có README / setup guide");
  if (input.hasApiDocs)     notes.push("Có API docs / Postman");
  if (input.hasScreenshots) notes.push("Có screenshot / video demo");
  if (!input.hasDemo && !input.hasSourceCode) notes.push("Chưa có demo hoặc source code");
  if (input.codeStatus === "MAJOR_BUGS") notes.push("Có lỗi lớn cần sửa");
  if (input.codeStatus === "NOT_TESTED") notes.push("Code chưa được test kỹ");

  const cap = SOFT_PRICE_CAP[input.projectType as ProjectType] ?? SOFT_PRICE_CAP.OTHER;

  return {
    estimatedPriceLow: Math.max(low, base.min),
    estimatedPriceSuggested: Math.max(suggested, base.min),
    estimatedPriceHigh: high,
    valuationScore: score,
    valuationConfidence: confidence,
    valuationNote: notes.join("; "),
    softPriceCap: cap,
  };
}

// ─── UI Component ─────────────────────────────────────────────────────────────

interface Props {
  input: ValuationInput;
  onUseSuggestedPrice?: (price: number) => void;
}

const CONFIDENCE_COLOR: Record<string, string> = {
  "Cao":        "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300",
  "Trung bình": "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300",
  "Thấp":       "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300",
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

export const ProjectValuationAssistant = ({ input, onUseSuggestedPrice }: Props) => {
  const result = useMemo(() => calculateValuation(input), [input]);

  if (!result) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        <Sparkles className="mx-auto mb-2 h-5 w-5 opacity-50" />
        Chọn loại project để xem gợi ý giá
      </div>
    );
  }

  const notes = result.valuationNote.split("; ");

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold">Bộ gợi ý giá project bỏ dở</span>
        </div>
        <Badge
          variant="outline"
          className={CONFIDENCE_COLOR[result.valuationConfidence]}
        >
          Độ tin cậy: {result.valuationConfidence}
        </Badge>
      </div>

      {/* Price boxes */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingDown className="h-3 w-3" /> Bán nhanh
          </div>
          <p className="font-bold tabular-nums text-sm">{fmt(result.estimatedPriceLow)}</p>
        </div>
        <div className="rounded-lg border-2 border-primary bg-primary/5 p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-xs text-primary mb-1">
            <Minus className="h-3 w-3" /> Đề xuất
          </div>
          <p className="font-bold tabular-nums text-primary">{fmt(result.estimatedPriceSuggested)}</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3 w-3" /> Có thể thử
          </div>
          <p className="font-bold tabular-nums text-sm">{fmt(result.estimatedPriceHigh)}</p>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-lg bg-muted/30 p-3 space-y-1">
        <p className="text-xs font-medium text-muted-foreground mb-2">Lý do định giá:</p>
        {notes.map((n, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <span className="mt-0.5 shrink-0 text-primary">·</span>
            <span>{n}</span>
          </div>
        ))}
      </div>

      {/* Soft cap warning */}
      {result.estimatedPriceHigh > result.softPriceCap && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-700/50 p-3 text-xs text-amber-800 dark:text-amber-300">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Giá cao có thể thử ({fmt(result.estimatedPriceHigh)}) đang vượt ngưỡng thường gặp ({fmt(result.softPriceCap)}) cho loại project này. Bổ sung demo và docs để tăng độ tin cậy.
        </div>
      )}

      {/* CTA */}
      {onUseSuggestedPrice && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-primary/40 text-primary hover:bg-primary/5"
          onClick={() => onUseSuggestedPrice(result.estimatedPriceSuggested)}
        >
          Dùng giá đề xuất ({fmt(result.estimatedPriceSuggested)})
        </Button>
      )}
    </div>
  );
};

// ─── Price comparison badge (for ProjectDetails & Admin) ─────────────────────

interface PriceBadgeProps {
  userPrice: number;
  suggestedLow: number;
  suggestedHigh: number;
}

export const PriceComparisonBadge = ({ userPrice, suggestedLow, suggestedHigh }: PriceBadgeProps) => {
  if (userPrice >= suggestedLow && userPrice <= suggestedHigh) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 gap-1">
        <Minus className="h-3 w-3" /> Giá hợp lý
      </Badge>
    );
  }
  if (userPrice > suggestedHigh) {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 gap-1">
        <TrendingUp className="h-3 w-3" /> Cao hơn gợi ý
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 gap-1">
      <TrendingDown className="h-3 w-3" /> Thấp hơn gợi ý
    </Badge>
  );
};

export default ProjectValuationAssistant;
