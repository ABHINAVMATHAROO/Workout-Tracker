export type VoiceCommandOutcome =
  | { ok: true; transcript: string }
  | { ok: false; reason: string }

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null
  onerror: (() => void) | null
  onnomatch: (() => void) | null
  start: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null
  const candidate = (
    window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
  ).SpeechRecognition ??
    (
      window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructor
        webkitSpeechRecognition?: SpeechRecognitionConstructor
      }
    ).webkitSpeechRecognition
  return candidate ?? null
}

export const isVoiceCommandAvailable = () => getSpeechRecognitionConstructor() !== null

export const listenForVoiceCommand = async (): Promise<VoiceCommandOutcome> => {
  const Recognition = getSpeechRecognitionConstructor()
  if (!Recognition) {
    return { ok: false, reason: 'Voice command is unavailable on this browser/device.' }
  }

  return new Promise<VoiceCommandOutcome>((resolve) => {
    const recognition = new Recognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 3

    recognition.onresult = (event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? ''
      if (!transcript) {
        resolve({ ok: false, reason: 'I could not hear a clear command. Try again.' })
        return
      }
      resolve({ ok: true, transcript })
    }

    recognition.onerror = () => {
      resolve({ ok: false, reason: 'Voice command failed. Use manual controls for now.' })
    }

    recognition.onnomatch = () => {
      resolve({ ok: false, reason: 'No matching command heard. Try saying "what is next".' })
    }

    recognition.start()
  })
}

export type VoiceIntent = 'read_next_exercise' | 'freeform'

export const parseVoiceIntent = (transcript: string): VoiceIntent => {
  const normalized = transcript.toLowerCase().replace(/[^\w\s]/g, ' ')

  const shouldReadExercise =
    normalized.includes('what next') ||
    normalized.includes('what is next') ||
    normalized.includes('whats next') ||
    normalized.includes('next exercise') ||
    normalized.includes('read next') ||
    normalized.includes('read exercise') ||
    normalized.includes('next move')

  return shouldReadExercise ? 'read_next_exercise' : 'freeform'
}
