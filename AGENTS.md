# Workout Tracker Agent Notes

## Project Summary
- Vite + React + TypeScript single-page app for tracking workouts.
- Firebase Auth (Google provider) + Firestore for user profiles and workouts.
- Weekly dashboard with goal tracking, per-day selection, and muscle group logging.
- Train mode supports preset generation plus user-customized routines with per-set editing.

## Core Features Implemented
- Google sign-in, sign-out, and first-time profile creation flow.
- Weekly progress summary with goal slider and completion percentage.
- Week calendar with per-day selection and future-day lockout.
- Muscle group chips to toggle groups for the selected day.
- Weekly roll-up that lists groups hit with counts.
- Interactive muscle map component that toggles groups on click.
- Muscle map highlight is based on "worked this week."
- Train mode with muscle selection + intensity selection.
- Custom per-user train routines auto-load as `Mine` when available.
- Accordion-based exercise editor with per-set reps/load editing and add/remove set support.
- Warm-up and stretch are editable accordions with selectable chips.

## Data Model (Firestore)
- Collection: `users`
- Document: `users/{uid}`
- Fields: `userId`, `email`, `name`, `photoUrl`, `createdAt`
- Optional fields: `trainPreferences.loadUnit`, `coachSettings.*`, streak fields

- Collection: `workouts`
- Document id format: `{uid}_{yyyy-mm-dd}`
- Fields: `userId`, `date`, `muscleGroups`, `updatedAt`

- Subcollection: `users/{uid}/trainRoutines`
- Document id: `{muscleGroup}` (one custom routine per user per muscle group)
- Fields:
  - `userId`
  - `muscleGroup`
  - `variant` (`mine`)
  - `baseIntensity` (`Beginner` | `Intermediate` | `Pro`)
  - `focus`
  - `regions[]` (`area`, `anatomicalName`, `focus`)
  - `mainExercises[]`:
    - `exercise`
    - `equipment`
    - `activatedRegion[]`
    - `sets`
    - `repsPreset`
    - `load`
    - `loadUnit`
    - `setDetails[]`:
      - `repsPreset`
      - `load`
      - `loadUnit`
  - `warmup[]`
  - `postWorkoutStretch[]`
  - `createdAt`
  - `updatedAt`

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
- `src/train/TrainModeView.tsx` train-mode orchestration and persistence wiring
- `src/train/components/TrainPlanCard.tsx` accordion UI for exercise/set editing
- `src/train/trainRoutineStore.ts` Firestore reads/writes for custom routines and load unit
- `src/train/routineMapper.ts` preset<->custom routine mapping and normalization

## Muscle Map Notes
- Current SVG is a placeholder made of simple shapes.
- Each clickable region uses `data-group` to map to the 8 muscle groups.
- Highlighting uses `.worked` when a group is hit in the current week.
- Replace placeholder shapes with traced SVG paths from the provided PNG.

## Development
- Install and run with Vite scripts in `package.json`.
- Build output goes to `dist/`.
