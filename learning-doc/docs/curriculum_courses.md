# Course Curriculum Architecture & Implementation Standards

This document defines the "Principal Architect" standard for all learning tracks. Follow these logic and implementation rules to ensure technical density, zero-fluff delivery, and seamless integration with the automated exam system.

---

## 1. Course Structure (The Dynamic Roadmap)

Every course follows a roadmap defined in its **Lesson 0**.

Every course follows a roadmap defined in its **Lesson 0**.

### Lesson 0: The Command Center (Landing Page)

- **Purpose**: High-impact visual overview and prerequisites.
- **Top Section**: Title and a "Mission Statement" (Technical Mastery).
- **Prerequisites**: Use `::tip-item` components (no raw HTML wrappers).
- **Curriculum Roadmap**: Use `::custom-roadmap-card` with steps matching the course length.
  - *Note*: Titles should NOT include manual numbers (e.g., use "Ownership Mechanism" not "6. Ownership Mechanism").
- **Portfolio Section**: "What You'll Build" (checkmark list).
- **Tech Stack**: Markdown table of tools/languages/runtimes.

### Lessons 1–N: Technical Immersion

- **Length**: High technical density (typically 250+ lines of quality content).
- **Tone**: **Principal Architect** (Zero fluff, silicon-level mechanics).
  - *Note*: Do not use "Principal Architect" as a literal heading; it is the standard and tone.
- **Content Blocks**:
  - Deep dives into theory with architectural diagrams.
  - Practical implementation patterns (production-ready code).
  - "Master Insights" (Critical warnings/tips).
  - "Lesson Summary": A high-impact recap of core concepts (MANDATORY).
  - "Mastery Checklist": Actionable items to verify learning.
- **Rules**:
  - **No artificial padding**: Never repeat words or use word salad to reach a length.
  - **No meta-dialog**: Remove "Total Line Count" or "Admin Summary" markers.

### Final Lesson: The Forge (Exam)

- **Purpose**: Interactive certification and comprehensive review.
- **Note**: This is always the last file in the directory (e.g., if there are 40 lessons, this is `lesson_41.md`).
- **Components**:
  - `::course-exam{courseId="id" :totalLessons="N" courseName="Name"}`
- **Structure**:
  - Part 1: Technical Depth (Q&A).
  - Part 2: Architectural Design Challenge.
  - Part 3: Code Challenge (Typestate patterns/FFI/Concurrency).
  - Part 4: Strategic Ecosystem Analysis.
- **Backend**: Questions can be dynamic (fetched from PocketBase) or portable (defined in the `questions` prop within the markdown file for maximum reliability and offline support).

---

## 2. Technical Infrastructure

### UI Components (MDC)

- **Code Blocks**: Handled by `ProsePre.vue` and `ProseCode.vue`. Ensure language-aware highlighting.
- **Callouts**: Use `::tip-item`. **CRITICAL**: Never wrap MDC components inside raw HTML `<div>` tags (it breaks the Nuxt Content parser).
- **Roadmaps**: `::custom-roadmap-card` for Lesson 0.

### Backend (PocketBase)

- **Collection**: `exam_questions`
- **Fields**:
  - `course` (string) - e.g., "systems-rust"
  - `question` (text)
  - `answer` (text)
  - `options` (json) - for multiple choice
  - `difficulty` (number) - 1-10
  - `order_num` (number) - for sorting
- **Auth**: Public `list` and `view` permissions for guest access to exams.

---

## 3. Automation Strategy

To scale these standards across 14+ tracks, use the following automation logic:

### Content Expansion Script

When a lesson is too short (<350 lines), use a Python/Node script to:

1. Parse the core technical concepts.
2. Inject "Architectural Deep-Dives" or "Under-the-Hood" appendixes.
3. Validate the final line count using `wc -l`.

### Question Extraction & Seeding

For existing markdown Q&As:

1. Use a regex-based parser (`extract_qa.py`) to turn markdown headers/bold text into JSON.
2. Interface with PocketBase API (`_superusers` auth) to seed records.
3. Use `order_num` to maintain the logical flow from Lesson 1 to 40.

### Verification Flow

1. **Lint Check**: Surrounding headings with blank lines, no trailing spaces.
2. **Component Validation**: Ensure `::` syntax is correctly matched.
3. **Backend Sync**: Validate that questions are retrievable via `GET` before shipping.
