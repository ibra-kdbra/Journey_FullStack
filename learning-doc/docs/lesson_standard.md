# Lesson Pattern Standard (Systems Architect)

This template serves as the "Principal Architect" standard for all curriculum files. It ensures high technical density, consistent structure, and premium UI integration.

---

## 1. Structure
All lessons must begin with a level 1 header (`# Lesson X: Title`). This header is used by the LMS for navigation and SEO.

## 2. Introduction

Start with a high-impact paragraph defining the "Physics" of the topic.
> **The Physic**: Explain why this matters at the system level (latency, memory, throughput).

## 3. Core Technical Content

Use headers `##` for major sections.

### Sub-headers `###` for depth

- Use `::tip-item` for critical master insights.
- Use code blocks with language identifiers.
- Use Mermaid diagrams for architecture flows.

## 4. Implementation Laboratory

Provide production-grade code examples.

- Include comments explaining the "Why" behind the implementation.
- Focus on zero-copy, concurrency-safe, and performant patterns.

## 5. Lesson Summary (Keep)

```markdown
## Summary for the [Course Name] Architect

[A high-density recap of what was learned and why it matters for a Systems Architect.]
```

## 6. Mastery Checklist

```markdown
- [ ] **[Skill 1]**: I understand the difference between X and Y at the binary level.
- [ ] **[Skill 2]**: I can implement the Z pattern without introducing lock contention.
```

---

## 7. Forbidden Elements (REMOVE)

- **Word Salad**: Repeating adverbs (e.g., "securely securely").
- **Meta-dialog**: "Total line count", "Summary for the admin".
- **Raw HTML**: Use MDC components (`::`) instead of `<div>` or `<span>`.

## 8. Final Lesson (Exam)

The last lesson in the directory must contain:

```markdown
::course-exam{courseId="[track-id]" :totalLessons="[N]" courseName="[Full Name]" :questions='[...]'}
::
```
