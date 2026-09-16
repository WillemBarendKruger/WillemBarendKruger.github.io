import type { SkillGroup } from "./types";

export const skillGroups: readonly SkillGroup[] = [
  {
    id: "primary-arcana",
    title: "Primary Arcana",
    blurb: "Backend work — where most of my time goes.",
    skills: ["C#", ".NET 8", "ASP.NET Core", "ABP Framework", "REST APIs", "Entity Framework", "PostgreSQL", "SQL Server"],
  },
  {
    id: "web-arcana",
    title: "Web Arcana",
    blurb: "The interfaces those systems are used through.",
    skills: ["TypeScript", "React", "Next.js", "JavaScript", "Ant Design", "HTML", "CSS"],
  },
  {
    id: "cloud-arcana",
    title: "Cloud Arcana",
    blurb: "Shipping and running what gets built. Actively growing.",
    skills: ["Azure", "GitHub Actions", "Docker", "Vercel"],
  },
  {
    id: "arsenal",
    title: "Developer Arsenal",
    blurb: "Daily tools.",
    skills: ["Git", "GitHub", "VS Code", "Visual Studio", "Postman", "Bash"],
  },
] as const;
