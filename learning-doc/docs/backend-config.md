# PocketBase Backend Configuration Guide

This guide outlines the required collections and rules for the local development backend.

## 1. `users_tbl` (Auth Collection)

Rename the default `users` collection or create a new one.

### Fields

| Field      | Type  | Required | Options            |
| ---------- | ----- | -------- | ------------------ |
| `username` | text  | Yes      | unique             |
| `email`    | email | Yes      | unique             |
| `name`     | text  | No       |                    |
| `avatar`   | file  | No       | single, image only |
| `status`   | bool  | No       | default: false     |

### API Rules

| Action      | Rule                    |
| ----------- | ----------------------- |
| List/Search | `id = @request.auth.id` |
| View        | `id = @request.auth.id` |
| Create      | `Everyone` (Empty)      |
| Update      | `id = @request.auth.id` |
| Delete      | `id = @request.auth.id` |

---

## 2. `doc_comments_tbl` (Base Collection)

### Fields

| Field         | Type     | Required | Description                                      |
| ------------- | -------- | -------- | ------------------------------------------------ |
| `doc_path`    | text     | Yes      | Stores lesson URL (e.g. `courses/rust/lesson_0`) |
| `content`     | text     | Yes      | The comment message                              |
| `author_id`   | relation | Yes      | collection: `users_tbl`, single                  |
| `author_name` | text     | Yes      | Cached username for display                      |

### API Rules

| Action      | Rule                           |
| ----------- | ------------------------------ |
| List/Search | `Everyone` (Empty)             |
| View        | `Everyone` (Empty)             |
| Create      | `@request.auth.id != ""`       |
| Update      | `author_id = @request.auth.id` |
| Delete      | `author_id = @request.auth.id` |
