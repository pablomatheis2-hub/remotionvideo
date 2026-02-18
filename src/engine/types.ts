// ── Timing data (computed from voiceover audio) ──

export interface SceneTiming {
  sceneIndex: number;
  startTimeSec: number;
  endTimeSec: number;
  durationInFrames: number;
}

export interface VoiceoverTimingData {
  fps: number;
  sceneDurations: SceneTiming[];
  totalDurationInFrames: number;
}

// ── Scene config variants (discriminated union on `type`) ──

interface SceneBase {
  durationInFrames: number;
  voiceover: string;
}

export interface LogoRevealScene extends SceneBase {
  type: "logoReveal";
}

export interface KineticTextScene extends SceneBase {
  type: "kineticText";
  words: string[];
}

export interface HeroTaglineScene extends SceneBase {
  type: "heroTagline";
  headline: string;
  subtitle: string;
}

export interface FeatureCardsScene extends SceneBase {
  type: "featureCards";
  title: string;
  features: { icon: string; title: string; description: string }[];
}

export interface FrameworksScene extends SceneBase {
  type: "frameworks";
  title: string;
  items: string[];
}

export interface CodeDemoScene extends SceneBase {
  type: "codeDemo";
  command: string;
  successMessage: string;
  details: string[];
  terminalTitle?: string;
  promptPath?: string;
}

export interface GlobeScene extends SceneBase {
  type: "globe";
  headline: string;
}

export interface StatsScene extends SceneBase {
  type: "stats";
  stats: { value: number; suffix: string; label: string; decimals?: number }[];
}

export interface SocialProofScene extends SceneBase {
  type: "socialProof";
  headline: string;
  count: number;
  companies: string[];
}

export interface CtaScene extends SceneBase {
  type: "cta";
  headline: string;
  buttonText: string;
}

export interface TimelineScene extends SceneBase {
  type: "timeline";
  title: string;
  steps: { icon: string; label: string; detail?: string }[];
}

export interface TestimonialScene extends SceneBase {
  type: "testimonial";
  quote: string;
  author: string;
  role?: string;
  avatarEmoji?: string;
}

export interface ComparisonScene extends SceneBase {
  type: "comparison";
  title?: string;
  before: { label: string; items: string[] };
  after: { label: string; items: string[] };
}

export interface MetricChartScene extends SceneBase {
  type: "metricChart";
  title: string;
  metrics: { label: string; value: number; displayValue: string }[];
}

export interface ChecklistScene extends SceneBase {
  type: "checklist";
  title: string;
  items: string[];
}

export interface SplitImageScene extends SceneBase {
  type: "splitImage";
  title: string;
  subtitle?: string;
  image: string;
  imagePosition?: "left" | "right";
}

export interface IconGridScene extends SceneBase {
  type: "iconGrid";
  title: string;
  icons: { emoji: string; label: string; description?: string }[];
}

export interface PricingTableScene extends SceneBase {
  type: "pricingTable";
  title?: string;
  tiers: {
    name: string;
    price: string;
    period?: string;
    features: string[];
    highlighted?: boolean;
  }[];
}

export interface QuoteCarouselScene extends SceneBase {
  type: "quoteCarousel";
  quotes: { text: string; author: string; role?: string }[];
}

export interface ImpactWordScene extends SceneBase {
  type: "impactWord";
  word: string;
  subtitle?: string;
}

export interface CountdownRevealScene extends SceneBase {
  type: "countdownReveal";
  headline: string;
}

export interface TypewriterScene extends SceneBase {
  type: "typewriter";
  text: string;
}

export interface LogoWallScene extends SceneBase {
  type: "logoWall";
  title?: string;
  logos: string[];
}

export interface BarChartScene extends SceneBase {
  type: "barChart";
  title: string;
  bars: { label: string; value: number; displayValue?: string }[];
}

export interface NumberedStepsScene extends SceneBase {
  type: "numberedSteps";
  title?: string;
  steps: { label: string; detail?: string }[];
}

