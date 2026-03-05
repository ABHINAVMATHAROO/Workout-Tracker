import type { MuscleGroup } from './types'

export const mapActiveRegionsToAreas = (
  muscleGroup: MuscleGroup | null,
  activeExerciseRegions: string[] | null | undefined
): string[] => {
  if (muscleGroup !== 'Chest') return []
  return (activeExerciseRegions ?? []).reduce<string[]>((areas, entry) => {
    const normalized = entry.trim().toLowerCase()
    if (!normalized) return areas
    if (normalized.includes('all region')) return ['chest-upper', 'chest-mid', 'chest-lower']
    if (normalized.includes('upper')) areas.push('chest-upper')
    if (normalized.includes('mid') || normalized.includes('inner') || normalized.includes('outer')) {
      areas.push('chest-mid')
    }
    if (normalized.includes('lower')) areas.push('chest-lower')
    return areas
  }, [])
}
