---
name: create-tasks
description: Breaks an APPROVED specification into task files for a spec-driven development workflow. Receives the path (or number/name) of a spec.md, refuses to continue unless its Status is Approved, proposes a task breakdown for the user to confirm, and then creates one file per task in the spec's tasks/ directory, each with its own git branch name defined (the branch itself is created later by task-implementation). Use this skill whenever the user says "create tasks", "crear tareas", "generar tareas", "desglosar la spec", "break down the spec", or points to a spec.md and wants the work split into tasks. Do NOT use it to write specs (new-spec) or to implement code (task-implementation).
---

# create-tasks

Turns an approved spec into small, independently testable task files. It only **plans**: it never writes application code, never creates git branches, never changes a spec's Status, and never marks tasks as started.

## Project conventions

```
specs/
└── NNN-slug/
    ├── spec.md
    └── tasks/
        ├── T001-slug.md
        └── T002-slug.md
```

- Task IDs are sequential and zero-padded per spec: `T001`, `T002`, ...
- Task file name: `T<ID>-<slug>.md` (slug in lowercase ASCII, words separated by hyphens).
- Task statuses: `pending` → `in progress` → `in review` → `completed`.
  - `in progress`: set by task-implementation when work starts.
  - `in review`: set by task-implementation when the implementation is finished locally and waits for the user's validation.
  - `completed`: set by the **user**, only after they commit, push, open the PR and merge it.
- Field names stay in English; write content in the language the user is using.
- **One branch per task.** Branch name: `task/<spec-number>-t<id>-<slug>`, for example `task/001-t001-creacion-de-interfaz`. The name is stored in the task file. The branch is created later by task-implementation, never here (see "Why branches are not created here").
- Committing, pushing, opening the Pull Request and merging are always manual steps by the user, after reviewing and validating the work. No skill does any of them.

## Workflow

### 1. Locate and validate the spec

1. Resolve the input to a `specs/NNN-slug/spec.md` file. The user may give a path, a number (`001`) or a name; if it is ambiguous or missing, list the specs in `specs/` and ask which one.
2. Read `spec.md` fully and read its `Status`.
3. Decide:
   - `Approved` → continue.
   - `In progress` → continue, but only to add tasks that are missing; never touch existing task files.
   - `Draft` → **stop.** Tell the user the spec must be reviewed and set to `Approved` first. Do not create anything.
   - `Implemented` → **stop.** Tell the user the spec is already implemented; changes need a new spec.
4. If `tasks/` already contains task files, list them and ask whether to add only the missing ones. Never overwrite or renumber existing files. New IDs continue after the highest existing ID.
5. If the spec has unresolved *Open questions* that block the work, mention them and ask the user whether to proceed or resolve them first.

### 2. Propose the breakdown

Use the spec's *Proposed tasks* as a starting point, then improve it. Good tasks are:

- **Small:** one task fits in one branch and one reviewable PR.
- **Independently testable:** it has its own acceptance checks.
- **Traceable:** each task lists which requirements (R1, R2...) it covers, and every requirement is covered by at least one task.
- **Ordered:** dependencies are explicit (`Depends on: T001`); avoid unnecessary dependencies so tasks can be done in any order when possible.
- **In scope:** nothing outside the spec's Goals; respect *Out of scope*.

Present the list as a short table (ID, name, one-line description, covers, depends on) and ask the user to confirm or adjust. If the breakdown reveals that the spec itself is wrong or incomplete, stop and tell the user to update the spec first rather than working around it.

### 3. Create the task files

After confirmation:

1. Get the date with `date "+%Y-%m-%d %H:%M"` (on Windows PowerShell: `Get-Date -Format "yyyy-MM-dd HH:mm"`).
2. For each task create `specs/NNN-slug/tasks/T<ID>-<slug>.md` from the template below, with `Status: pending`.
3. In `spec.md`, replace **only** the *Proposed tasks* section with a *Tasks* section that links to each task file (template below). Change nothing else in the spec, including its Status.
4. Remove `tasks/.gitkeep` if it exists and the directory now has files.
5. Do NOT run any git command that creates or switches branches.
6. Each task file should have a to do list for the implementation steps and a test list for verifiable acceptance checks. Each task must have at least two verifiable checks in *Test*.

### 4. Report

List the created files with their branch names, and remind the user of the next steps:

1. Review the task files and edit anything that is wrong.
2. Run `task-implementation` for one task at a time. It will create the task's local branch and implement it, leaving the changes uncommitted.
3. Review and validate the changes, then commit, push, open the PR and merge it manually, and finally set that task's Status to `completed`.

## Task file template

```markdown
Type: task
ID: T001
Name: <Task name>
Spec: <NNN-slug>
Status: pending
Date: <YYYY-MM-DD HH:MM>
Branch: task/<spec-number>-t001-<slug>
Depends on: - | T00X, T00Y
Covers: R1, R2

## Description
<What this task does and why, in two to four sentences.>

## To do
- [ ] <Concrete step>
- [ ] <Concrete step>

## Test (acceptance criteria)
- [ ] <Verifiable check>
- [ ] <Verifiable check>
```

## Tasks section for spec.md

```markdown
## Tasks
- [ ] [T001 - <Name>](tasks/T001-<slug>.md)
- [ ] [T002 - <Name>](tasks/T002-<slug>.md)
```

## Why branches are not created here

Creating all branches now would make them start from the same base commit, so a task that depends on another would not contain its code, and every branch would go stale as earlier PRs get merged. Instead, this skill fixes the branch **name** in each task file, and task-implementation creates the branch from the up-to-date base branch at the moment the task is actually implemented, after its dependencies have been merged.

## Quality checks before finishing

- Spec Status was `Approved` or `In progress`; no files were created otherwise.
- Every requirement is covered by at least one task; every task covers at least one requirement.
- Every task has at least two verifiable checks in *Test*.
- Dependencies contain no cycles.
- Every task has a unique branch name and Status `pending`.
- No existing task file was modified, overwritten, or renumbered.
- No git branches were created and no Status other than the new tasks' `pending` was set.