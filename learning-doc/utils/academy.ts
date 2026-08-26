import { Monitor, Server, Database, Cpu, Smartphone, Globe } from "lucide-vue-next";

/**
 * The course registry is derived from what is actually on disk under
 * `content/courses/`. Every id here is a real directory, and every real
 * directory is here — `check-courses.mjs` in hygiene.yml enforces both
 * directions, because the previous version of this file described a
 * PocketBase schema that no longer existed and nothing noticed.
 */
export interface AcademyCourse {
    id: string;
    name: string;
    discipline: string;
    icon: string;
    color: string;
    desc: string;
}

export const academyDisciplines = [
    { id: 'backend', name: 'Backend & Systems', icon: Server, color: '6, 182, 212', desc: 'Scalable services, distributed logic, and high-performance APIs.' },
    { id: 'frontend', name: 'Frontend Architecture', icon: Monitor, color: '34, 211, 238', desc: 'Modern user interfaces, reactive state, and design systems.' },
    { id: 'systems', name: 'Low-Level Systems', icon: Cpu, color: '234, 88, 12', desc: 'Memory-safe languages, containers, and embedded hardware.' },
    { id: 'database', name: 'Data & Persistence', icon: Database, color: '239, 68, 68', desc: 'Caching layers, real-time syncing, and managed backends.' },
    { id: 'mobile', name: 'Mobile Development', icon: Smartphone, color: '168, 85, 247', desc: 'Cross-platform apps, native performance, and mobile UX.' },
    { id: 'global', name: 'Global Communications', icon: Globe, color: '59, 130, 246', desc: 'Language mastery for the global engineer.' },
];

export const academyCourses: AcademyCourse[] = [
    { id: 'fastapi',   name: 'FastAPI',       discipline: 'backend',  icon: 'logos:fastapi-icon',   color: '16, 185, 129', desc: 'Typed Python APIs with dependency injection and async I/O.' },
    { id: 'gin',       name: 'Go Gin',        discipline: 'backend',  icon: 'logos:go',             color: '6, 182, 212',  desc: 'HTTP routing, middleware and templating in Go.' },
    { id: 'golang',    name: 'Go',            discipline: 'backend',  icon: 'logos:go',             color: '6, 182, 212',  desc: 'The language itself: concurrency, interfaces and tooling.' },
    { id: 'nextjs',    name: 'Next.js',       discipline: 'frontend', icon: 'logos:nextjs-icon',    color: '37, 99, 235',  desc: 'App router, rendering strategies and data fetching.' },
    { id: 'rust',      name: 'Rust',          discipline: 'systems',  icon: 'logos:rust',           color: '234, 88, 12',  desc: 'Ownership, borrowing and fearless concurrency from scratch.' },
    { id: 'docker',    name: 'Docker',        discipline: 'systems',  icon: 'logos:docker-icon',    color: '37, 99, 235',  desc: 'Images, layers and the container lifecycle.' },
    { id: 'raspberry', name: 'Raspberry Pi',  discipline: 'systems',  icon: 'logos:raspberry-pi',   color: '239, 68, 68',  desc: 'Embedded Linux, GPIO and hardware projects.' },
    { id: 'redis',     name: 'Redis',         discipline: 'database', icon: 'logos:redis',          color: '239, 68, 68',  desc: 'Data structures, expiry and cache design.' },
    { id: 'supabase',  name: 'Supabase',      discipline: 'database', icon: 'logos:supabase-icon',  color: '16, 185, 129', desc: 'Postgres, row-level security and realtime subscriptions.' },
    { id: 'flutter',   name: 'Flutter',       discipline: 'mobile',   icon: 'logos:flutter',        color: '168, 85, 247', desc: 'Widget composition and cross-platform rendering.' },
    { id: 'korean',    name: 'Korean (KIIP)', discipline: 'global',   icon: 'circle-flags:kr',      color: '245, 158, 11', desc: 'KIIP curriculum, organised by book and exercise set.' },
];

export const courseById = (id: string): AcademyCourse | undefined =>
    academyCourses.find((c) => c.id === id);

export const coursesByDiscipline = (discipline: string): AcademyCourse[] =>
    academyCourses.filter((c) => c.discipline === discipline);

/**
 * Splits a content path into the parts the course UI needs.
 *
 * Ten of the eleven courses are flat — `/courses/rust/lesson_3`. `korean`
 * nests three levels deeper — `/courses/korean/kiip/tc1/tc1-book-v1/lesson_3`
 * — so anything between the course id and the lesson file is kept as a group
 * rather than assumed away.
 */
export interface LessonRef {
    course: string;
    group: string;
    lesson: string;
    order: number;
}

export function parseLessonPath(path: string): LessonRef | null {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] !== 'courses' || parts.length < 3) return null;

    const course = parts[1];
    const lesson = parts[parts.length - 1];
    const group = parts.slice(2, -1).join('/');
    const match = lesson.match(/(\d+)/);

    return {
        course,
        group,
        lesson,
        order: match ? parseInt(match[1], 10) : 0,
    };
}

export const formatSegment = (name: string) =>
    name
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
