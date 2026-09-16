import type { Quest } from "./types";

/** Edit this file alone to update the Active Quests section. */
export const quests: readonly Quest[] = [
  {
    title: "Azure",
    detail: "Cloud architecture, Azure services and deployment models.",
    status: "active",
  },
  {
    title: "AZ-204",
    detail: "Preparing for the Azure Developer Associate certification.",
    status: "active",
  },
  {
    title: "Testing",
    detail: "C# unit testing and backend design that stays maintainable under change.",
    status: "active",
  },
  {
    title: "AI engineering",
    detail: "Practical AI integration into applications and developer workflows.",
    status: "active",
  },
] as const;
