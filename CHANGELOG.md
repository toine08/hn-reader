# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-03-04

### New Features

#### Right-Hand Mode
- Added a **Right-Hand Mode** setting for easier one-handed use.
- When enabled, action buttons and comment threading indicators are mirrored to the right side of the screen.
- The preference is persisted across sessions using `AsyncStorage`.
- Toggle is accessible from the Settings screen.

#### Improved Comments Modal
- Redesigned the comments modal with a cleaner layout and improved visual hierarchy.
- Nested comments now display vertical and horizontal connecting lines to make threading easier to follow.
- Reply threads can be expanded or collapsed individually.
- Right-Hand Mode is fully supported in the comments view — indentation and connecting lines mirror to the right when enabled.
- Added a proper empty-state view when a story has no comments.
- Improved loading indicators showing the number of comments loaded out of the total.
- Comments are loaded in batches of 10 and additional comments can be fetched by scrolling to the bottom (pagination).

### Improvements

#### Expo SDK 55 Migration
- Migrated the project to **Expo SDK 55**, bringing performance improvements and updated dependencies.
- Updated `metro.config.js` to use the latest Expo Metro configuration.

#### UI Consistency & Branding
- Updated button styles across `ListItem`, `NewsletterForm`, `OfflineReader`, and `Toast` components for a more cohesive look.
- Replaced blue accent colours with orange to match the app's branding.
- Switched action buttons in list views to icon-only buttons for a cleaner appearance.

#### Performance & Stability
- Introduced `fetchCommentsByIds` utility function to streamline comment fetching and caching.
- Added new `PROBLEMATIC_PATTERNS` for filtering offline content to improve display quality.
- Dependency upgrades for better stability and performance.

---

## What Changed Since December 2025

The December 2025 commit (`a24ddeb4`) was the last change before the features below were merged into the release. The following was added between that commit and the **1.2.0** tag:

| Area | Change |
|---|---|
| Accessibility | Right-Hand Mode setting with persistent preference |
| Comments | Full modal redesign with threaded view, pagination, and right-hand mode support |
| SDK | Expo SDK 55 migration |
| UI | Orange accent colour applied consistently across all interactive elements |
| Performance | Batched comment loading and improved caching utilities |
