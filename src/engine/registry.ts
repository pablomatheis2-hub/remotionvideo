import React from "react";
import { Scene1_LogoReveal } from "../scenes/Scene1_LogoReveal";
import { Scene2_KineticText } from "../scenes/Scene2_KineticText";
import { Scene3_HeroTagline } from "../scenes/Scene3_HeroTagline";
import { Scene4_FeatureCards } from "../scenes/Scene4_FeatureCards";
import { Scene5_Frameworks } from "../scenes/Scene5_Frameworks";
import { Scene6_CodeEditor } from "../scenes/Scene6_CodeEditor";
import { Scene7_Globe } from "../scenes/Scene7_Globe";
import { Scene8_Stats } from "../scenes/Scene8_Stats";
import { Scene9_SocialProof } from "../scenes/Scene9_SocialProof";
import { Scene10_CTA } from "../scenes/Scene10_CTA";
import { Scene11_Timeline } from "../scenes/Scene11_Timeline";
import { Scene12_Testimonial } from "../scenes/Scene12_Testimonial";
import { Scene13_Comparison } from "../scenes/Scene13_Comparison";
import { Scene14_MetricChart } from "../scenes/Scene14_MetricChart";
import { Scene15_Checklist } from "../scenes/Scene15_Checklist";
import { Scene16_SplitImage } from "../scenes/Scene16_SplitImage";
import { Scene17_IconGrid } from "../scenes/Scene17_IconGrid";
import { Scene18_PricingTable } from "../scenes/Scene18_PricingTable";
import { Scene19_QuoteCarousel } from "../scenes/Scene19_QuoteCarousel";
import { Scene20_ImpactWord } from "../scenes/Scene20_ImpactWord";
import { Scene21_CountdownReveal } from "../scenes/Scene21_CountdownReveal";
import { Scene22_Typewriter } from "../scenes/Scene22_Typewriter";
import { Scene23_LogoWall } from "../scenes/Scene23_LogoWall";
import { Scene24_BarChart } from "../scenes/Scene24_BarChart";
import { Scene25_NumberedSteps } from "../scenes/Scene25_NumberedSteps";
import { Scene26_FullscreenQuote } from "../scenes/Scene26_FullscreenQuote";
import { Scene27_DonutChart } from "../scenes/Scene27_DonutChart";
import { Scene28_TeamGrid } from "../scenes/Scene28_TeamGrid";
import { Scene29_TextMarquee } from "../scenes/Scene29_TextMarquee";
import { Scene30_SplitReveal } from "../scenes/Scene30_SplitReveal";
import { Scene31_BrowserMockup } from "../scenes/Scene31_BrowserMockup";
import { Scene32_WordCloud } from "../scenes/Scene32_WordCloud";
import { Scene33_GradientWave } from "../scenes/Scene33_GradientWave";
import { Scene34_StackReveal } from "../scenes/Scene34_StackReveal";
import type { SceneConfig } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SceneComponent = React.FC<any>;

export const sceneRegistry: Record<SceneConfig["type"], SceneComponent> = {
  logoReveal: Scene1_LogoReveal,
  kineticText: Scene2_KineticText,
  heroTagline: Scene3_HeroTagline,
  featureCards: Scene4_FeatureCards,
  frameworks: Scene5_Frameworks,
  codeDemo: Scene6_CodeEditor,
  globe: Scene7_Globe,
  stats: Scene8_Stats,
  socialProof: Scene9_SocialProof,
  cta: Scene10_CTA,
  timeline: Scene11_Timeline,
  testimonial: Scene12_Testimonial,
  comparison: Scene13_Comparison,
  metricChart: Scene14_MetricChart,
  checklist: Scene15_Checklist,
  splitImage: Scene16_SplitImage,
  iconGrid: Scene17_IconGrid,
  pricingTable: Scene18_PricingTable,
  quoteCarousel: Scene19_QuoteCarousel,
  impactWord: Scene20_ImpactWord,
  countdownReveal: Scene21_CountdownReveal,
  typewriter: Scene22_Typewriter,
  logoWall: Scene23_LogoWall,
  barChart: Scene24_BarChart,
  numberedSteps: Scene25_NumberedSteps,
  fullscreenQuote: Scene26_FullscreenQuote,
  donutChart: Scene27_DonutChart,
  teamGrid: Scene28_TeamGrid,
  textMarquee: Scene29_TextMarquee,
  splitReveal: Scene30_SplitReveal,
  browserMockup: Scene31_BrowserMockup,
  wordCloud: Scene32_WordCloud,
  gradientWave: Scene33_GradientWave,
  stackReveal: Scene34_StackReveal,
};