export interface FullscreenQuoteScene extends SceneBase {
  type: "fullscreenQuote";
  quote: string;
  author?: string;
}

export interface DonutChartScene extends SceneBase {
  type: "donutChart";
  title: string;
  segments: { label: string; value: number; color?: string }[];
}

export interface TeamGridScene extends SceneBase {
  type: "teamGrid";
  title?: string;
  members: { name: string; role: string; emoji?: string }[];
}

export interface TextMarqueeScene extends SceneBase {
  type: "textMarquee";
  words: string[];
}

export interface SplitRevealScene extends SceneBase {
  type: "splitReveal";
  headline: string;
  subtitle?: string;
}

export interface BrowserMockupScene extends SceneBase {
  type: "browserMockup";
  url: string;
  title: string;
  features: string[];
}

export interface WordCloudScene extends SceneBase {
  type: "wordCloud";
  words: string[];
}

export interface GradientWaveScene extends SceneBase {
  type: "gradientWave";
  headline: string;
  subtitle?: string;
}

export interface StackRevealScene extends SceneBase {
  type: "stackReveal";
  cards: { title: string; description?: string; emoji?: string }[];
}

export type SceneConfig =
  | LogoRevealScene
  | KineticTextScene
  | HeroTaglineScene
  | FeatureCardsScene
  | FrameworksScene
  | CodeDemoScene
  | GlobeScene
  | StatsScene
  | SocialProofScene
  | CtaScene
  | TimelineScene
  | TestimonialScene
  | ComparisonScene
  | MetricChartScene
  | ChecklistScene
  | SplitImageScene
  | IconGridScene
  | PricingTableScene
  | QuoteCarouselScene
  | ImpactWordScene
  | CountdownRevealScene
  | TypewriterScene
  | LogoWallScene
  | BarChartScene
  | NumberedStepsScene
  | FullscreenQuoteScene
  | DonutChartScene
  | TeamGridScene
  | TextMarqueeScene
  | SplitRevealScene
  | BrowserMockupScene
  | WordCloudScene
  | GradientWaveScene
  | StackRevealScene;

// ── Raw scene config (input JSON — no durationInFrames) ──

export type RawSceneConfig = Omit<SceneConfig, "durationInFrames"> & {
  voiceover: string;
};

// ── Audio config ──

export interface AudioConfig {
  backgroundMusic?: { src: string; volume?: number };
  voiceover?: { voiceId?: string; volume?: number };
}

export interface ResolvedAudioConfig {
  backgroundMusic: { src: string; volume: number } | null;
  voiceover: { voiceId: string; volume: number };
}

// ── Video config (what the JSON file contains) ──

export interface VideoConfig {
  meta?: { fps?: number; width?: number; height?: number };
  brand: { name: string; tagline?: string; logoUrl?: string };
  theme?: {
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      textPrimary?: string;
      textSecondary?: string;
    };
    fonts?: { family?: string; weights?: string[] };
  };
  audio?: AudioConfig;
  scenes: RawSceneConfig[];
}

// ── Resolved config (all defaults filled in) ──

export interface ResolvedColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
  // Derived (adaptive to light/dark background)
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  gridLine: string;
  white: string;
}

export interface ResolvedFonts {
  family: string;
  weights: string[];
}

export interface ResolvedBrand {
  name: string;
  tagline: string;
  logoUrl: string;
}

export interface ResolvedTheme {
  colors: ResolvedColors;
  fonts: ResolvedFonts;
  gradients: {
    accent: string;
    accentText: string;
  };
}

export interface ResolvedMeta {
  fps: number;
  width: number;
  height: number;
}

export interface ResolvedVideoConfig {
  meta: ResolvedMeta;
  brand: ResolvedBrand;
  theme: ResolvedTheme;
  audio: ResolvedAudioConfig;
  scenes: SceneConfig[];
  hasTimingData: boolean;
}
