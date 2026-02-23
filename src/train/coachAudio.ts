export type CoachAudio = {
  playUrl: (url: string) => Promise<void>
  stop: () => void
}

export const createCoachAudio = (): CoachAudio => {
  let currentAudio: HTMLAudioElement | null = null

  const stop = () => {
    if (!currentAudio) return
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio.src = ''
    currentAudio = null
  }

  const playUrl = async (url: string) => {
    stop()
    const audio = new Audio()
    audio.preload = 'none'
    audio.src = url
    currentAudio = audio

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        if (currentAudio === audio) {
          currentAudio = null
        }
        resolve()
      }
      audio.onerror = () => {
        if (currentAudio === audio) {
          currentAudio = null
        }
        reject(new Error('Audio playback failed.'))
      }

      void audio.play().catch((error) => {
        if (currentAudio === audio) {
          currentAudio = null
        }
        reject(error)
      })
    })
  }

  return {
    playUrl,
    stop,
  }
}
