# GitHub Change Records

Use GitHub workflow files to make history maintenance part of normal code review.

## Pull request template checklist

A good pull request template should ask for:

- Summary.
- Change type.
- Linked issue or record.
- Changelog updated.
- History record created.
- ADR created when an architecture decision was made.
- Migration note created when data, configuration, runtime, or package structure changed.
- API note created when public contracts changed.
- Deployment note created when build, hosting, or environment behavior changed.
- Verification steps.
- Risk and rollback.
- Screenshots or logs when UI or behavior changed.

## Issue template checklist

A change-record issue template should ask for:

- Requested change.
- Reason.
- Affected files or systems.
- Expected documentation records.
- Verification expectation.
- Release or deployment impact.

## Recommended hook

Use a pre-push hook for teams that want documentation discipline without blocking every work-in-progress commit.

Use a pre-commit hook only when every commit is expected to be review-ready.
