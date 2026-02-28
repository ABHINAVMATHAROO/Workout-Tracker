import type { GeneratedTrainWorkout, Intensity, LoadType, LoadUnit, MuscleGroup, PlanExerciseItem, PlanRegion } from './types'

type RawStandardExercise = {
  exercise: string
  equipment: string
  reps: string
  sets: number
  activated_region?: string[]
  target?: string
  default_load?: {
    type?: LoadType
    value?: number
    unit?: LoadUnit
  }
}

type RawPlanBlock = {
  focus?: string
  main_exercises?: RawStandardExercise[]
  alternatives?: Array<RawStandardExercise | string>
}

type RawTemplate = {
  muscle?: string
  routine?: string
  regions?: Array<{ area: string; anatomical_name: string; focus: string }>
  warmup?: string[]
  plans?: {
    beginner?: RawPlanBlock
    intermediate?: RawPlanBlock
    hard?: RawPlanBlock
  }
  post_workout_stretch?: string[]
}

const mapIntensityKey = (intensity: Intensity) => {
  if (intensity === 'Beginner') return 'beginner' as const
  if (intensity === 'Intermediate') return 'intermediate' as const
  return 'hard' as const
}

const mapRegion = (region: { area: string; anatomical_name: string; focus: string }): PlanRegion => ({
  area: region.area,
  anatomicalName: region.anatomical_name,
  focus: region.focus,
})

const toRepsPreset = (reps: string) => {
  const normalized = reps.toLowerCase()
  if (normalized.includes('max')) return 'Max' as const
  if (normalized.includes('15')) return '15-20' as const
  if (normalized.includes('12')) return '12-15' as const
  if (normalized.includes('10')) return '10-12' as const
  if (normalized.includes('8')) return '8-10' as const
  if (normalized.includes('6')) return '6-8' as const
  return '5' as const
}

const inferLoadType = (equipment: string): LoadType => {
  const eq = equipment.toLowerCase()
  if (eq.includes('dumbbell') || eq.includes('dumbbells') || eq.includes(' db')) return 'dumbbell'
  if (eq.includes('bodyweight') || eq.includes('mat') || eq === 'bench') return 'bodyweight'
  if ((eq.includes('pull-up bar') || eq.includes('parallel bars')) && !eq.includes('belt')) return 'bodyweight'
  return 'machine'
}

const inferDefaultLoadByType = (loadType: LoadType, sets: number) => {
  if (loadType === 'bodyweight') return 0
  if (loadType === 'dumbbell') return sets >= 4 ? 35 : 25
  return sets >= 4 ? 95 : 65
}

const normalizeExercise = (exercise: RawStandardExercise): PlanExerciseItem => {
  const sets = typeof exercise.sets === 'number' ? exercise.sets : 0
  const loadType = exercise.default_load?.type ?? inferLoadType(exercise.equipment ?? '')
  const load = typeof exercise.default_load?.value === 'number'
    ? exercise.default_load.value
    : inferDefaultLoadByType(loadType, sets)
  const loadUnit = exercise.default_load?.unit === 'lb' ? 'lb' : 'kg'

  return {
    exercise: exercise.exercise,
    equipment: exercise.equipment ?? 'Unknown',
    reps: exercise.reps ?? '-',
    sets,
    activatedRegion: exercise.activated_region ?? (exercise.target ? [exercise.target] : []),
    load,
    loadUnit,
    loadType,
    setDetails: Array.from({ length: sets }, () => ({
      repsPreset: toRepsPreset(exercise.reps ?? '-'),
      load,
      loadUnit,
      loadType,
    })),
  }
}

const normalizeAlternative = (item: RawStandardExercise | string): PlanExerciseItem =>
  typeof item === 'string'
    ? {
        exercise: item,
        equipment: 'Alternative',
        reps: '-',
        sets: 0,
        activatedRegion: [],
        load: 0,
        loadUnit: 'kg',
        loadType: 'machine',
        setDetails: [],
      }
    : normalizeExercise(item)

const normalizeTemplate = (
  raw: RawTemplate,
  muscleGroup: MuscleGroup,
  intensity: Intensity
): GeneratedTrainWorkout | null => {
  if (!raw.plans) return null
  const planKey = mapIntensityKey(intensity)
  const plan = raw.plans[planKey]
  if (!plan?.main_exercises?.length) return null

  return {
    muscleGroup,
    intensity,
    planVariant: 'preset',
    plan: {
      muscle: raw.muscle ?? raw.routine ?? muscleGroup,
      regions: (raw.regions ?? []).map(mapRegion),
      warmup: raw.warmup ?? [],
      focus: plan.focus ?? 'Structured workout plan',
      mainExercises: plan.main_exercises.map(normalizeExercise),
      alternatives: (plan.alternatives ?? []).map(normalizeAlternative),
      postWorkoutStretch: raw.post_workout_stretch ?? [],
      source: 'preset',
    },
  }
}

const TEMPLATE_CANDIDATES: Record<MuscleGroup, string[]> = {
  Chest: ['chest.json', 'push.json'],
  Back: ['back.json', 'pull.json'],
  Triceps: ['triceps.json', 'push.json'],
  Biceps: ['biceps.json', 'pull.json'],
  Shoulder: ['shoulder.json', 'push.json', 'other.json'],
  Forearms: ['forearms.json', 'pull.json', 'other.json'],
  Legs: ['legs.json'],
  Core: ['core.json', 'other.json'],
}

const jsonModules = import.meta.glob('./data/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, RawTemplate>

const templatesByName = new Map<string, RawTemplate>()

Object.entries(jsonModules).forEach(([path, parsed]) => {
  const fileName = path.split('/').pop()
  if (!fileName) return
  templatesByName.set(fileName, parsed)
})

export const getPresetWorkout = (
  muscleGroup: MuscleGroup,
  intensity: Intensity
): GeneratedTrainWorkout | null => {
  const candidates = TEMPLATE_CANDIDATES[muscleGroup]
  for (const fileName of candidates) {
    const rawTemplate = templatesByName.get(fileName)
    if (!rawTemplate) continue
    const normalized = normalizeTemplate(rawTemplate, muscleGroup, intensity)
    if (normalized) {
      return normalized
    }
  }

  return null
}
