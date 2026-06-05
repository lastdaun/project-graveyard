import { createContext, useContext, useState, type ReactNode } from "react";

export interface PricingConfig {
  itBase: Record<string, number>;
  designBase: Record<string, number>;
  complexityPts: Record<string, number>;
  checkPt: number;
  innovationPts: Record<string, number>;
  multiplierBrackets: { min: number; max: number; value: number }[];
}

const defaultConfig: PricingConfig = {
  itBase: {
    landing: 375_000,
    website_full: 1_175_000,
    web_app: 12_500_000,
    mobile_app: 6_250_000,
    ai_ml: 1_200_000,
  },
  designBase: {
    social_post: 62_500,
    logo_branding: 375_000,
    ui_ux_full: 1_250_000,
    motion_video: 875_000,
    "3d_model": 250_000,
  },
  complexityPts: { a: 5, b: 10, c: 15, d: 20, e: 25 },
  checkPt: 5,
  innovationPts: { a: 3, b: 7, c: 10, d: 15 },
  multiplierBrackets: [
    { min: 0, max: 25, value: 1.0 },
    { min: 26, max: 40, value: 1.75 },
    { min: 41, max: 60, value: 2.25 },
    { min: 61, max: 80, value: 3.0 },
    { min: 81, max: 100, value: 4.0 },
  ],
};

interface PricingConfigContextType {
  config: PricingConfig;
  setConfig: (config: PricingConfig) => void;
}

const PricingConfigContext = createContext<PricingConfigContextType | undefined>(undefined);

export const PricingConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<PricingConfig>(defaultConfig);
  return (
    <PricingConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </PricingConfigContext.Provider>
  );
};

export const usePricingConfig = () => {
  const ctx = useContext(PricingConfigContext);
  if (!ctx) throw new Error("usePricingConfig must be used within PricingConfigProvider");
  return ctx;
};

export function getMultiplier(score: number, brackets: PricingConfig["multiplierBrackets"]): number {
  for (const b of brackets) {
    if (score >= b.min && score <= b.max) return b.value;
  }
  return brackets[brackets.length - 1].value;
}
