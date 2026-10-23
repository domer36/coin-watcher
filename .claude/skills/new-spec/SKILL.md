---
name: new-spec
description: Creates a new specification (spec) for a project that follows a spec-driven development (SDD) workflow. Receives a short description of what the spec should cover, interviews the user to remove ambiguity, and then creates specs/NNN-slug/spec.md (status Draft) plus an empty tasks/ directory. Use this skill whenever the user says "new spec", "nueva spec", "crear spec", "create a specification", "quiero especificar una funcionalidad/MVP", or describes a feature or product they want to define before building it, even if they do not say the word "spec". Do NOT use it to create task files (that is create-tasks) or to implement code (that is task-implementation).
---

# new-spec

Turns a rough idea into a clear, reviewable specification. The spec is the source of truth of the project: code and tasks are derived from it, never the other way around.

This skill only **defines**. It never writes application code, never creates task files, and never marks a spec as Approved.

## Project conventions

```
specs/
└── NNN-slug/              e.g. 001-mvp-app/
    ├── spec.md            scope of the spec
    └── tasks/             task files (created later by create-tasks)
        └── T001-slug.md
```

- `NNN` is a zero-padded sequence (001, 002, ...). Next number = highest existing number in `specs/` + 1 (001 if `specs/` does not exist or is empty).
- `slug` is the title in lowercase, ASCII, words separated by hyphens (no spaces, no accents).
- Field names (Name, Status, Date, ...) stay in English. Write the content in the language the user is using.
- Spec statuses: `Draft` → `Approved` → `In progress` → `Implemented`. Only the human moves a spec from Draft to Approved.

## Workflow

### 1. Understand the input

Read the description the user gave. List internally what is already clear and what is missing. Look at `specs/` (if it exists) to detect related or overlapping specs and to compute the next number. Do not ask about anything the user already answered.

### 2. Interview to remove ambiguity

Ask clarifying questions before writing anything. Rules:

- Ask in rounds of at most 3-4 questions, most important first. Wait for the answers before the next round.
- Prefer concrete questions with suggested options ("A, B, or something else?") over open-ended ones.
- Cover, as far as they are relevant and not yet answered:
  - **Problem and users:** what problem it solves, for whom.
  - **Goals:** what must be true when this spec is done.
  - **Out of scope:** what must NOT be built in this spec.
  - **Requirements:** key behaviors, inputs/outputs, rules, edge cases, error cases.
  - **Constraints:** platform, language/stack preferences, integrations, data, performance, security.
  - **Acceptance:** how the user will decide the spec is satisfied.
  - **Dependencies:** other specs or external things this relies on.
- Do not invent answers. If the user does not know something, record it under **Open questions** instead of guessing.
- Stop interviewing when a developer could read the spec without having to ask anything important. Two or three rounds is usually enough; do not interrogate for the sake of it.

### 3. Confirm before writing

Show a short summary (title, description, goals, out of scope, main requirements, open questions) and ask the user to confirm or correct it. Only continue after confirmation.

### 4. Create the files

1. Get the current date and time with `date "+%Y-%m-%d %H:%M"` and use it in the Date field.
2. Create `specs/NNN-slug/`.
3. Create `specs/NNN-slug/spec.md` from the template below, with `Status: Draft`.
4. Create the empty directory `specs/NNN-slug/tasks/` with a `.gitkeep` file inside.
5. Do NOT create any task files.

### 5. Report

Tell the user which files were created and remind them of the next steps:

1. Review `spec.md` and edit whatever is wrong.
2. When satisfied, change `Status: Draft` to `Status: Approved` manually.
3. Then use `create-tasks` to generate the task files.

## spec.md template

```markdown
Name: <Title, e.g. 001 MVP APP>
Status: Draft
Date: <YYYY-MM-DD HH:MM>

## Description
<Two to four sentences: what this spec delivers and why.>

## Goals
- <Goal>

## Out of scope
- <What will NOT be done in this spec>

## Requirements
- R1: <Requirement, written so it can be verified>
- R2: <...>

## Acceptance criteria
- [ ] <Observable condition that shows the whole spec is satisfied>

## Technical notes
<Stack, constraints, integrations, relevant decisions. Write "None yet" if nothing is decided.>

## Open questions
- <Unresolved doubt, or "None">

## Proposed tasks
Outline only; the task files are created later by create-tasks.
- T001 - <Name>: <one-line description>
- T002 - <Name>: <one-line description>
```

## Quality checks before finishing

- Every requirement is specific and verifiable (no "fast", "nice", "easy" without a measurable meaning).
- Out of scope is not empty; if the user gave none, propose one or two exclusions and ask for confirmation.
- Proposed tasks cover every requirement and each can be implemented and tested on its own.
- Status is `Draft`.