import type { CoachMode } from './types'

type ManifestClip = {
  id: string
  line: string
  file: string
}

type ManifestReadoutEntry = {
  line?: string
  file: string
}

type CoachAudioManifest = {
  modes: {
    encourage: {
      periodic: ManifestClip[]
      freeform: ManifestClip[]
    }
    roast: {
      periodic: ManifestClip[]
      freeform: ManifestClip[]
    }
  }
  exerciseReadouts?: {
    default?: ManifestReadoutEntry
    byExercise?: Record<string, ManifestReadoutEntry>
  }
}

export type CoachSelection = {
  line: string
  audioUrl?: string
  clipId?: string
}

let manifestPromise: Promise<CoachAudioManifest | null> | null = null

const loadManifest = async () => {
  if (manifestPromise) return manifestPromise
  manifestPromise = (async () => {
    try {
      const manifestUrl = `${import.meta.env.BASE_URL}coach-audio/manifest.json`
      const response = await fetch(manifestUrl, { cache: 'no-cache' })
      if (!response.ok) return null
      return (await response.json()) as CoachAudioManifest
    } catch {
      return null
    }
  })()
  return manifestPromise
}

const toPublicAudioUrl = (relativeFilePath: string) =>
  `${import.meta.env.BASE_URL}coach-audio/${relativeFilePath.replace(/^\/+/, '')}`

const pickFromPool = (pool: ManifestClip[], excludedIds: string[]): ManifestClip | null => {
  if (pool.length === 0) return null
  const candidates = pool.filter((clip) => !excludedIds.includes(clip.id))
  const source = candidates.length > 0 ? candidates : pool
  const index = Math.floor(Math.random() * source.length)
  return source[index] ?? null
}

export const selectCoachLine = async (params: {
  mode: CoachMode
  intent: 'periodic' | 'freeform'
  excludedClipIds: string[]
}): Promise<CoachSelection | null> => {
  const manifest = await loadManifest()
  if (!manifest) return null

  const modePool = manifest.modes[params.mode]
  const clips = params.intent === 'freeform' ? modePool.freeform : modePool.periodic
  const clip = pickFromPool(clips, params.excludedClipIds)
  if (!clip) return null

  return {
    line: clip.line,
    audioUrl: clip.file ? toPublicAudioUrl(clip.file) : undefined,
    clipId: clip.id,
  }
}

export const selectExerciseReadout = async (exerciseName: string): Promise<CoachSelection | null> => {
  const manifest = await loadManifest()
  if (!manifest?.exerciseReadouts) return null

  const direct = manifest.exerciseReadouts.byExercise?.[exerciseName]
  const fallback = manifest.exerciseReadouts.default
  const chosen = direct ?? fallback
  if (!chosen) return null

  return {
    line: chosen.line ?? '',
    audioUrl: chosen.file ? toPublicAudioUrl(chosen.file) : undefined,
  }
}
