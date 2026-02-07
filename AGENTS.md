# Workout Tracker Agent Notes

## Project Summary
- Vite + React + TypeScript single-page app for tracking workouts.
- Firebase Auth (Google provider) + Firestore for user profiles and workouts.
- Weekly dashboard with goal tracking, per-day selection, and muscle group logging.

## Core Features Implemented
- Google sign-in, sign-out, and first-time profile creation flow.
- Weekly progress summary with goal slider and completion percentage.
- Week calendar with per-day selection and future-day lockout.
- Muscle group chips to toggle groups for the selected day.
- Weekly roll-up that lists groups hit with counts.
- Interactive muscle map component that toggles groups on click.
- Muscle map highlight is based on “worked this week.”

## Data Model (Firestore)
- Collection: `users`
- Document: `users/{uid}`
- Fields: `userId`, `email`, `name`, `photoUrl`, `createdAt`

- Collection: `workouts`
- Document id format: `{uid}_{yyyy-mm-dd}`
- Fields: `userId`, `date`, `muscleGroups`, `updatedAt`

## Muscle Groups
- `Chest`
- `Back`
- `Triceps`
- `Biceps`
- `Shoulder`
- `Forearms`
- `Legs`
- `Core`

## Key Files
- `src/App.tsx` main UI and data flow
- `src/firebase.ts` Firebase config and providers
- `src/MuscleMapSvg.tsx` interactive SVG muscle map with event delegation
- `src/styles.css` global styles and muscle map highlighting styles

## Muscle Map Notes
- Current SVG is a placeholder made of simple shapes.
- Each clickable region uses `data-group` to map to the 8 muscle groups.
- Highlighting uses `.worked` when a group is hit in the current week.
- Replace placeholder shapes with traced SVG paths from the provided PNG.

## Development
- Install and run with Vite scripts in `package.json`.
- Build output goes to `dist/`.
