import { Monitor, Server, Database, Cpu, PencilRuler, Smartphone, Globe } from "lucide-vue-next";

export const academyDisciplines = [
    { id: 'frontend', name: 'Frontend Architecture', icon: Monitor, color: '34, 211, 238', desc: 'Modern user interfaces, reactive state, and design systems.' },
    { id: 'backend', name: 'Backend & Systems', icon: Server, color: '6, 182, 212', desc: 'Scalable services, distributed logic, and high-performance APIs.' },
    { id: 'database', name: 'Database Management', icon: Database, color: '239, 68, 68', desc: 'Data persistence, caching layers, and real-time syncing.' },
    { id: 'systems', name: 'Low-Level Systems', icon: Cpu, color: '234, 88, 12', desc: 'Rust, Docker, and embedded hardware engineering.' },
    { id: 'general', name: 'Core Engineering', icon: PencilRuler, color: '251, 191, 36', desc: 'Software patterns, DSA, and technical architecture.' },
    { id: 'mobile', name: 'Mobile Development', icon: Smartphone, color: '168, 85, 247', desc: 'Cross-platform apps, native performance, and mobile UX.' },
    { id: 'global', name: 'Global Communications', icon: Globe, color: '59, 130, 246', desc: 'Language mastery for the global engineer.' },
];

export const techIcons: Record<string, string> = {
    rust: "logos:rust",
    golang: "logos:go",
    dsa: "lucide:brain",
    reactjs: "logos:react",
    kotlin: "logos:kotlin-icon",
    turkish: "circle-flags:tr",
    korean: "circle-flags:kr",
    "software-engineering": "lucide:layers",
    nodejs: "logos:nodejs-icon",
    nestjs: "logos:nestjs",
    docker: "logos:docker-icon",
    redis: "logos:redis",
    fastapi: "logos:fastapi-icon",
    gin: "logos:go",
    raspberry: "logos:raspberry-pi",
    supabase: "logos:supabase-icon",
    clang: "logos:c",
};

export const premiumTools = [
    "software-engineering",
    "nodejs",
    "rust",
];

export const techColors: Record<string, string> = {
    rust: "234, 88, 12",
    golang: "6, 182, 212",
    dsa: "147, 51, 234",
    docker: "37, 99, 235",
    fastapi: "16, 185, 129",
    gin: "6, 182, 212",
    redis: "239, 68, 68",
    korean: "245, 158, 11",
    reactjs: "34, 211, 238",
    kotlin: "168, 85, 247",
    turkish: "239, 68, 68",
    "software-engineering": "251, 191, 36",
    nodejs: "104, 160, 99",
    nestjs: "224, 35, 78",
    raspberry: "239, 68, 68",
    supabase: "16, 185, 129",
};
