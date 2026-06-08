# Changelog Maintenance Policy

Use `CHANGELOG.md` as the short public index of important changes.

## Default shape

```markdown
# Changelog

All notable changes to this project are documented in this file.

## Unreleased

### Added

### Changed

### Fixed

### Security
```

## Entry style

- Use one concise bullet per notable change.
- Link to detailed history records when possible.
- Keep implementation details in `docs/history` unless the detail affects users, deployers, or maintainers.
- Put breaking changes near the top of the relevant release section.
- Use clear labels for migration, deployment, security, and API changes.

## Sections

Use these sections when relevant:

- Added
- Changed
- Deprecated
- Removed
- Fixed
- Security
- Migration
- Deployment
- Documentation

## Release promotion

When cutting a release, move `Unreleased` entries into a dated version section and create fresh empty headings for the next changes.
