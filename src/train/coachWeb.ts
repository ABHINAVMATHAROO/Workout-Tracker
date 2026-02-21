export type CoachSpeakResult = {
  spoken: boolean
  reason?: string
}

export type CoachWeb = {
  start: () => Promise<boolean>
  speak: (text: string) => Promise<CoachSpeakResult>
  stop: () => void
  isAvailable: () => boolean
}

const hasSpeechSynthesis = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

export const createCoachWeb = (): CoachWeb => {
  let started = false

  const isAvailable = () => hasSpeechSynthesis()

  const start = async () => {
    started = true
    return isAvailable()
  }

  const speak = async (text: string): Promise<CoachSpeakResult> => {
    if (!isAvailable()) {
      return { spoken: false, reason: 'Speech is not available on this device/browser.' }
    }

    if (!started) {
      return { spoken: false, reason: 'Tap Start Coach first.' }
    }

    return new Promise((resolve) => {
      const synth = window.speechSynthesis
      synth.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      utterance.onend = () => resolve({ spoken: true })
      utterance.onerror = () => resolve({ spoken: false, reason: 'Coach audio failed. Text prompts still work.' })
      synth.speak(utterance)
    })
  }

  const stop = () => {
    if (!isAvailable()) return
    window.speechSynthesis.cancel()
  }

  return {
    start,
    speak,
    stop,
    isAvailable,
  }
}
