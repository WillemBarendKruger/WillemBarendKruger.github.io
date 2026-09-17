import type { TimelineEntry } from "./types";

export const timeline: readonly TimelineEntry[] = [
  {
    period: "2021 – 2024",
    title: "Bachelor of Information Technology",
    org: "Belgium Campus ITversity",
    detail:
      "Object-oriented programming, data structures, software engineering, web development, software analysis and design, software testing, database development, data analytics and business intelligence.",
  },
  {
    period: "2022 – 2024",
    title: "Coursework and first projects",
    detail:
      "C# desktop applications, Node.js command-line tools, and a team-built multi-service web application. The milestone project was an aviation safety weather observation system — reading temperature, humidity and light from onboard sensors, warning pilots of hazardous conditions, and transmitting readings to a web page over an ESP32.",
  },
  {
    period: "May 2025 – present",
    title: "Graduate Software Engineer",
    org: "Boxfusion",
    detail:
      "Enterprise applications built on Shesha, Boxfusion's open-source .NET and Next.js framework. Domain modelling, application services, and the authorisation and workflow problems that come with systems in real use.",
  },
  {
    period: "2025 – present",
    title: "Backend and cloud focus",
    detail:
      "Deliberately moving deeper into .NET, enterprise architecture and Azure, while building personal projects that exercise the same ideas end to end.",
  },
] as const;
