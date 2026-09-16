import type { Project } from "./types";
import { validateProjects } from "./validate";

export const projects: readonly Project[] = [
  {
    slug: "apex-it",
    name: "Apex IT",
    tagline: "Office equipment management for organisations — cataloguing, condition reporting and AI-assisted troubleshooting.",
    featured: true,
    status: "in-progress",
    collaboration: "solo",
    technologies: ["C#", ".NET 8", "ABP Framework", "Next.js", "TypeScript", "Ant Design", "PostgreSQL", "Docker", "GitHub Actions"],
    links: { source: "https://github.com/WillemBarendKruger/Apex-IT" },
    caseStudy: {
      problem:
        "Organisations lose track of their equipment. Who has which laptop, what condition it is in, and what happened the last time it broke are usually spread across spreadsheets and memory. I wanted to build the full path — from cataloguing an asset to reporting a fault to getting a useful answer back.",
      architecture: [
        { layer: "Frontend", detail: "Next.js 15 with TypeScript and Ant Design" },
        { layer: "Backend", detail: "ASP.NET Boilerplate (ABP v9) on .NET 8" },
        { layer: "Database", detail: "PostgreSQL" },
        { layer: "Authentication", detail: "JWT, with role-based access separating supervisors from employees" },
        { layer: "External services", detail: "SendGrid for transactional email; Google Gemini for image and text analysis" },
        { layer: "Delivery", detail: "Docker images for backend and frontend; GitHub Actions builds both on every push and pull request" },
      ],
      features: [
        "Catalogue and categorise equipment — PCs, printers, projectors",
        "Track status, usage and location",
        "Submit and track condition reports",
        "Role-based access for supervisors and employees",
        "JWT authentication",
        "Email notifications via SendGrid",
        "AI troubleshooting chatbot accepting both images and text, backed by Google Gemini",
        "Image upload for fault reporting",
      ],
      planned: [
        "Automated tests running in CI — the workflow builds, but the test step is not yet enabled",
        "A deployment step — CI stops at build; there is no CD yet",
        "Moving the Gemini API key behind a backend route instead of the client bundle",
      ],
      learned:
        "Most of what I learned was about boundaries. ABP gives you a lot of structure, and the work is deciding what belongs in the domain layer versus the application layer rather than writing plumbing. The AI feature taught me a harder lesson: calling Gemini from the client was the fastest way to make it work and the wrong way to ship it, because it puts the API key in the browser bundle. Knowing why that is wrong is worth more than the feature.",
    },
  },
  {
    slug: "potholio",
    name: "Potholio",
    tagline: "Full-stack pothole reporting and municipality management, built with a team.",
    featured: true,
    status: "archived",
    collaboration: "team",
    technologies: ["C#", ".NET", "Next.js", "TypeScript", "Docker"],
    links: { source: "https://github.com/Anroux11/Potholio" },
    attribution: "Team project. 48 of 207 commits are mine, across 126 merged pull requests. The repository is hosted on a teammate's account.",
    caseStudy: {
      problem:
        "Reporting a pothole to a municipality usually means it disappears into an inbox. The team built a system where a report becomes a tracked incident with a state, an owner and a history.",
      architecture: [
        { layer: "Frontend", detail: "Next.js with TypeScript" },
        { layer: "Backend", detail: ".NET, split into Application, Core and Web.Host projects" },
        { layer: "Delivery", detail: "Docker Compose for local orchestration" },
      ],
      features: [
        "User registration and authentication",
        "Incident reporting and tracking",
        "Municipality management",
      ],
      planned: [],
      learned:
        "This was the first codebase I worked in where my changes could break someone else's. Two hundred commits and a hundred and twenty-six pull requests later, the parts that mattered were the boring ones: keeping branches small enough to review, writing a description someone else could act on, and resolving conflicts without flattening a teammate's work.",
    },
  },
  {
    slug: "fitfusion",
    name: "FitFusion",
    tagline: "A platform where personal trainers manage clients, meal plans and nutrition.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["Next.js", "TypeScript", "React"],
    links: { source: "https://github.com/WillemBarendKruger/graduate-frontend-project-personal-trainer-platform" },
  },
  {
    slug: "developer-dashboard",
    name: "React Developer Dashboard",
    tagline: "Search, browse and favourite GitHub developers. Built to a Figma design.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["React", "TypeScript", "Vite", "GitHub API"],
    links: { source: "https://github.com/WillemBarendKruger/React-Developer-Dashboard" },
  },
  {
    slug: "it-asset-management",
    name: "IT Asset Management",
    tagline: "Asset tracking on Shesha — domain modelling and specification-based filtering.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["C#", ".NET", "Shesha", "Next.js", "PostgreSQL"],
    links: { source: "https://github.com/WillemBarendKruger/itassetmanagent" },
  },
  {
    slug: "ride-along",
    name: "Ride-Along",
    tagline: "A C# ride-sharing simulation exercising interfaces, abstract classes and a rating service.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["C#", ".NET"],
    links: { source: "https://github.com/WillemBarendKruger/Ride-Along-Ride-Sharing-System" },
  },
  {
    slug: "song-searcher",
    name: "NodeJS Song Searcher",
    tagline: "A terminal application that searches for songs by name. University coursework, 2022.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["JavaScript", "Node.js"],
    links: { source: "https://github.com/WillemBarendKruger/WPR371_Assignment1" },
    image: "/images/wpr371-song-search.gif",
  },
  {
    slug: "employee-management",
    name: "Employee Management System",
    tagline: "A C# Windows application for creating, editing and deleting employee records. University coursework.",
    featured: false,
    status: "archived",
    collaboration: "solo",
    technologies: ["C#", ".NET"],
    links: { source: "https://github.com/WillemBarendKruger/Employee-management-system-Project" },
    image: "/images/employee-management.png",
  },
  {
    slug: "sen371-service-platform",
    name: "SEN371 Service Platform",
    tagline: "A multi-service web application with separate client and technician experiences. University team project.",
    featured: false,
    status: "archived",
    collaboration: "team",
    technologies: ["JavaScript", "HTML", "CSS"],
    links: { source: "https://github.com/HenryG-code/SEN371-project" },
    attribution: "University team project. The repository is hosted on a teammate's account.",
    image: "/images/sen371-web-app.png",
  },
] as const;

// Runs at import time, so `next build` fails on malformed content.
validateProjects(projects);

export const featuredProjects = projects.filter((project) => project.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
