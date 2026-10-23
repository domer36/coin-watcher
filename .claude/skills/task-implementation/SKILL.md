---
name: task-implementation
description: Implements ONE task of a spec-driven development workflow on its own local git branch, leaving the changes uncommitted for the user to review. Receives a task file (path, ID like T001, or name), verifies the task is pending and its spec is Approved or In progress and its dependencies are completed, creates the task's local branch, implements the To do steps, runs the checks it can, and stops. It never commits, pushes, opens pull requests, or merges: those are manual steps for the user. Use this skill whenever the user says "implement task", "implementar tarea", "implementa T001", "ejecuta la tarea", or points to a task file under specs/*/tasks/ and wants it built. Do NOT use it to write specs (new-spec) or to create task files (create-tasks).
---

# task-implementation

Implements exactly one approved, unblocked task and hands the result to the user for validation.

## Hard rules

These are never negotiable, even if the user seems to imply otherwise in passing. If the user explicitly asks for one of these actions in this conversation, tell them it is outside this skill and let them do it themselves.

- **Never** run `git commit`, `git push`, `git merge`, `git rebase`, `git reset --hard`, `git stash`, `git add` (staging counts as preparing a commit), or any `gh pr` / pull-request command.
- **Never** change code outside the task's scope.
- **Never** edit `spec.md` requirements or other tasks' files. The only spec change allowed is its Status (see step 6).
- **Never** implement a task that fails the checks in step 2, and never "fix" a failed check by editing statuses.

Allowed git commands are read-only ones (`status`, `diff`, `log`, `branch`, `rev-parse`), `fetch`, and creating/switching to the task's local branch (`switch -c` / `checkout -b`, `switch`).

## Project conventions

```
specs/NNN-slug/
├── spec.md
└── tasks/T001-slug.md     fields: Type, ID, Name, Spec, Status, Date, Branch,
                           Depends on, Covers; sections: Description, To do, Test
```

Task statuses: `pending` → `in progress` → `in review` → `completed`.
- `in progress`: set by this skill when it starts.
- `in review`: set by this skill when the implementation is finished locally and waits for the user's validation.
- `completed`: set by the **user**, only after they commit, push, open the PR and merge it.

## Workflow

### 1. Locate the task

Resolve the input to one task file under `specs/*/tasks/`. If the input is ambiguous or missing (for example just `T001` when several specs have a T001), list the candidates and ask which one. Read the task file and its spec's `spec.md` fully.

### 2. Verify it can be implemented

Check all of these and stop at the first failure, explaining what is wrong and what the user must do:

1. Task `Status` is `pending`. If it is `in progress`, offer to resume it (continue on its existing branch). If `in review` or `completed`, stop: it is already implemented.
2. The spec `Status` is `Approved` or `In progress`. Any other value → stop.
3. Every task listed in `Depends on` has `Status: completed`. If one is not, stop and name it. Also, if git shows the dependency's branch is not merged into the base branch (`git branch --merged <base>`), warn the user before continuing.
4. The project is a git repository and the working tree is clean (`git status --porcelain` is empty). If there are uncommitted changes, stop and ask the user to commit or stash them; never do it for them.
5. The task has a `Branch:` value. If it is missing, stop and ask the user to fix the task file.

### 3. Prepare the branch

1. Determine the base branch (`main` or `master`; if unclear, ask the user).
2. Run `git fetch`. If the base branch is behind its remote, stop and ask the user to update it (never pull or merge yourself), because dependency PRs may already be merged there.
3. Create the task's branch from the base branch with the exact name in `Branch:` and switch to it.
4. If that branch already exists and the task is `pending`, stop and ask whether to resume on it or have the user delete it.

### 4. Mark the task as started

Set the task's `Status: in progress`. If the spec is `Approved`, set the spec's `Status: In progress`.

### 5. Implement

1. Follow the task's *To do* steps in order, doing only what the task and its *Description* describe.
2. Respect the spec's *Technical notes* and *Out of scope*.
3. Tick each *To do* checkbox (`- [x]`) as it is actually done.
4. If something needed is missing, ambiguous, or would require changing the spec or another task, stop, explain, and ask the user. Do not guess and do not expand the scope.
5. Do not add dependencies or files unrelated to the task without telling the user why.
6. Tick a *Test* checkbox **only** if you really verified it (ran the test suite, ran the command, inspected the output). Checks that need a human (visual inspection, subjective behavior, external services) stay unchecked and are listed for the user.

### 6. Finish

1. If all *To do* steps are done: set the task's `Status: in review`. If something remains or a blocker stopped the work, leave `in progress` and say why.
2. Do not mark the task as `completed` and do not set the spec to `Implemented`.
3. Do not commit or stage anything. Leave the changes in the working tree on the task branch.

### 7. Report to the user

Give a concise report:

- Branch name and the files created or modified.
- What was implemented, per *To do* step.
- Which *Test* checks were verified (and how) and which are still pending for manual validation.
- Any decision taken, assumption made, or deviation from the task.
- Next steps for the user, in this order:
  1. Review the diff (`git diff`) and validate the pending checks.
  2. If everything works: commit, push, open the PR, and merge it, all manually.
  3. After merging, set this task's `Status` to `completed` (and tick it in the spec's *Tasks* list).
  4. When every task is `completed`, set the spec's `Status` to `Implemented`.
- Optionally, a suggested commit message as plain text (do not run it).

## Quality checks before finishing

- Exactly one task was implemented, on its own branch.
- No commit, push, staging, merge, or PR command was run.
- Only the task's own *To do* and *Test* checkboxes, the task's Status, and (if needed) the spec's Status changed outside the code itself.
- Test checkboxes are ticked only for checks that were really verified.
- The report lists what the user still has to validate.