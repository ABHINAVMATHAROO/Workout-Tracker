import type {
  CustomExercise,
  CustomTrainRoutine,
  GeneratedTrainWorkout,
  Intensity,
  LoadUnit,
  MuscleGroup,
  RepsPreset,
} from './types'

const REPS_PRESET_VALUES: Array<{ label: RepsPreset; midpoint: number }> = [
  { label: '5', midpoint: 5 },
  { label: '6-8', midpoint: 7 },
  { label: '8-10', midpoint: 9 },
  { label: '10-12', midpoint: 11 },
  { label: '12-15', midpoint: 13.5 },
  { label: '15-20', midpoint: 17.5 },
]

export const convertLoad = (value: number, from: LoadUnit, to: LoadUnit) => {
  if (!Number.isFinite(value) || value <= 0) return 0
  if (from === to) return value
  const converted = from === 'lb' ? value * 0.45359237 : value / 0.45359237
  const step = to === 'lb' ? 5 : 2.5
  return Math.max(0, Math.round(converted / step) * step)
}

export const resolveRepsPreset = (reps: string): RepsPreset => {
  const normalized = reps.trim().toLowerCase()
  if (normalized.includes('max')) return 'Max'
  if (normalized === '5') return '5'

  const match = normalized.match(/(\d+)(?:\s*-\s*(\d+))?/)
  if (!match) return '10-12'
  const first = Number(match[1])
  const second = match[2] ? Number(match[2]) : first
  const midpoint = (first + second) / 2

  let nearest = REPS_PRESET_VALUES[0]
  let delta = Math.abs(midpoint - nearest.midpoint)
  for (const candidate of REPS_PRESET_VALUES) {
    const currentDelta = Math.abs(midpoint - candidate.midpoint)
    if (currentDelta < delta) {
      delta = currentDelta
      nearest = candidate
    }
  }
  return nearest.label
}

export const fromPresetToCustomRoutine = (
  input: GeneratedTrainWorkout,
  userId: string,
  loadUnit: LoadUnit,
  muscleGroup: MuscleGroup,
  baseIntensity: Intensity
): CustomTrainRoutine => ({
  userId,
  muscleGroup,
  variant: 'mine',
  baseIntensity,
  focus: input.plan.focus,
  regions: input.plan.regions,
  mainExercises: input.plan.mainExercises.map<CustomExercise>((exercise) => ({
    exercise: exercise.exercise,
    equipment: exercise.equipment,
    activatedRegion: exercise.activatedRegion,
    sets: exercise.sets,
    repsPreset: resolveRepsPreset(exercise.reps),
    load: convertLoad(exercise.load, exercise.loadUnit, loadUnit),
    loadUnit,
    loadType: exercise.loadType ?? 'machine',
    setDetails:
      (exercise.setDetails ?? []).length > 0
        ? (exercise.setDetails ?? []).map((setDetail) => ({
            repsPreset: setDetail.repsPreset,
            load: convertLoad(setDetail.load, setDetail.loadUnit, loadUnit),
            loadUnit,
            loadType: setDetail.loadType ?? exercise.loadType ?? 'machine',
          }))
        : Array.from({ length: exercise.sets }, () => ({
            repsPreset: resolveRepsPreset(exercise.reps),
            load: convertLoad(exercise.load, exercise.loadUnit, loadUnit),
            loadUnit,
            loadType: exercise.loadType ?? 'machine',
          })),
  })),
  warmup: input.plan.warmup,
  postWorkoutStretch: input.plan.postWorkoutStretch,
})

export const fromCustomRoutineToWorkout = (
  routine: CustomTrainRoutine,
  intensity: Intensity
): GeneratedTrainWorkout => ({
  muscleGroup: routine.muscleGroup,
  intensity,
  planVariant: 'mine',
  plan: {
    muscle: routine.muscleGroup,
    regions: routine.regions,
    warmup: routine.warmup,
    focus: routine.focus,
    mainExercises: routine.mainExercises.map((exercise) => {
      const setDetails = (exercise.setDetails ?? []).length > 0
        ? (exercise.setDetails ?? [])
        : Array.from({ length: exercise.sets }, () => ({
            repsPreset: exercise.repsPreset,
            load: exercise.load,
            loadUnit: exercise.loadUnit,
            loadType: exercise.loadType ?? 'machine',
          }))
      const first = setDetails[0]
      const allSameReps = setDetails.every((setDetail) => setDetail.repsPreset === first?.repsPreset)
      const reps = allSameReps ? first?.repsPreset ?? exercise.repsPreset : 'Varied'
      return {
        exercise: exercise.exercise,
        equipment: exercise.equipment,
        reps,
        sets: setDetails.length,
        activatedRegion: exercise.activatedRegion,
        load: first?.load ?? exercise.load,
        loadUnit: first?.loadUnit ?? exercise.loadUnit,
        loadType: first?.loadType ?? exercise.loadType ?? 'machine',
        setDetails: setDetails.map((setDetail) => ({
          repsPreset: setDetail.repsPreset,
          load: setDetail.load,
          loadUnit: setDetail.loadUnit,
          loadType: setDetail.loadType ?? exercise.loadType ?? 'machine',
        })),
      }
    }),
    alternatives: [],
    postWorkoutStretch: routine.postWorkoutStretch,
    source: 'preset',
  },
})
