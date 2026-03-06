import type { MuscleGroup } from './types'

export const mapActiveRegionsToAreas = (
  muscleGroup: MuscleGroup | null,
  activeExerciseRegions: string[] | null | undefined
): string[] => {
  const group = (muscleGroup ?? '').trim().toLowerCase()
  if (!['chest', 'biceps', 'shoulder', 'triceps', 'back', 'legs'].includes(group)) {
    return []
  }
  return (activeExerciseRegions ?? []).reduce<string[]>((areas, entry) => {
    const normalized = entry.trim().toLowerCase()
    if (!normalized) return areas
    if (group === 'chest') {
      if (normalized.includes('all region')) return ['chest-upper', 'chest-mid', 'chest-lower']
      if (normalized.includes('upper')) areas.push('chest-upper')
      if (normalized.includes('mid') || normalized.includes('inner') || normalized.includes('outer')) {
        areas.push('chest-mid')
      }
      if (normalized.includes('lower')) areas.push('chest-lower')
      return areas
    }

    if (group === 'shoulder') {
      if (normalized.includes('all region')) return ['shoulder-front', 'shoulder-medial', 'shoulder-rear']
      if (normalized.includes('front')) areas.push('shoulder-front')
      if (normalized.includes('medial') || normalized.includes('lateral')) areas.push('shoulder-medial')
      if (normalized.includes('rear') || normalized.includes('posterior')) areas.push('shoulder-rear')
      return areas
    }

    if (group === 'triceps') {
      if (normalized.includes('all region')) return ['triceps-inner', 'triceps-outer', 'triceps-medial']
      if (normalized.includes('inner') || normalized.includes('long')) areas.push('triceps-inner')
      if (normalized.includes('outer') || normalized.includes('lateral')) areas.push('triceps-outer')
      if (normalized.includes('medial')) areas.push('triceps-medial')
      return areas
    }

    if (group === 'back') {
      if (normalized.includes('all region')) return ['back-lats', 'back-traps', 'back-rhomboids', 'back-erectors']
      if (normalized.includes('lat')) areas.push('back-lats')
      if (normalized.includes('trap')) areas.push('back-traps')
      if (normalized.includes('rhomboid')) areas.push('back-rhomboids')
      if (normalized.includes('erector') || normalized.includes('spinae') || normalized.includes('lower back')) {
        areas.push('back-erectors')
      }
      return areas
    }

    if (group === 'legs') {
      if (normalized.includes('all region')) {
        return ['legs-quads', 'legs-adductor', 'legs-glutes', 'legs-hamstring', 'legs-calves']
      }
      if (normalized.includes('quad')) areas.push('legs-quads')
      if (normalized.includes('adductor') || normalized.includes('inner thigh')) areas.push('legs-adductor')
      if (normalized.includes('glute')) areas.push('legs-glutes')
      if (normalized.includes('hamstring')) areas.push('legs-hamstring')
      if (normalized.includes('calf') || normalized.includes('calves')) areas.push('legs-calves')
      return areas
    }

    if (normalized.includes('all region')) return ['biceps-longhead', 'biceps-shorthead', 'biceps-brachialis']
    if (normalized.includes('long')) areas.push('biceps-longhead')
    if (normalized.includes('short')) areas.push('biceps-shorthead')
    if (normalized.includes('brachialis')) areas.push('biceps-brachialis')
    return areas
  }, [])
}
