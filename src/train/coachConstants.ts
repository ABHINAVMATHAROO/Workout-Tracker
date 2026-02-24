import type { CoachMode, CoachSettings } from './types'

export const DEFAULT_COACH_SETTINGS: CoachSettings = {
  mode: 'roast',
  intervalSeconds: 75,
  voice: '84Fal4DSXWfp7nJ8emqQ',
  enabled: false,
}

const ENCOURAGE_FALLBACK_LINES = [
  'Strong set. Keep your breathing steady and stay locked in.',
  'You are moving well. Smooth reps and clean control.',
  'Stay patient through the hard reps. You are building real strength.',
  'Keep the tempo sharp. Finish this block with intent.',
]

const ROAST_FALLBACK_LINES = [
  'That all you got? Add intent and move the weight like you mean it.',
  'No autopilot. Own this next set and stop negotiating.',
  'You wanted results, not excuses. Lift with conviction.',
  'Wake up. Crisp reps and zero lazy form.',
]

export const getFallbackLine = (mode: CoachMode, seed: number) => {
  const lines = mode === 'roast' ? ROAST_FALLBACK_LINES : ENCOURAGE_FALLBACK_LINES
  const index = Math.abs(seed) % lines.length
  return lines[index]
}
