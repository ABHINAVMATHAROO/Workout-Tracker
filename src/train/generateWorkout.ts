import { getPresetWorkout } from './presetPlans'
import type { GeneratedTrainWorkout, Intensity, MuscleGroup } from './types'

type GenerateWorkoutInput = {
  muscleGroup: MuscleGroup
  intensity: Intensity
}

export const generateWorkout = ({ muscleGroup, intensity }: GenerateWorkoutInput): GeneratedTrainWorkout => {
  const preset = getPresetWorkout(muscleGroup, intensity)
  if (preset) {
    return preset
  }

  return {
    muscleGroup,
    intensity,
    plan: {
      muscle: muscleGroup,
      regions: [],
      warmup: [],
      focus: 'Sorry, we are working on it.',
      mainExercises: [],
      alternatives: [],
      postWorkoutStretch: [],
      source: 'unavailable',
    },
  }
}
