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

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]
export type Intensity = (typeof INTENSITIES)[number]

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
  plan: TrainWorkoutPlan
}

export type CoachMode = 'encourage' | 'roast'

export type CoachRuntimeState = 'idle' | 'starting' | 'running' | 'paused' | 'error'

export type CoachSettings = {
  mode: CoachMode
  intervalSeconds: number
  voice: string
  enabled: boolean
}
