export type ArchitectureLayer = { layer: string; detail: string };

export type CaseStudy = {
  problem: string;
  architecture: readonly ArchitectureLayer[];
  features: readonly string[];
  /** Explicitly NOT built. Kept separate so the UI can never present it as shipped. */
  planned: readonly string[];
  learned: string;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  featured: boolean;
  status: "live" | "in-progress" | "archived";
  collaboration: "solo" | "team";
  technologies: readonly string[];
  links: { source?: string; live?: string };
  image?: string;
  /** Intrinsic pixel dimensions of `image`, so the rendered aspect ratio
   * matches the real file and the browser doesn't reflow once it loads. */
  imageWidth?: number;
  imageHeight?: number;
  /** Shown verbatim when the repository is not under Willem's account. */
  attribution?: string;
  caseStudy?: CaseStudy;
};

export type SkillGroup = {
  id: string;
  title: string;
  blurb: string;
  /** Names only. Numeric proficiency ratings are forbidden by the spec. */
  skills: readonly string[];
};

export type TimelineEntry = {
  period: string;
  title: string;
  org?: string;
  detail: string;
};

export type Quest = {
  title: string;
  detail: string;
  status: "active" | "planned";
};

export type Profile = {
  name: string;
  handle: string;
  role: string;
  epithet: string;
  location: string;
  summary: readonly string[];
  email: string;
  links: readonly { label: string; href: string }[];
};
