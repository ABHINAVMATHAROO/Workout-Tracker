export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Triceps',
  'Biceps',
  'Shoulder',
  'Forearms',
  'Legs',
  'Core',
] as const

export const INTENSITIES = ['Beginner', 'Intermediate', 'Pro'] as const
export const REPS_PRESETS = ['5', '6-8', '8-10', '10-12', '12-15', '15-20', 'Max'] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]
export type Intensity = (typeof INTENSITIES)[number]
export type RepsPreset = (typeof REPS_PRESETS)[number]
export type LoadUnit = 'lb' | 'kg'
export type LoadType = 'bodyweight' | 'dumbbell' | 'machine'

export type PlanRegion = {
  area: string
  anatomicalName: string
  focus: string
}

export type PlanExerciseItem = {
  exercise: string
  equipment: string
  reps: string
  sets: number
  activatedRegion: string[]
  load: number
  loadUnit: LoadUnit
  loadType: LoadType
  setDetails: PlanExerciseSet[]
}

export type PlanExerciseSet = {
  repsPreset: RepsPreset
  load: number
  loadUnit: LoadUnit
  loadType: LoadType
}

export type TrainWorkoutPlan = {
  muscle: string
  regions: PlanRegion[]
  warmup: string[]
  focus: string
  mainExercises: PlanExerciseItem[]
  alternatives: PlanExerciseItem[]
  postWorkoutStretch: string[]
  source: 'preset' | 'unavailable'
}

export type GeneratedTrainWorkout = {
  muscleGroup: MuscleGroup
  intensity: Intensity
  planVariant: 'preset' | 'mine'
  plan: TrainWorkoutPlan
}

export type CustomExercise = {
  exercise: string
  equipment: string
  activatedRegion: string[]
  sets: number
  repsPreset: RepsPreset
  load: number
  loadUnit: LoadUnit
  loadType: LoadType
  setDetails: CustomExerciseSet[]
}

export type CustomExerciseSet = {
  repsPreset: RepsPreset
  load: number
  loadUnit: LoadUnit
  loadType: LoadType
}

export type CustomTrainRoutine = {
  userId: string
  muscleGroup: MuscleGroup
  variant: 'mine'
  baseIntensity: Intensity
  focus: string
  regions: PlanRegion[]
  mainExercises: CustomExercise[]
  warmup: string[]
  postWorkoutStretch: string[]
}

export type CoachMode = 'encourage' | 'roast'

export type CoachRuntimeState = 'idle' | 'starting' | 'running' | 'paused' | 'error'

export type CoachSettings = {
  mode: CoachMode
  intervalSeconds: number
  voice: string
  enabled: boolean
}
