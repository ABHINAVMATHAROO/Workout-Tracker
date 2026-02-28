import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import TrainCoachCard from './components/TrainCoachCard'
import { DEFAULT_COACH_SETTINGS, getFallbackLine } from './coachConstants'
import { createCoachAudio } from './coachAudio'
import { selectCoachLine } from './coachManifest'
import type { CoachMode, CoachRuntimeState, CoachSettings } from './types'

type CoachModeViewProps = {
  userId: string | null
}

const MAX_RECENT_CLIP_IDS = 6

const normalizeCoachSettings = (value: unknown): CoachSettings => {
  const parsed = (value ?? {}) as Partial<CoachSettings>
  return {
    mode: parsed.mode === 'encourage' ? 'encourage' : 'roast',
    intervalSeconds:
      typeof parsed.intervalSeconds === 'number' && Number.isFinite(parsed.intervalSeconds)
        ? Math.max(20, Math.min(300, Math.round(parsed.intervalSeconds)))
        : DEFAULT_COACH_SETTINGS.intervalSeconds,
    voice: typeof parsed.voice === 'string' && parsed.voice.trim() ? parsed.voice : DEFAULT_COACH_SETTINGS.voice,
    enabled: Boolean(parsed.enabled),
  }
}

export default function CoachModeView({ userId }: CoachModeViewProps) {
  const [coachSettings, setCoachSettings] = useState<CoachSettings>(DEFAULT_COACH_SETTINGS)
  const [runtimeState, setRuntimeState] = useState<CoachRuntimeState>('idle')
  const [coachStatus, setCoachStatus] = useState('Start Coach for periodic motivation. Use Freeform Prompt for extra clips.')
  const [recentClipIds, setRecentClipIds] = useState<string[]>([])

  const audio = useMemo(() => createCoachAudio(), [])

  const timerRef = useRef<number | null>(null)
  const runtimeRef = useRef(runtimeState)
  const coachSettingsRef = useRef(coachSettings)
  const recentClipIdsRef = useRef(recentClipIds)

  useEffect(() => {
    runtimeRef.current = runtimeState
  }, [runtimeState])
  useEffect(() => {
    coachSettingsRef.current = coachSettings
  }, [coachSettings])
  useEffect(() => {
    recentClipIdsRef.current = recentClipIds
  }, [recentClipIds])

  const saveCoachSettings = useCallback(
    async (next: CoachSettings) => {
      if (!userId) return
      await setDoc(
        doc(db, 'users', userId),
        {
          coachSettings: {
            ...next,
            updatedAt: serverTimestamp(),
          },
        },
        { merge: true }
      )
    },
    [userId]
  )

  useEffect(() => {
    if (!userId) return
    void (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', userId))
        const loaded = normalizeCoachSettings(snap.data()?.coachSettings)
        setCoachSettings(loaded)
      } catch {
        setCoachStatus('Could not load coach settings. Using defaults for this session.')
      }
    })()
  }, [userId])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const appendRecentClipId = useCallback((clipId: string | undefined) => {
    if (!clipId) return
    setRecentClipIds((prev) => [clipId, ...prev].slice(0, MAX_RECENT_CLIP_IDS))
  }, [])

  const playCoachSelection = useCallback(
    async (selection: { line: string; audioUrl?: string; clipId?: string }, fallbackSuffix?: string) => {
      setCoachStatus(selection.line)
      appendRecentClipId(selection.clipId)

      if (!selection.audioUrl) return
      try {
        await audio.playUrl(selection.audioUrl)
      } catch {
        if (fallbackSuffix) {
          setCoachStatus(`${selection.line} ${fallbackSuffix}`)
        }
      }
    },
    [appendRecentClipId, audio]
  )

  const scheduleNextTick = useCallback(
    (delayMs: number) => {
      clearTimer()
      if (runtimeRef.current !== 'running') return
      if (document.visibilityState !== 'visible') return
      timerRef.current = window.setTimeout(() => {
        void tickCoachLine()
      }, delayMs)
    },
    [clearTimer]
  )

  const tickCoachLine = useCallback(async () => {
    if (runtimeRef.current !== 'running') return
    if (document.visibilityState !== 'visible') return

    const mode = coachSettingsRef.current.mode
    const selection = await selectCoachLine({
      mode,
      intent: 'periodic',
      excludedClipIds: recentClipIdsRef.current,
    })

    if (selection) {
      await playCoachSelection(selection, 'Audio clip failed; text remains visible.')
    } else {
      const fallbackLine = getFallbackLine(mode, Date.now())
      setCoachStatus(fallbackLine)
    }

    scheduleNextTick(coachSettingsRef.current.intervalSeconds * 1000)
  }, [playCoachSelection, scheduleNextTick])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        clearTimer()
        audio.stop()
        return
      }
      if (runtimeRef.current === 'running') {
        scheduleNextTick(600)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [audio, clearTimer, scheduleNextTick])

  useEffect(() => {
    return () => {
      clearTimer()
      audio.stop()
    }
  }, [audio, clearTimer])

  const updateCoachSettings = useCallback(
    (patch: Partial<CoachSettings>) => {
      setCoachSettings((prev) => {
        const next = { ...prev, ...patch }
        void saveCoachSettings(next)
        return next
      })
    },
    [saveCoachSettings]
  )

  const handleStartCoach = () => {
    if (runtimeRef.current === 'running') return
    setRuntimeState('starting')
    setCoachStatus('Coach starting...')
    updateCoachSettings({ enabled: true })
    setRuntimeState('running')
    runtimeRef.current = 'running'
    clearTimer()
    void tickCoachLine()
  }

  const handlePauseCoach = () => {
    clearTimer()
    audio.stop()
    setRuntimeState('paused')
    runtimeRef.current = 'paused'
    updateCoachSettings({ enabled: false })
    setCoachStatus('Coach paused.')
  }

  const handleResumeCoach = () => {
    setRuntimeState('running')
    runtimeRef.current = 'running'
    updateCoachSettings({ enabled: true })
    setCoachStatus('Coach resumed.')
    scheduleNextTick(400)
  }

  const handleStopCoach = () => {
    clearTimer()
    audio.stop()
    setRuntimeState('idle')
    runtimeRef.current = 'idle'
    updateCoachSettings({ enabled: false })
    setCoachStatus('Coach stopped.')
  }

  const handleTriggerFreeform = () => {
    void (async () => {
      const selection = await selectCoachLine({
        mode: coachSettingsRef.current.mode,
        intent: 'freeform',
        excludedClipIds: recentClipIdsRef.current,
      })

      if (selection) {
        await playCoachSelection(selection, 'Audio clip failed; text remains visible.')
        return
      }

      const fallback = getFallbackLine(coachSettingsRef.current.mode, Date.now())
      setCoachStatus(fallback)
    })()
  }

  const handleSelectMode = (mode: CoachMode) => {
    updateCoachSettings({ mode })
    setCoachStatus(mode === 'roast' ? 'Roast mode active.' : 'Encourage mode active.')
  }

  const canTriggerFreeform = runtimeState === 'running' || runtimeState === 'paused'

  return (
    <TrainCoachCard
      mode={coachSettings.mode}
      runtimeState={runtimeState}
      canTriggerFreeform={canTriggerFreeform}
      onSelectMode={handleSelectMode}
      onStartCoach={handleStartCoach}
      onPauseCoach={handlePauseCoach}
      onResumeCoach={handleResumeCoach}
      onStopCoach={handleStopCoach}
      onTriggerFreeform={handleTriggerFreeform}
      status={coachStatus}
    />
  )
}
